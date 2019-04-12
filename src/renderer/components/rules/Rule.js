import Misc from '@/misc.js'
import Enum from '@/Enum.js'
import assert from '@/assert.js'
// import Misc from '@/misc.js'
// import { program } from 'babel-types'
const crypto = require('crypto')
const OS = require('os')

const ALLOWED_TYPES = Enum('text', 'wildcard', 'regex')

class Rule {
  static nameTypes = ALLOWED_TYPES;
  static programTypes = ALLOWED_TYPES;
  static RULE_TYPE = 'RULE'

  constructor ({
    ruleType = Rule.RULE_TYPE,
    name = '',
    nameType = 'text',
    programName = '',
    programType = 'text',
    platform = null,
    blockDuration = 300,
    lockTime = 300,
    locked = false,
    timestamp = null,

    ID = null,
    saved = false
  }) {
    const self = this
    assert(ruleType === Rule.RULE_TYPE)
    self.saved = saved

    self.setName = (name, nameType) => {
      assert(Rule.nameTypes.includes(nameType))
      self.name = name
      self.nameType = nameType
    }
    self.setProgram = (programName, programType) => {
      assert(Rule.programTypes.includes(programType))
      self.programName = programName
      self.programType = programType
    }
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

    self.jsonify = () => {
      return {
        ruleType: Rule.RULE_TYPE,
        name: self.name,
        nameType: self.nameType,
        programName: self.programName,
        programType: self.programType,
        platform: self.platform,
        blockDuration: self.blockDuration,
        lockTime: self.lockTime,
        timestamp: self.timestamp,
        locked: self.locked,
        ID: self.ID,
        saved: self.saved
      }
    }

    self.testTask = (task) => {
      if (task.platform !== self.platform) {
        return false
      }

      const nameMatch = self.testValue(task.name, self.name, self.nameType)
      const programMatch = self.testValue(task.program, self.programName, self.programType)
      return nameMatch && programMatch
    }

    self.testValue = (value, pattern, patternType) => {
      if (patternType === ALLOWED_TYPES.text) {
        value = value.replace(/\?.*$/, '')
        return value === pattern
      } else if (patternType === ALLOWED_TYPES.wildcard) {
        pattern = Misc.wildcardToRegExp(pattern)
        return value.match(pattern) !== null
      } else if (patternType === ALLOWED_TYPES.regex) {
        pattern = new RegExp(pattern)
        return value.match(pattern) !== null
      } else {
        throw new Error(`BAD PATTERN TYPE ${patternType}`)
      }
    }

    self.hasChanged = ({
      name = null,
      nameType = null,
      programName = null,
      programType = null,
      platform = null,
      blockDuration = null,
      lockTime = null,
      locked = null,
      timestamp = null,
      saved = null
    }) => {
      if (name === null) { name = self.name }
      if (nameType === null) { nameType = self.nameType }
      if (programName === null) { programName = self.programName }
      if (programType === null) { programType = self.programType }
      if (platform === null) { platform = self.platform }
      if (blockDuration === null) { blockDuration = self.blockDuration }
      if (lockTime === null) { lockTime = self.lockTime }
      if (locked === null) { locked = self.locked }
      if (timestamp === null) { timestamp = self.timestamp }
      if (saved === null) { saved = self.saved }

      return (
        name !== self.name ||
        nameType !== self.nameType ||
        programName !== self.programName ||
        programType !== self.programType ||
        platform !== self.platform ||
        blockDuration !== self.blockDuration ||
        lockTime !== self.lockTime ||
        locked !== self.locked ||
        timestamp !== self.timestamp ||
        saved !== self.saved
      )
    }

    self.setName(name, nameType)
    self.setProgram(programName, programType)
    self.setBlockDuration(blockDuration)
    self.setTimestamp(timestamp)
    self.setLockStatus(locked)
    self.setPlatform(platform)
    self.setLockTime(lockTime)
    self.setID(ID)
  }
}

export default Rule
