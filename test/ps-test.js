const tasklist = require('tasklist')

tasklist({verbose: true}).then(result => {
  result = result.filter(task => {
    if (task === undefined) { return true }
    return task.windowTitle !== 'N/A'
  })

  console.log(result)
})