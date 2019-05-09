import TaskRule from './TaskRule'
import TimeRule from './TimeRule'

function makeRule (ruleJson) {
  if (ruleJson.ruleType === TaskRule.RULE_TYPE) {
    return new TaskRule(ruleJson)
  } else if (ruleJson.ruleType === TimeRule.RULE_TYPE) {
    return new TimeRule(ruleJson)
  } else {
    throw new Error(`INVALID RULEMAKER TYPE ${ruleJson.ruleType}`)
  }
}

export default makeRule