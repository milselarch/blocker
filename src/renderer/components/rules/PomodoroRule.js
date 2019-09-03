import BaseRule from './BaseRule'
import Enum from '@/Enum.js'
import Misc from '@/misc.js'

const STATES = Enum(
  'unblock',
  'ongoing',
  'break',
  'prompt'
)

class PomodoroRule extends BaseRule {
  static RULE_TYPE = 'POMODORO'
  static STATES = STATES

  constructor ({
    ruleType = PomodoroRule.RULE_TYPE,
    platform = null,
    blockDuration = 300,
    lockTime = 300,
    locked = false,
    timestamp = null,
    ID = null,
    saved = false,

    optIn = false,
    duration = 25,
    shortBreak = 5,
    longBreak = 15
  }) {
    super({
      ruleType,
      platform,
      blockDuration,
      lockTime,
      locked,
      timestamp,
      ID,
      saved
    })

    const self = this

    self.setDuration(duration)
    self.setShortBreak(shortBreak)
    self.setLongBreak(longBreak)
    self.setOptIn(optIn)
  }

  setOptIn = (optIn) => this._setOptIn(optIn)
  _setOptIn (optIn) {
    this.optIn = optIn
  }

  setLongBreak = (longBreak) => this._setLongBreak(longBreak)
  _setLongBreak (longBreak) {
    this.longBreak = longBreak
  }

  setShortBreak = (shortBreak) => this._setShortBreak(shortBreak)
  _setShortBreak (shortBreak) {
    this.shortBreak = shortBreak
  }

  setDuration = (duration) => this._setDuration(duration)
  _setDuration (duration) {
    this.duration = duration
  }

  hasChanged = (data) => this._hasChanged(data)
  _hasChanged ({
    duration = null,
    shortBreak = null,
    longBreak = null,
    optIn = null,

    platform = null,
    blockDuration = null,
    lockTime = null,
    locked = null,
    timestamp = null,
    saved = null
  }) {
    if (duration === null) { duration = this.duration }
    if (shortBreak === null) { shortBreak = this.shortBreak }
    if (longBreak === null) { longBreak = this.longBreak }
    if (optIn === null) { optIn = this.optIn }

    /*
    console.log(
      [duration, this.duration, duration !== this.duration],
      [shortBreak, this.shortBreak, shortBreak !== this.shortBreak],
      [longBreak, this.longBreak, longBreak !== this.longBreak]
    )
    */

    return super._hasChanged({
      platform,
      blockDuration,
      lockTime,
      locked,
      timestamp,
      saved
    }) || (
      duration !== this.duration ||
      shortBreak !== this.shortBreak ||
      longBreak !== this.longBreak ||
      optIn !== this.optIn
    )
  }

  jsonify = () => this._jsonify()
  _jsonify () {
    const ruleJson = {
      duration: this.duration,
      shortBreak: this.shortBreak,
      longBreak: this.longBreak,
      optIn: this.optIn
    }

    return super._jsonify(ruleJson)
  }

  test = (data) => this._test(data)
  _test ({
    start = null,
    pomodoroNo = 1,
    timeNow = null
  }) {
    if (start === null) {
      start = (new Date()).getTime()
    } else if (start instanceof Date) {
      start = start.getTime()
    }

    if (timeNow === null) {
      timeNow = (new Date()).getTime()
    } else if (timeNow instanceof Date) {
      timeNow = timeNow.getTime()
    }

    let breakMillis
    if (pomodoroNo === 3) {
      breakMillis = this.longBreak * 60 * 1000
    } else {
      breakMillis = this.shortBreak * 60 * 1000
    }

    const durationMillis = this.duration * 60 * 1000
    const endPomodoro = start + durationMillis
    const endBreak = endPomodoro + breakMillis
    let state = STATES.unblock

    if (timeNow > endBreak) {
      state = STATES.prompt
    } if ((endBreak > timeNow) && (timeNow > endPomodoro)) {
      state = STATES.break
    } else if ((endPomodoro > timeNow) && (timeNow > start)) {
      state = STATES.ongoing
    }

    // console.log('STATE', state, timeNow, endBreak)
    return state
  }

  secondsLeft = (start) => this._secondsLeft(start)
  _secondsLeft (start, duration) {
    if (duration === undefined) { duration = this.duration }
    return Misc.getSecondsLeft(start, this.duration * 60)
  }
}

export default PomodoroRule
