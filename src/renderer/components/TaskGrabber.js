import Tasky from './tasky'
const tasky = new Tasky()

const OS = require('os')
// const getPpid = require('parent-process-pid')
// const electron = require('electron')

const platform = OS.platform()
const BLOCKED_PIDS = [
  require('electron').remote.getCurrentWebContents().getOSProcessId(),
  require('electron').remote.process.pid
]

console.log(`BLOCKED_PIDS ${BLOCKED_PIDS}`)

class TaskGrabber {
  async getWindowsTasks () {
    return (
      await tasky.getWindowsTasks()
    ).filter(task => {
      if (task === undefined) { return true }
      return task.name !== 'N/A'
    })
  }

  async getUnixTasks () {
    return (
      await tasky.getUnixTasks({all: false})
    ).filter(task => {
      const program = task.program
      const wrapChars = program[0] + program[program.length - 1]
      if (wrapChars === '[]' || wrapChars === '()') { return false }
      return true
    })
  }

  getUniqueTasks (tasks) {
    const uniqueTasks = []
    const taskMapping = {}

    tasks.map(currentTask => {
      let isUnique = true
      const name = currentTask.name
      const program = currentTask.program

      if (taskMapping[name] === undefined) {
        taskMapping[name] = {}
      } else if (taskMapping[name][program] === undefined) {
        taskMapping[name][program] = true
      } else {
        isUnique = false
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
      }

      if (task.name === process.env.TITLE) {
        return false
      }

      return true
    })

    const uniqueTasks = this.getUniqueTasks(tasks)
    return uniqueTasks
  }
}

export default new TaskGrabber()
