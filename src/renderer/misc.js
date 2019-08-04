function getCounterTime () {
  return performance.now() / 1000
}

let START_TIME = null

function regExpEscape (s) {
  return s.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')
}

class Misc {
  countWords (string) {
    return string.trim().split(/\s+/).length
  }

  getDaysFromEpoch (date) {
    if (date === undefined) {
      date = new Date()
    }

    // 8.64e7 is no of milliseconds per day
    const fullDaysSinceEpoch = Math.floor(date / 8.64e7)
    return fullDaysSinceEpoch
  }

  getSecondsLeft (start, duration, timeNow) {
    if (timeNow === undefined) {
      timeNow = (new Date()).getTime()
    } else if (timeNow instanceof Date) {
      timeNow = timeNow.getTime()
    }

    const timePassed = Math.floor(
      (timeNow - start) / 1000
    )

    const secondsLeft = duration - timePassed
    // console.log('SE-LEFT', duration, timePassed, secondsLeft)
    return Math.max(0, secondsLeft)
  }

  getDayStartSecs (dateObj) {
    const dayStartDate = new Date(dateObj)
    dayStartDate.setHours(0, 0, 0, 0)
    return dayStartDate.getTime() / 1000
  }

  getVarStringName (varObject) {
    // Misc.getVarStringName({d}) returns 'd'
    return Object.keys(varObject)[0]
  }

  sleepAsync (ms) {
    return new Promise((resolve, reject) => {
      setTimeout(resolve, ms)
    })
  }

  getDuplicates (array) {
    const sortedArr = array.slice().sort()
    let results = []

    for (let i = 0; i < sortedArr.length - 1; i++) {
      if (sortedArr[i + 1] === sortedArr[i]) {
        results.push(sortedArr[i])
      }
    }

    return results
  }

  getTimePassed () {
    if (START_TIME === null) {
      START_TIME = getCounterTime()
    }

    return getCounterTime() - START_TIME
  }

  wildcardToRegExp (s) {
    return new RegExp(
      '^' + s.split(/\*+/).map(regExpEscape).join('.*') + '$'
    )
  }

  constructor () {
    const self = this

    self.hasDuplicates = (array) => {
      return self.getDuplicates(array).length > 0
    }
  }
}

export default new Misc()
