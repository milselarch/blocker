const tasklist = require('./tasky.js')

tasklist({verbose: true}).then(result => {
  result = result.filter(task => {
    if (task.cpuTime < 50) { return false }
    if (task === undefined) { return true }
    return task.windowTitle !== 'N/A'
  })

  console.log(result)
})
