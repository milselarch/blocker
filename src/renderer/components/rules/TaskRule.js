import Misc from '@/misc.js'
import Enum from '@/Enum.js'
import assert from '@/assert.js'
import BaseRule from './BaseRule'
// import Misc from '@/misc.js'
// import { program } from 'babel-types'

const ALLOWED_TYPES = Enum('text', 'wildcard', 'regex')

class TaskRule extends BaseRule {
  static nameTypes = ALLOWED_TYPES;
  static programTypes = ALLOWED_TYPES;
  static RULE_TYPE = 'TASK'

  constructor ({
    ruleType = TaskRule.RULE_TYPE,
    platform = null,
    blockDuration = 300,
    lockTime = 300,
    locked = false,
    timestamp = null,
    ID = null,
    saved = false,

    name = 'test-name',
    nameType = 'text',
    programName = 'test-program',
    programType = 'text',

    onlyActiveUsage = false,
    enableAllowance = false,
    dailyAllowance = 1800,
    maxAllowance = 3600
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

    self.setName = (name, nameType) => {
      assert(TaskRule.nameTypes.includes(nameType))
      self.name = name
      self.nameType = nameType
    }
    self.setProgram = (programName, programType) => {
      assert(TaskRule.programTypes.includes(programType))
      self.programName = programName
      self.programType = programType
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

    self.setName(name, nameType)
    self.setOnlyActiveUsage(onlyActiveUsage)
    self.setEnableAllowance(enableAllowance)
    self.setDailyAllowance(dailyAllowance)
    self.setMaxAllowance(maxAllowance)
    self.setProgram(programName, programType)
  }

  hasChanged = (data) => this._hasChanged(data)
  _hasChanged ({
    name = null,
    nameType = null,
    programName = null,
    programType = null,
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
    if (name === null) { name = this.name }
    if (nameType === null) { nameType = this.nameType }
    if (programName === null) { programName = this.programName }
    if (programType === null) { programType = this.programType }
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
      name !== this.name ||
      nameType !== this.nameType ||
      programName !== this.programName ||
      programType !== this.programType ||
      onlyActiveUsage !== this.onlyActiveUsage ||
      enableAllowance !== this.enableAllowance ||
      dailyAllowance !== this.dailyAllowance ||
      maxAllowance !== this.maxAllowance
    )
  }

  jsonify = (json) => this._jsonify(json)
  _jsonify (extraRuleJson = {}) {
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

    for (let prop in extraRuleJson) {
      // ensure extraRuleJson and ruleJson don't have
      // overlapping properties
      if (!extraRuleJson.hasOwnProperty(prop)) { continue }
      assert(!ruleJson.hasOwnProperty(prop))
      ruleJson[prop] = extraRuleJson[prop]
    }

    return super._jsonify(ruleJson)
  }

  test = (data) => this._test(data)
  _test ({ tasks = [] }) {
    // console.log('TDASKS', tasks)
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
      // console.log('EEXEC', task.platform, self.platform)
      return false
    }

    const nameMatch = self.testValue(
      task.name, self.name, self.nameType
    )
    const programMatch = self.testValue(
      task.program, self.programName, self.programType
    )

    // console.log('TTE', task.name, self.name, self.nameType)
    return nameMatch && programMatch
  }
}

export default TaskRule
