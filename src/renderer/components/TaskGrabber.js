import tasky from './tasky'
const OS = require('os')
const psList = require('ps-list')
const electron = require('electron')

const platform = OS.platform()
const PID = process.pid
const RENDER_PID = electron.remote.getCurrentWebContents().getOSProcessId()

class Task {
  constructor (pid, name, program, CPU) {
    this.pid = pid
    this.platform = platform

    this.name = name
    this.program = program
    this.CPU = CPU
  }
}

class TaskGrabber {
  async getWindowsTasks () {
    return (
      await tasky()
    ).filter(task => {
      if (task === undefined) { return true }
      return task.windowTitle !== 'N/A'
    }).map(task => {
      /*
      const keys = Object.keys(task)
      for (let key in keys) {
        if (typeof task[key] === 'string') {
          task[key] = utf8.encode(task[key])
        }
      }
      */

      return new Task(
        task.pid,
        task.windowTitle,
        task.imageName,
        task.cpuTime
      )
    })
  }

  async getUnixTasks () {
    /*
    { pid: 1860,
    name: '(sd-pam)',
    cmd: '(sd-pam)',
    ppid: 1852,
    uid: 1000,
    cpu: 0,
    memory: 0 },
    */

    return (
      await psList()
    ).filter(task => {
      const cmd = task.cmd
      const wrapChars = cmd[0] + cmd[cmd.length - 1]
      if (wrapChars === '[]' || wrapChars === '()') {
        return false
      }

      return true
    }).map(task => {
      return new Task(
        task.pid,
        task.name,
        task.cmd,
        task.cpu
      )
    })
  }

  getUniqueTasks (tasks) {
    const uniqueTasks = []

    tasks.map(currentTask => {
      let isUnique = true
      for (let i = 0; i < uniqueTasks.length; i++) {
        if (
          (uniqueTasks[i].name === currentTask.name) &&
          (uniqueTasks[i].program === currentTask.program)
        ) {
          isUnique = false
          break
        }
      }

      if (isUnique && currentTask.CPU > 0) {
        uniqueTasks.push(currentTask)
      }
    })

    return uniqueTasks
  }

  async getAll () {
    let tasks

    if (platform === 'win32') {
      tasks = await this.getWindowsTasks()
    } else {
      tasks = await this.getUnixTasks()
    }

    tasks = tasks.filter(task => {
      if (
        (task.pid === PID) ||
        (task.pid === RENDER_PID)
      ) {
        return false
      }

      return true
    })
    const uniqueTasks = this.getUniqueTasks(tasks)
    return uniqueTasks
  }
}

export default new TaskGrabber()
