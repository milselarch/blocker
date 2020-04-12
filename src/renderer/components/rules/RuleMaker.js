import PomodoroRule from './PomodoroRule'
import TaskRule from './TaskRule'
import RemoteRule from './RemoteRule'
import TimeRule from './TimeRule'

function makeRule (ruleJson) {
  if (ruleJson.ruleType === TaskRule.RULE_TYPE) {
    return new TaskRule(ruleJson)
  } else if (ruleJson.ruleType === TimeRule.RULE_TYPE) {
    return new TimeRule(ruleJson)
  } else if (ruleJson.ruleType === PomodoroRule.RULE_TYPE) {
    return new PomodoroRule(ruleJson)
  } else if (ruleJson.ruleType === RemoteRule.RULE_TYPE) {
    return new RemoteRule(ruleJson)
  } else {
    console.log(`RULE JSON ${JSON.stringify(ruleJson)}`)
    throw new Error(`INVALID RULEMAKER TYPE ${ruleJson.ruleType}`)
  }
}

export default makeRule
