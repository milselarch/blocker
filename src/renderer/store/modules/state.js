import TaskGrabber from '@/components/TaskGrabber.js'
import RuleMaker from '@/components/rules/RuleMaker.js'
import PomodoroRule from '@/components/rules/PomodoroRule.js'
import TaskRule from '@/components/rules/TaskRule.js'
import TimeRule from '@/components/rules/TimeRule.js'
import assert from '@/assert.js'
import Misc from '@/misc.js'
import Vue from 'vue'

// const _ = require('lodash');

const state = {
  // list of running system processes / tasks
  tasks: [],
  taskTimestamp: 0,
  prevTasks: [],
  prevTaskTimestamp: 0,

  lastTimeUpdated: -1,
  blockAllowances: {},
  optInPomodoros: {},
  lastUsage: false,

  // list of blocking rules
  rules: [],
  unlockWaitTimes: {},
  unlockWaits: {},
  firstOpened: -1,
  pomodoroNo: -1,
  pomodoroStart: 0,
  pomodoroTitle: '',
  version7: false
}

const mutations = {
  removeOptinPomodoros: (state) => {
    for (const ID in state.optInPomodoros) {
      Vue.delete(state.optInPomodoros, ID)
    }
  },

  updateLastUsage: (state) => {
    state.lastUsage = (new Date()).getTime()
  },

  addOptInPomodoro: (state, rule) => {
    assert(rule instanceof PomodoroRule)
    const ID = rule.getID()

    if (!state.optInPomodoros.hasOwnProperty(ID)) {
      Vue.set(state.optInPomodoros, ID, true)
      // console.log('OPTIN', state.optInPomodoros)
    }
  },

  // mutations must be synchronous
  startPomodoro: (state, pomodoroTitle) => {
    state.pomodoroTitle = pomodoroTitle
    state.pomodoroNo = (state.pomodoroNo + 1) % 4
    state.pomodoroStart = (new Date()).getTime()
  },

  setNewTasks: (state, newTasks) => {
    state.prevTasks = state.tasks
    state.prevTaskTimestamp = state.taskTimestamp
    state.tasks = newTasks
    state.taskTimestamp = (new Date()).getTime()
  },

  resetUnlockWaits: (state) => {
    state.unlockWaitTimes = {}
  },
  updateFirstOpened: (state) => {
    if (state.firstOpened === null) {
      state.firstOpened = (new Date()).getTime()
    } else {
      const dateNow = new Date()
      const nowDaySecs = Misc.getDayStartSecs(dateNow)
      const firstOpenDaySecs = Misc.getDayStartSecs(state.firstOpened)
      if (nowDaySecs !== firstOpenDaySecs) {
        state.firstOpened = dateNow.getTime()
      }
    }
  },

  unlock: (state, targetRule) => {
    const ID = targetRule.ID
    if (!state.unlockWaits.hasOwnProperty(ID)) {
      console.log('UNLOCK IS NEW', ID)
      Vue.set(state.unlockWaits, ID, 0)
      Vue.set(state.unlockWaitTimes, ID, Misc.getTimePassed())
    } else {
      let timePassed = 0
      if (state.unlockWaitTimes.hasOwnProperty(ID)) {
        timePassed = Misc.getTimePassed() - state.unlockWaitTimes[ID]
        if (process.env.NODE_ENV === 'development') {
          timePassed *= 10
        }
      }

      const newUnlockWait = state.unlockWaits[ID] + timePassed
      Vue.set(state.unlockWaitTimes, ID, Misc.getTimePassed())
      Vue.set(state.unlockWaits, ID, newUnlockWait)
    }
  },
  removeUnlock: (state, targetRule) => {
    const ID = targetRule.ID
    console.log('REMOVE-UNLOCK', ID)

    if (state.unlockWaitTimes.hasOwnProperty(ID)) {
      Vue.delete(state.unlockWaitTimes, ID)
    }
    if (state.unlockWaits.hasOwnProperty(ID)) {
      Vue.delete(state.unlockWaits, ID)
    }
  },
  removeUnlockByID: (state, ID) => {
    console.log('REMOVE-UNLOCK-ID', ID)
    if (state.unlockWaitTimes.hasOwnProperty(ID)) {
      Vue.delete(state.unlockWaitTimes, ID)
    }
    if (state.unlockWaits.hasOwnProperty(ID)) {
      Vue.delete(state.unlockWaits, ID)
    }
  },

  removeRule: (state, targetRule) => {
    state.rules = state.rules.filter(rule => {
      if (rule.ID !== targetRule.ID) {
        if (state.optInPomodoros.hasOwnProperty(rule.ID)) {
          Vue.delete(state.optInPomodoros, rule.ID)
        }

        return true
      }
    })
  },

  removeRuleByID: (state, ID) => {
    state.rules = state.rules.filter(rule => {
      if (rule.ID !== ID) {
        return true
      }
    })
  },

  setNewRule: (state, rule) => {
    console.log('NOSTATE', state.rules)
    const jsonRule = rule.jsonify()
    state.rules = [jsonRule].concat(state.rules)
  },

  emptyRules: (state) => {
    state.rules = []
    state.unlockWaits = {}
    state.unlockWaitTimes = {}
    state.optInPomodoros = {}

    const timestamp = (new Date()).getTime()

    state.tasks = []
    state.prevTasks = []
    state.taskTimestamp = timestamp
    state.prevTaskTimestamp = timestamp

    state.blockAllowances = {}
    state.lastUsage = false
  },

  saveRule: (state, rule) => {
    let ruleExists = false
    for (let k = 0; k < state.rules.length; k++) {
      const jsonRule = state.rules[k]
      if (jsonRule.ID === rule.ID) {
        console.log('SAVERULE', rule.jsonify())
        Vue.set(state.rules, k, rule.jsonify())
        ruleExists = true
        break
      }
    }

    if (!ruleExists) {
      const jsonRule = rule.jsonify()
      console.warn('NON-EXISTANT RULE', jsonRule)
      // throw new Error('UNSAVABLE NONEXISTANT RULE')
      state.rules = [jsonRule].concat(state.rules)
    }
  },

  updateLastTime: (state, currentDate) => {
    if (currentDate === true) { currentDate = new Date() }
    state.lastTimeUpdated = currentDate.getTime()
  },

  addAllowance: (state, payload) => {
    const rule = payload.rule
    const timePassed = payload.timePassed
    assert(rule instanceof TaskRule)
    const ruleID = rule.getID()
    // console.log('ADD START')

    assert(state.blockAllowances.hasOwnProperty(ruleID))
    const allowanceGained = (
      rule.dailyAllowance * timePassed / (24 * 3600)
    )

    assert(typeof state.blockAllowances[ruleID] === 'number')
    assert(state.blockAllowances[ruleID] !== null)
    assert(!Number.isNaN(state.blockAllowances[ruleID]))
    // console.log('MM', state.blockAllowances[ruleID], rule.maxAllowance)

    Vue.set(state.blockAllowances, ruleID, Math.min(
      state.blockAllowances[ruleID] + allowanceGained,
      rule.maxAllowance
    ))

    // console.log('ADD ENDS')
    assert(typeof state.blockAllowances[ruleID] === 'number')
    assert(state.blockAllowances[ruleID] !== null)
    assert(!Number.isNaN(state.blockAllowances[ruleID]))
  },

  subtractAllowance: (state, payload) => {
    const rule = payload.rule
    const timePassed = payload.timePassed
    assert(rule instanceof TaskRule)
    assert(typeof timePassed === 'number')
    const ruleID = rule.getID()

    if (!state.blockAllowances.hasOwnProperty(ruleID)) {
      Vue.set(state.blockAllowances, ruleID, 0)
    }

    assert(typeof state.blockAllowances[ruleID] === 'number')
    assert(state.blockAllowances[ruleID] !== null)
    assert(!Number.isNaN(state.blockAllowances[ruleID]))
    Vue.set(state.blockAllowances, ruleID, Math.max(
      state.blockAllowances[ruleID] - timePassed, 0
    ))

    // console.log('SUB ENDS', state.blockAllowances[ruleID])
    assert(typeof state.blockAllowances[ruleID] === 'number')
    assert(state.blockAllowances[ruleID] !== null)
    assert(!Number.isNaN(state.blockAllowances[ruleID]))
  },

  clearUnusedAllowances: (state) => {
    const blockAllowances = state.blockAllowances
    const ruleIds = state.rules.map(jsonRule => jsonRule.ID)

    for (let ruleID in blockAllowances) {
      if (ruleIds.indexOf(ruleID) === -1) {
        Vue.delete(blockAllowances, ruleID)
      }
    }
  },

  resetAllowance: (state, rule) => {
    const ruleID = rule.getID()
    const blockAllowances = state.blockAllowances
    const allowance = Math.min(rule.dailyAllowance, rule.maxAllowance)
    Vue.set(blockAllowances, ruleID, allowance)
  }
}

