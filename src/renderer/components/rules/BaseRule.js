import assert from '@/assert.js'
const crypto = require('crypto')
const OS = require('os')

class BaseRule {
  static RULE_TYPE = 'BASERULE'

  constructor ({
    ruleType = null,
    platform = null,
    blockDuration = 300,
    lockTime = 300,
    locked = false,
    timestamp = null,

    ID = null,
    saved = false
  }) {
    const self = this
    // console.log('CONSTRUCTOR', ruleType, self.constructor.RULE_TYPE)
    assert(ruleType !== null)
    assert(ruleType === self.constructor.RULE_TYPE)
    self.saved = saved

    self.setBlockDuration = (blockDuration) => {
      self.blockDuration = blockDuration
    }
    self.setLockTime = (lockTime) => {
      self.lockTime = lockTime
    }
    self.setPlatform = (platform) => {
      if (platform === null) {
        platform = OS.platform()
      }
      self.platform = platform
    }
    self.setLockStatus = (lockStatus) => {
      self.locked = lockStatus
    }
    self.lock = () => {
      self.locked = true
    }
    self.unlock = () => {
      self.locked = false
    }
    self.setTimestamp = (timestamp) => {
      if (timestamp === null) {
        timestamp = (new Date()).getTime()
      }
      self.timestamp = timestamp
    }
    self.setID = (ID) => {
      assert(typeof self.timestamp === 'number')
      const rand = crypto.randomBytes(20).toString('hex')
      if (ID === null) {
        const stamp = String(parseInt(self.timestamp * 1000))
        ID = stamp + '-' + rand
      }

      this.ID = ID
    }

    self.save = () => {
      self.saved = true
    }

    self.setBlockDuration(blockDuration)
    self.setTimestamp(timestamp)
    self.setLockStatus(locked)
    self.setPlatform(platform)
    self.setLockTime(lockTime)
    self.setID(ID)
  }

  hasChanged = (data) => this._hasChanged(data)
  _hasChanged ({
    platform = null,
    blockDuration = null,
    lockTime = null,
    locked = null,
    timestamp = null,
    saved = null
  }) {
    if (platform === null) { platform = this.platform }
    if (blockDuration === null) { blockDuration = this.blockDuration }
    if (lockTime === null) { lockTime = this.lockTime }
    if (locked === null) { locked = this.locked }
    if (timestamp === null) { timestamp = this.timestamp }
    if (saved === null) { saved = this.saved }

    return (
      platform !== this.platform ||
      blockDuration !== this.blockDuration ||
      lockTime !== this.lockTime ||
      locked !== this.locked ||
      timestamp !== this.timestamp ||
      saved !== this.saved
    )
  }

  jsonify = (json) => this._jsonify(json)
  _jsonify (extraRuleJson = {}) {
    const self = this
    const ruleJson = {
      ruleType: self.constructor.RULE_TYPE,
      platform: self.platform,
      blockDuration: self.blockDuration,
      lockTime: self.lockTime,
      timestamp: self.timestamp,
      locked: self.locked,
      ID: self.ID,
      saved: self.saved
    }

    for (let prop in extraRuleJson) {
      // ensure extraRuleJson and ruleJson don't have
      // overlapping properties
      if (!extraRuleJson.hasOwnProperty(prop)) { continue }
      assert(!ruleJson.hasOwnProperty(prop))
      ruleJson[prop] = extraRuleJson[prop]
    }

    return ruleJson
  }
}

export default BaseRule
