function getCounterTime () {
  return performance.now() / 1000
}

let START_TIME = null

function regExpEscape (s) {
  return s.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')
}

class Misc {
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
