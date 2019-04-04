/*
Adapted from tasklist, but with proper UTF-8
encodings
*/

'use strict'
const childProcess = require('child_process')
const pify = require('pify')
const neatCsv = require('neat-csv')
const sec = require('sec')

export default () => {
  if (process.platform !== 'win32') {
    return Promise.reject(new Error('Windows only'))
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
  return pify(childProcess.exec)(
    cmd, {encoding: 'UTF-8'}
  ).then(stdout => {
    // `INFO:` means no matching tasks. See #9.
    let starts = stdout.startsWith('INFO:')
    if (starts) {
      return []
    } else {
      // console.log(utf8.encode(stdout))
      return neatCsv(stdout, {headers})
    }
  }).then(data => data.map(task => {
    // Normalize task props
    task.pid = Number(task.pid)
    task.sessionNumber = Number(task.sessionNumber)
    task.memUsage = Number(task.memUsage.replace(/[^\d]/g, '')) * 1024
    // task.windowTitle = utf8.decode(task.windowTitle)
    task.cpuTime = sec(task.cpuTime)
    return task
  }))
}
