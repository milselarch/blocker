import assertFunc from '@/assert.js'
const crypto = require('crypto')

function getCounterTime () {
  return performance.now() / 1000
}

let START_TIME = null

function regExpEscape (s) {
  return s.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')
}

class Misc {
  assert (cond) { return assertFunc(cond) }

  countWords (string) {
    let words = string.trim().split(/\s+/)
    return words.length
  }

  countUniqueWords (string) {
    const words = string.trim().split(/\s+/)
    const uniqueWords = [...new Set(words)]
    const index = uniqueWords.indexOf('')
    if (index !== -1) {
      uniqueWords.splice(index, 1)
    }

    // console.log('UWORDS', uniqueWords)
    return uniqueWords.length
  }

  makeHash (string) {
    const hasher = crypto.createHash('sha256')
    hasher.update(string)
    const passhash = hasher.digest('hex')
    return passhash
  }

  makeSecret (length) {
    if (length === undefined) { length = 5 }
    return crypto.randomBytes(length).toString('hex')
  }

  stopAndRemoveTrack (mediaStream) {
    return (track) => {
      track.stop()
      mediaStream.removeTrack(track)
    }
  }

  stopMediaStream (mediaStream) {
    if (!mediaStream) {
      return
    }

    mediaStream.getTracks().forEach((track) => {
      track.stop()
      mediaStream.removeTrack(track)
    })
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
