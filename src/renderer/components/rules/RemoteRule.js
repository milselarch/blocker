import Misc from '@/misc.js'
import Enum from '@/Enum.js'
import assert from '@/assert.js'
import BaseRule from './BaseRule'

const _ = require('lodash')
// import Misc from '@/misc.js'
// import { program } from 'babel-types'

const ALLOWED_TYPES = Enum('text', 'wildcard', 'regex')

class RemoteRule extends BaseRule {
  static nameTypes = ALLOWED_TYPES;
  static programTypes = ALLOWED_TYPES;
  static RULE_TYPE = 'REMOTE'

  constructor ({
    ruleType = RemoteRule.RULE_TYPE,
    platform = null,
    blockDuration = 300,
    lockTime = 300,
    locked = false,
    timestamp = null,
    ID = null,
    saved = false,

    programs = [],

    onlyActiveUsage = false,
    enableAllowance = false,
    dailyAllowance = 0,
    maxAllowance = 3600 * 24
  }) {
    // console.log('R-CONSTRUCT', Object.keys(arguments[0]))
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

    self.setPrograms = (programs) => {
      for (let i = 0; i < programs.length; i++) {
        Misc.assert(Array.isArray(programs[i]))
        const [program, windowName] = programs[i]
        Misc.assert(typeof program === 'string')
        Misc.assert(typeof windowName === 'string')
      }

      self.programs = programs
    }

    self.setOnlyActiveUsage = (onlyActiveUsage) => {
      assert(typeof (onlyActiveUsage) === 'boolean')
      self.onlyActiveUsage = onlyActiveUsage
    }

    self.setDailyAllowance = (dailyAllowance) => {
      assert(typeof (dailyAllowance) === 'number')
      assert(dailyAllowance >= 0)
      self.dailyAllowance = dailyAllowance
    }
    self.setMaxAllowance = (maxAllowance) => {
      assert(typeof (maxAllowance) === 'number')
      assert(maxAllowance >= 0)
      self.maxAllowance = maxAllowance
    }
    self.setEnableAllowance = (enable) => {
      self.enableAllowance = enable
    }

    self.testValue = (value, pattern) => {
      pattern = new RegExp(pattern)
      return value.match(pattern) !== null
    }

    self.setOnlyActiveUsage(onlyActiveUsage)
    self.setEnableAllowance(enableAllowance)
    self.setDailyAllowance(dailyAllowance)
    self.setMaxAllowance(maxAllowance)
    self.setPrograms(programs)
  }

  hasChanged = (data) => this._hasChanged(data)
  _hasChanged ({
    programs = null,
    blockDuration = null,

    platform = null,
    lockTime = null,
    locked = null,
    timestamp = null,
    saved = null,

    onlyActiveUsage = null,
    enableAllowance = null,
    dailyAllowance = null,
    maxAllowance = null
  }) {
    const self = this
    if (programs === null) { programs = this.programs }
    if (enableAllowance === null) { enableAllowance = this.enableAllowance }
    if (dailyAllowance === null) { dailyAllowance = this.dailyAllowance }
    if (onlyActiveUsage === null) { onlyActiveUsage = this.onlyActiveUsage }
    if (maxAllowance === null) { maxAllowance = this.maxAllowance }

    return super._hasChanged({
      platform,
      blockDuration,
      lockTime,
      locked,
      timestamp,
      saved
    }) || (
      _.isEqual(programs, self.programs) ||
      onlyActiveUsage !== this.onlyActiveUsage ||
      enableAllowance !== this.enableAllowance ||
      dailyAllowance !== this.dailyAllowance ||
      maxAllowance !== this.maxAllowance
    )
  }

  jsonify = () => this._jsonify()
  _jsonify () {
    const ruleJson = {
      name: this.name,
      nameType: this.nameType,
      programName: this.programName,
      programType: this.programType,
      onlyActiveUsage: this.onlyActiveUsage,
      enableAllowance: this.enableAllowance,
      dailyAllowance: this.dailyAllowance,
      maxAllowance: this.maxAllowance
    }

    return super._jsonify(ruleJson)
  }

  test = (data) => this._test(data)
  _test ({ tasks = [] }) {
    const self = this
    const blockedTasks = tasks.filter(task => {
      return self.testTask(task)
    })

    // console.log('BLOCKED-TASKS', blockedTasks)
    const blocked = blockedTasks.length > 0
    return [blocked, blockedTasks]
  }

  testTask = (task) => this._testTask(task)
  _testTask (task) {
    const self = this
    if (task.platform !== self.platform) {
      return false
    }

    for (let i = 0; i < self.programs.length; i++) {
      const [program, windowName] = self.programs[i]
      const nameMatch = self.testValue(task.name, windowName)
      const programMatch = self.testValue(task.program, program)
      if (nameMatch && programMatch) {
        return true
      }
    }

    return false
  }
}

export default RemoteRule
