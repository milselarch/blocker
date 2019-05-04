import Misc from '@/misc.js'
import Enum from '@/Enum.js'
import assert from '@/assert.js'
import BaseRule from './BaseRule'
// import Misc from '@/misc.js'
// import { program } from 'babel-types'

const ALLOWED_TYPES = Enum('text', 'wildcard', 'regex')

class Rule extends BaseRule {
  static nameTypes = ALLOWED_TYPES;
  static programTypes = ALLOWED_TYPES;
  static RULE_TYPE = 'PROGRAM'

  constructor ({
    ruleType = Rule.RULE_TYPE,
    platform = null,
    blockDuration = 300,
    lockTime = 300,
    locked = false,
    timestamp = null,
    ID = null,
    saved = false,

    name = '',
    nameType = 'text',
    programName = '',
    programType = 'text'
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
      assert(Rule.nameTypes.includes(nameType))
      self.name = name
      self.nameType = nameType
    }
    self.setProgram = (programName, programType) => {
      assert(Rule.programTypes.includes(programType))
      self.programName = programName
      self.programType = programType
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

    self.setName(name, nameType)
    self.setProgram(programName, programType)
  }

  hasChanged = (data) => this._hasChanged(data)
  _hasChanged ({
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
  }) {
    if (name === null) { name = this.name }
    if (nameType === null) { nameType = this.nameType }
    if (programName === null) { programName = this.programName }
    if (programType === null) { programType = this.programType }

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
      programType !== this.programType
    )
  }

  jsonify = () => this._jsonify()
  _jsonify () {
    const ruleJson = {
      name: this.name,
      nameType: this.nameType,
      programName: this.programName,
      programType: this.programType
    }

    return super._jsonify(ruleJson)
  }
}

export default Rule
