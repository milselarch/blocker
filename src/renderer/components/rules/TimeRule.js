import Misc from '@/misc.js'
import Enum from '@/Enum.js'
import assert from '@/assert.js'
import BaseRule from './BaseRule'
import moment from 'moment'
// import Misc from '@/misc.js'
// import { program } from 'babel-types'
const crypto = require('crypto')
const OS = require('os')

class TimeRule extends BaseRule {
  static nameTypes = ALLOWED_TYPES;
  static programTypes = ALLOWED_TYPES;
  static RULE_TYPE = 'TIME-OF-DAY'

  constructor ({
    ruleType = Rule.RULE_TYPE,
    platform = null,
    blockDuration = 300,
    lockTime = 300,
    locked = false,
    timestamp = null,
    ID = null,
    saved = false,

    startTime=moment.duration({hours: 22}),
    endTime=moment.duration({hours: 6}),
    startWait=moment.duration({hours: 0})
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

  setStartTime = (startTime) => this._setStartTime(startTime)
  _setStartTime (startTime) {
    this.startTime = startTime
  }
  setEndTime = (endTime) => this._setEndTime(endTime)
  _setEndTime(endTime) {
    this.endTime = endTime
  }
  setStartWait = (startWait) => this._setStartWait(startWait)
  _setStartWait(startWait) {
    this.startWait = startWait
  }

  hasChanged = (data) => this._hasChanged(data)
  _hasChanged ({
    startTime=null,
    endTime=null,
    startWait=null,

    platform = null,
    blockDuration = null,
    lockTime = null,
    locked = null,
    timestamp = null,
    saved = null
  }) {
    if (startTime === null) { startTime = moment.duration({hours: 22}) }
    if (endTime === null) { endTime = moment.duration({hours: 6}) }
    if (startWait === null) { startWait = moment.duration({hours: 0}) }

    return super._hasChanged({
      platform,
      blockDuration,
      lockTime,
      locked,
      timestamp,
      saved
    }) || (
      startTime !== this.startTime ||
      endTime !== this.endTime ||
      startWait !== this.startWait
    )
  }

  jsonify = () => this._jsonify()
  _jsonify () {
    const ruleJson = {
      startTime: this.startTime,
      endTime: this.endTime,
      startWait: this.startWait
    }

    return super._jsonify(ruleJson)
  }
}

export default TimeRule