const actions = {
  updater: async (context) => {
    const newTasks = await TaskGrabber.getAll()
    // console.log('GRABBED TASKS', newTasks)
    context.commit('setNewTasks', newTasks)
    return newTasks
  },

  relockRule: async (context, rule) => {
    context.commit('removeUnlock', rule)
  },
  unlockRule: async (context, rule) => {
    context.commit('unlock', rule)
  },

  onStart: async (context) => {
    // context.state.pomodoroStart = 0
    context.commit('resetUnlockWaits')
    context.commit('updateFirstOpened')
    if (context.state.version7 === false) {
      context.commit('emptyRules')
      context.state.version7 = true
    }
  },

  updateUnlocks: async (context) => {
    const unlockIndexes = []
    const unlockRules = []
    const unlockIds = []

    const state = context.state
    const unlockWaits = state.unlockWaits
    const rules = state.rules

    for (let unlockRuleID in unlockWaits) {
      let unlockRule = null
      let unlockRuleIndex = null
      for (let k = 0; k < rules.length; k++) {
        if (rules[k].ID === unlockRuleID) {
          unlockRule = RuleMaker(rules[k])
          unlockRuleIndex = k
          break
        }
      }

      if (unlockRule === null) {
        context.commit('removeUnlockByID', unlockRuleID)
      }

      context.commit('unlock', unlockRule)
      const wait = state.unlockWaits[unlockRuleID]
      // console.log('WAIT_CMP', wait, unlockRule.lockTime)
      if (wait >= unlockRule.lockTime) {
        unlockRule.unlock()
        context.commit('saveRule', unlockRule)
        context.commit('removeUnlock', unlockRule)
        unlockIndexes.push(unlockRuleIndex)
        unlockRules.push(unlockRule)
        unlockIds.push(unlockRuleID)
      }
    }

    return [unlockIndexes, unlockIds, unlockRules]
  },

  deleteRule: async (context, rule) => {
    context.commit('removeRule', rule)
  },

  reset: async (context) => {
    context.commit('emptyRules')
    return true
  },

  safeGetRuleByID: async (context, ID) => {
    const state = context.state
    const jsonRule = state.rules.filter(rule => rule.ID === ID)[0]
    if (jsonRule === undefined) { return null }
    return RuleMaker(jsonRule)
  },

  getRuleByID: async (context, ID) => {
    const state = context.state
    const jsonRule = state.rules.filter(rule => rule.ID === ID)[0]
    // console.log("JSONRULE", jsonRule)
    return RuleMaker(jsonRule)
  },

  getJsonRuleByID: async (context, ID) => {
    const state = context.state
    const jsonRule = state.rules.filter(rule => rule.ID === ID)[0]
    return jsonRule
  },

  addNewRule: async (context, newRule) => {
    context.commit('setNewRule', newRule)
    return true
  },

  saveRule: async (context, rule) => {
    context.commit('saveRule', rule)
    return true
  },

  timeSinceStart: async (context) => {
    let firstOpened = context.state.firstOpened
    if (firstOpened === null) {
      firstOpened = 0
    }

    return (
      (new Date()).getTime() - firstOpened
    ) / 1000
  },

  startPomodoro: async (context, pomodoroTitle) => {
    context.commit('startPomodoro', pomodoroTitle)
  },

  checkPomodoroBlocked: async (context) => {
    const state = context.state
    const dateNow = new Date()
    const blockingRules = []

    let allowPrompt = true
    let maxWait = 1

    state.rules.map(jsonRule => {
      const rule = RuleMaker(jsonRule)
      if (!(rule instanceof PomodoroRule)) { return false }
      if (!rule.saved) { return false }

      let optIn = true
      const ruleID = rule.getID()
      // console.log('RULE OPTIN', [rule.optIn])
      if (rule.optIn) {
        if (!state.optInPomodoros.hasOwnProperty(ruleID)) {
          return false
        }
      }

      const pomodoroState = rule.test({
        start: state.pomodoroStart,
        pomodoroNo: state.pomodoroNo,
        timeNow: dateNow
      })

      if (optIn && (
        (pomodoroState === PomodoroRule.STATES.break) ||
        (pomodoroState === PomodoroRule.STATES.prompt)
      )) {
        maxWait = Math.max(maxWait, rule.blockDuration)
        blockingRules.push(rule)
      }

      if (pomodoroState !== PomodoroRule.STATES.prompt) {
        allowPrompt = false
      }
    })

    return [allowPrompt, maxWait, blockingRules]
  },

  checkTimeBlocked: async (context) => {
    const timeSinceStart = await context.dispatch('timeSinceStart')
    const state = context.state
    const blockingRules = []
    let blocked = false
    let maxWait = 1

    state.rules.map(jsonRule => {
      const rule = RuleMaker(jsonRule)
      if (!(rule instanceof TimeRule)) { return false }
      if (!rule.saved) { return false }

      const [block, extra] = rule.test({
        dateTime: new Date(),
        timeSinceStart: timeSinceStart
      })

      if (extra === 'potato') { console.log('meh') }
      if (block) {
        maxWait = Math.max(maxWait, rule.blockDuration)
      }

      blocked = blocked || block
      blockingRules.push(rule)
    })

    return [blocked, maxWait, blockingRules]
  },

  checkBlockedTasks: async (context) => {
    context.commit('clearUnusedAllowances')
    const timeSinceStart = await context.dispatch('timeSinceStart')

    const state = context.state
    const currentDate = new Date()
    const lastUpdateDate = new Date(state.lastTimeUpdated)
    const lastUsageDate = new Date(state.lastUsage)
    const millisPassed = currentDate - lastUpdateDate
    const timePassed = Math.max(millisPassed / 1000, 0)
    const timeSinceLastUpdate = (currentDate - lastUsageDate) / 1000

    /*
    const lastDaysFromEpoch = Misc.getDaysFromEpoch(lastUpdateDate)
    const daysFromEpoch = Misc.getDaysFromEpoch(currentDate)

    let isNewDay = false
    if (daysFromEpoch > lastDaysFromEpoch) {
      isNewDay = true
    }
    */

    let maxWait = 1
    const blockedTasks = []
    const blockedTaskPids = []
    state.rules.map(jsonRule => {
      if (jsonRule === undefined) { return false }
      const rule = RuleMaker(jsonRule)
      const ruleID = rule.getID()

      if (!(rule instanceof TaskRule)) { return false }
      if (!rule.saved) { return false }

      // console.log('TEST RULE', ruleID, timePassed)
      assert(typeof timePassed === 'number')

      if (rule.enableAllowance) {
        assert(state.blockAllowances.hasOwnProperty(ruleID))
        // increase allowance for program block rule
        context.commit('addAllowance', {
          rule: rule, timePassed: timePassed
        })
      }

      let allowanceValid = false
      const [blocked, ruleBlockedTasks] = rule.test({
        dateTime: new Date(),
        timeSinceStart: timeSinceStart,
        tasks: state.tasks
      })

      if (blocked) {
        // console.log(`TASK RUKE BKOCK ${ruleID}`)
        if (rule.enableAllowance) {
          const prevBlocked = rule.test({
            dateTime: new Date(),
            timeSinceStart: timeSinceStart,
            tasks: state.tasks
          })[0]

          const canSubtractAllowance = (
            (rule.onlyActiveUsage && timeSinceLastUpdate < 5) ||
            !rule.onlyActiveUsage
          )

          if (prevBlocked && canSubtractAllowance) {
            // console.log(`MINUS ALLOWANCE ${ruleID} ${timePassed}`)
            context.commit('subtractAllowance', {
              rule: rule, timePassed: timePassed
            })
          }

          allowanceValid = state.blockAllowances[ruleID] > 0
          // console.log(`ALLOWANCE VALID ${ruleID} ${allowanceValid}`)
        }

        maxWait = Math.max(maxWait, rule.blockDuration)
      }

      if (allowanceValid) { return }
      ruleBlockedTasks.map(blockedTask => {
        if (blockedTaskPids.indexOf(blockedTask.pid) === -1) {
          blockedTaskPids.push(blockedTask.pid)
          blockedTasks.push(blockedTask)
        }
      })
    })

    // console.log('BLOCKTAAAAASKS', blockedTasks)
    return [maxWait, blockedTasks]
  }
}

