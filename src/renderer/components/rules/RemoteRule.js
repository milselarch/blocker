import Misc from '@/misc.js'
// import Enum from '@/Enum.js'
// import assert from '@/assert.js'
// import BaseRule from './BaseRule'
import TaskRule from './TaskRule'

// const _ = require('lodash')
// import Misc from '@/misc.js'
// import { program } from 'babel-types'

class RemoteRule extends TaskRule {
  static DEFAULT_SECRET_LENGTH = 2
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

    name = 'test-name',
    nameType = 'text',
    programName = 'test-program',
    programType = 'text',

    onlyActiveUsage = false,
    enableAllowance = true,
    dailyAllowance = 0,
    maxAllowance = 3600 * 24,

    secret = true
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
      saved,

      name,
      nameType,
      programName,
      programType,

      onlyActiveUsage,
      enableAllowance,
      dailyAllowance,
      maxAllowance
    })

    const self = this

    self.setSecretCode = (secret) => {
      if (secret === true) {
        secret = self.makeSecret()
      }

      Misc.assert(secret !== undefined)
      self.secret = secret
    }

    self.setSecretCode(secret)
  }

  makeSecret = () => {
    return Misc.makeSecret(
      RemoteRule.DEFAULT_SECRET_LENGTH
    )
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
    maxAllowance = null,

    secret = null
  }) {
    if (enableAllowance === null) { enableAllowance = this.enableAllowance }
    if (dailyAllowance === null) { dailyAllowance = this.dailyAllowance }
    if (onlyActiveUsage === null) { onlyActiveUsage = this.onlyActiveUsage }
    if (maxAllowance === null) { maxAllowance = this.maxAllowance }
    if (secret === null) { secret = this.secret }

    return super._hasChanged({
      name,
      nameType,
      programName,
      programType,
      blockDuration,

      platform,
      lockTime,
      locked,
      timestamp,
      saved,

      onlyActiveUsage,
      enableAllowance,
      dailyAllowance,
      maxAllowance
    }) || (
      secret !== this.secret
    )
  }

  jsonify = () => this._jsonify()
  _jsonify () {
    const ruleJson = {
      secret: this.secret
    }

    return super._jsonify(ruleJson)
  }
}

export default RemoteRule
