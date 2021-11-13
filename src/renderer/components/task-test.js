/* eslint-disable no-unused-vars */
'use strict'
const OS = require('os')
const util = require('util')
const path = require('path')
const childProcess = require('child_process')

const TEN_MEGABYTES = 1000 * 1000 * 10
const execFile = util.promisify(childProcess.execFile)
const psFields = 'pid,ppid,uid,%cpu,%mem,comm,args'
const psOutputRegex = /^[ \t]*(?<pid>\d+)[ \t]+(?<ppid>\d+)[ \t]+(?<uid>\d+)[ \t]+(?<cpu>\d+\.\d+)[ \t]+(?<memory>\d+\.\d+)[ \t](?<comm>\d+)[ \t]+(?<args>\d+)[ \t]+/
const ERROR_MESSAGE_PARSING_FAILED = 'ps output parsing failed'
const platform = OS.platform()

class Task {
  static platform = platform

  constructor (pid, name, program, CPU) {
    this.pid = pid

    this.name = name
    this.program = program
    this.CPU = CPU
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

const assert = (condition) => {
  if (!condition) {
    // const err = new Error()
    // console.error(err.stack)
    throw new Error(`��� ASSERTION FAILED ���`)
  }
}

const nonWindowsMultipleCalls = async (options = {}) => {
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
      console.log('VALWW', value)

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
      }
    }
  }))

  for (const task of tasks) {
    task.print()
  }
  console.log(tasks.length)
}

nonWindowsMultipleCalls()