const getters = {
  test: () => 234,
  getAllowanceLeft: (state) => {
    return (ruleID) => {
      if (state.blockAllowances.hasOwnProperty(ruleID)) {
        return state.blockAllowances[ruleID]
      } else {
        return 0
      }
    }
  },

  getOptIns: (state) => {
    return state.optInPomodoros
  },

  hasOptinPomodoros: (state) => {
    for (let prop in state.optInPomodoros) {
      return true
    }

    return false
  },

  getTimeSinceLastUpdate: (state) => {
    const lastUsageDate = new Date(state.lastUsage)
    const currentDate = new Date(state.lastTimeUpdated)
    return (currentDate - lastUsageDate) / 1000
  },

  blockAllowances: (state) => {
    return state.blockAllowances
  },
  firstOpened: (state) => {
    let firstOpened = state.firstOpened
    if (firstOpened === null) { firstOpened = new Date() }
    return new Date(firstOpened)
  },
  tasks: (state) => {
    return Object.freeze(state.tasks)
  },
  rules: (state) => {
    return state.rules.map(jsonRule => {
      return RuleMaker(jsonRule)
    })
  },
  unlockWaits: (state) => {
    console.log('GET UNLOCK WAITS')
    return state.unlockWaits
  },
  pomodoroTitle: (state) => {
    return state.pomodoroTitle
  },
  pomodoroStart: (state) => {
    return state.pomodoroStart
  },
  pomodoroNo: (state) => {
    return state.pomodoroNo
  }
}

export default {
  state,
  mutations,
  actions,
  getters
}
