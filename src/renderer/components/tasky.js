/*
Adapted from tasklist, but with proper UTF-8
encodings
*/

'use strict'
// import Misc from '@/misc.js'

const childProcess = require('child_process')
const pify = require('pify')
const neatCsv = require('neat-csv')
const sec = require('sec')
const OS = require('os')
const path = require('path')
const platform = OS.platform()
const util = require('util')
const execFile = util.promisify(childProcess.execFile)
const TEN_MEGABYTES = 1000 * 1000 * 10

class Task {
  static platform = platform

  constructor (pid, name, program, CPU) {
    this.pid = pid

    this.name = name
    this.program = program
    this.CPU = CPU
  }

  get platform () {
    return Task.platform
  }

  setName (name) { this.name = name }
  setProgram (program) { this.program = program }
  setCPU (CPU) { this.CPU = CPU }
  isFilled () {
    return (
      (this.pid !== undefined) &&
      (this.name !== undefined) &&
      (this.program !== undefined) &&
      (this.CPU !== undefined)
    )
  }

  print () {
    console.log(this.pid, this.name, this.program, this.CPU)
  }
}

class Tasky {
  async getWindowsTasks (callback = () => {}) {
    if (process.platform !== 'win32') {
      throw new Error('Windows only')
    }

    const headers = [
      'imageName',
      'pid',
      'sessionName',
      'sessionNumber',
      'memUsage',
      'status',
      'username',
      'cpuTime',
      'windowTitle'
    ]

    const cmd = '@chcp 65001 >nul & tasklist /v /nh /fo csv'
    // childProcess.exec(cmd, {encoding: "UTF-8"}, callback)
    // @chcp 65001 >nul ensures output is UTF-6
    const stdout = await pify(childProcess.exec)(
      cmd, {encoding: 'UTF-8'}
    )

    // `INFO:` means no matching tasks. See #9.
    const tasks = []
    let starts = stdout.startsWith('INFO:')
    if (starts) { return tasks }

    // console.log(utf8.encode(stdout))
    const data = await neatCsv(stdout, {headers})
    for (const rawtask of data) {
      const pid = Number(rawtask.pid)
      const name = rawtask.windowTitle
      const program = rawtask.imageName
      const cpuTime = sec(rawtask.cpuTime)
      const task = new Task(pid, name, program, cpuTime)
      await callback(task)
      tasks.push(task)
    }

    return tasks
  }

  async getUnixTasks (options = {}, callback = () => {}) {
    const headers = ['comm', 'args', '%cpu']
    const flags = (options.all === false ? '' : 'a') + 'wwxo'
    const ret = {}
    const tasks = []

    await Promise.all(headers.map(async cmd => {
      const {stdout} = await execFile(
        'ps', [flags, `pid,${cmd}`], {maxBuffer: TEN_MEGABYTES}
      )

      for (let line of stdout.trim().split('\n').slice(1)) {
        line = line.trim()
        const [pid] = line.split(' ', 1)
        const value = line.slice(pid.length + 1).trim()
        // console.log('VALWW', value)

        if (value === undefined) {
          throw new Error('WTF')
        } else if (ret[pid] === undefined) {
          ret[pid] = new Task(pid)
        }

        if (cmd === 'comm') {
          ret[pid].setName(path.basename(value))
        } else if (cmd === '%cpu') {
          ret[pid].setCPU(Number.parseFloat(value))
        } else if (cmd === 'args') {
          ret[pid].setProgram(value)
        } else {
          throw new Error(`WRONG CMD ${cmd}`)
        }

        if (ret[pid].isFilled()) {
          tasks.push(ret[pid])
          callback(ret[pid])
        }
      }
    }))

    return tasks
  }
}

export default Tasky
