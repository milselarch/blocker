import assert from '@/assert.js'
import BaseRule from './BaseRule'
import moment from 'moment'

class TimeRule extends BaseRule {
  static RULE_TYPE = 'TIME-OF-DAY'

  constructor ({
    ruleType = TimeRule.RULE_TYPE,
    platform = null,
    blockDuration = 300,
    lockTime = 300,
    locked = false,
    timestamp = null,
    ID = null,
    saved = false,

    startTime = moment.duration({hours: 22}),
    endTime = moment.duration({hours: 6}),
    startWait = 0
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

    self.setStartTime(startTime)
    self.setEndTime(endTime)
    self.setStartWait(startWait)
  }

  getMomentStart = () => this._getMomentStart()
  _getMomentStart () {
    const START_MOMENT = moment('00:00:00', 'HH:mm:ss')
    return START_MOMENT.add(
      this.startTime.asSeconds(), 'seconds'
    )
  }
  getMomentEnd = () => this._getMomentEnd()
  _getMomentEnd () {
    const START_MOMENT = moment('00:00:00', 'HH:mm:ss')
    return START_MOMENT.add(
      this.endTime.asSeconds(), 'seconds'
    )
  }

  getStartSecs = () => this._getStartSecs()
  _getStartSecs () {
    return this._getStartTime().asSeconds()
  }
  getEndSecs = () => this._getEndSecs()
  _getEndSecs () {
    return this._getEndTime().asSeconds()
  }

  getStartTime = (isDate = false) => this._getStartTime(isDate)
  _getStartTime (isDate = false) {
    const START_MOMENT = moment('00:00:00', 'HH:mm:ss')
    if (isDate === true) {
      return START_MOMENT.add(
        this.startTime.asSeconds(), 'seconds'
      ).toDate()
    }

    return this.startTime
  }

  getEndTime = (isDate = false) => this._getEndTime(isDate)
  _getEndTime (isDate = false) {
    const START_MOMENT = moment('00:00:00', 'HH:mm:ss')
    if (isDate === true) {
      return START_MOMENT.add(
        this.endTime.asSeconds(), 'seconds'
      ).toDate()
    }

    return this.endTime
  }

  secsFromDayStart = (dateObj) => this._secsFromDayStart(dateObj)
  _secsFromDayStart (dateObj) {
    const dayStartDate = new Date(dateObj)
    // Date.setHours(hour, min, sec, millisec)
    dayStartDate.setHours(0, 0, 0, 0)
    return (dateObj - dayStartDate) / 1000
  }

  setStartTime = (startTime) => this._setStartTime(startTime)
  _setStartTime (startTime) {
    if (typeof startTime === 'string') {
      console.log('STARTSTRING', startTime)
      startTime = parseInt(startTime)
    }

    if (startTime instanceof Date) {
      startTime = moment.duration(
        this.secsFromDayStart(startTime),
        'seconds'
      )
    } else if (typeof startTime === 'number') {
      startTime = moment.duration(startTime, 'seconds')
    }

    // console.log('STARTIME', startTime.asSeconds())
    assert(startTime.asSeconds() < 24 * 3600)
    this.startTime = startTime
  }
  setEndTime = (endTime) => this._setEndTime(endTime)
  _setEndTime (endTime) {
    if (typeof endTime === 'string') {
      endTime = parseInt(endTime)
    }

    if (endTime instanceof Date) {
      endTime = moment.duration(
        this.secsFromDayStart(endTime),
        'seconds'
      )
    } else if (typeof endTime === 'number') {
      endTime = moment.duration(endTime, 'seconds')
    }

    // assert(endTime.constructor.name === 'Duration')
    assert(endTime.asSeconds() < 24 * 3600)
    this.endTime = endTime
  }
  setStartWait = (startWait) => this._setStartWait(startWait)
  _setStartWait (startWait) {
    assert(typeof startWait === 'number')
    assert(startWait < 24 * 3600)
    this.startWait = startWait
  }

  hasChanged = (data) => this._hasChanged(data)
  _hasChanged ({
    startTime = null,
    endTime = null,
    startWait = null,

    platform = null,
    blockDuration = null,
    lockTime = null,
    locked = null,
    timestamp = null,
    saved = null
  }) {
    if (startTime === null) { startTime = this.startTime }
    if (endTime === null) { endTime = this.endTime }
    if (startWait === null) { startWait = 0 }

    let startSeconds, endSeconds
    if (startTime instanceof Date) {
      startSeconds = this.secsFromDayStart(startTime)
    } else {
      startSeconds = startTime.asSeconds()
    }
    if (endTime instanceof Date) {
      endSeconds = this.secsFromDayStart(endTime)
    } else {
      endSeconds = endTime.asSeconds()
    }

    console.log([
      [startSeconds, this.startTime.asSeconds()],
      [endSeconds, this.endTime.asSeconds()],
      [startWait, this.startWait]
    ])

    return super._hasChanged({
      platform,
      blockDuration,
      lockTime,
      locked,
      timestamp,
      saved
    }) || (
      startSeconds !== this.startTime.asSeconds() ||
      endSeconds !== this.endTime.asSeconds() ||
      startWait !== this.startWait
    )
  }

  jsonify = () => this._jsonify()
  _jsonify () {
    const ruleJson = {
      startTime: this.startTime.asSeconds(),
      endTime: this.endTime.asSeconds(),
      startWait: this.startWait
    }

    return super._jsonify(ruleJson)
  }

  test = (data) => this._test(data)
  _test ({
    dateTime = new Date(),
    timeSinceStart = 0
  }) {
    const secondsNow = this.secsFromDayStart(dateTime)
    const endSeconds = this.endTime.asSeconds()
    const startSeconds = this.startTime.asSeconds()
    let blocked = false

    if (timeSinceStart < this.startWait) {
      blocked = true
    } else if (startSeconds > endSeconds) {
      blocked = (
        (secondsNow > startSeconds) ||
        (secondsNow < endSeconds)
      )
    } else {
      blocked = (
        (secondsNow > startSeconds) &&
        (secondsNow < endSeconds)
      )
    }

    return [blocked, []]
  }
}

export default TimeRule
