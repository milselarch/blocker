import tasky from './tasky'
const OS = require('os')
const psList = require('ps-list')
// const getPpid = require('parent-process-pid')
// const electron = require('electron')

const platform = OS.platform()
const BLOCKED_PIDS = [
  require('electron').remote.getCurrentWebContents().getOSProcessId(),
  require('electron').remote.process.pid
]

console.log(`BLOCKED_PIDS ${BLOCKED_PIDS}`)

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

    /*
    for (let k = 0; k < tasks.length; k++) {
      const task = tasks[k]

      if (BLOCKED_PIDS.indexOf(task.pid) !== -1) {
        continue
      }

      let ppid = task.pid
      while (ppid !== null) {
        ppid = await getPpid(ppid)
        if (ppid !== null) { ppid = Number(ppid) }

        console.log(`PPID ${[ppid, BLOCKED_PIDS]}`)
        if (BLOCKED_PIDS.indexOf(ppid) !== -1) {
          BLOCKED_PIDS.push(task.pid)
          console.log('BLOCKED_PIDS', BLOCKED_PIDS)
        }
      }
    }
    */

    tasks = tasks.filter(task => {
      if (BLOCKED_PIDS.indexOf(task.pid) !== -1) {
        return false
      } else if (task.name === process.env.TITLE) {
        return false
      }

      return true
    })
    const uniqueTasks = this.getUniqueTasks(tasks)
    return uniqueTasks
  }
}

export default new TaskGrabber()
