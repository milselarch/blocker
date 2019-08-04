import TaskGrabber from '@/components/TaskGrabber.js'
import RuleMaker from '@/components/rules/RuleMaker.js'
import PomodoroRule from '@/components/rules/PomodoroRule.js'
import TaskRule from '@/components/rules/TaskRule.js'
import TimeRule from '@/components/rules/TimeRule.js'
import Misc from '@/misc.js'
import Vue from 'vue'

const state = {
  // list of running system processes / tasks
  tasks: [],
  lastTimeUpdated: -1,
  taskTimes: {},
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
  // mutations must be synchronous
  startPomodoro: (state, pomodoroTitle) => {
    state.pomodoroTitle = pomodoroTitle
    state.pomodoroNo = (state.pomodoroNo + 1) % 4
    state.pomodoroStart = (new Date()).getTime()
  },

  setNewTasks: (state, newTasks) => {
    state.tasks = newTasks
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

  updateAllowances: (state) => {
    const curentDate = new Date()
    const lastUpdateDate = new Date(state.lastTimeUpdated)
    const lastDaysFromEpoch = Misc.getDaysFromEpoch(lastUpdateDate)
    const daysFromEpoch = Misc.getDaysFromEpoch(curentDate)

    if (daysFromEpoch > lastDaysFromEpoch) {
      state.lastTimeUpdated = curentDate.getTime()
      state.taskTimes = {}
    } else {
      const secondsPassed = (curentDate - lastUpdateDate) / 1000
      state.tasks.maps(task => {
        Vue.set(state.rules, k, rule.jsonify())
      })
    }
  }
}

const actions = {
  updater: async (context) => {
    const newTasks = await TaskGrabber.getAll()
    // console.log('GRABBED TASKS', newTasks)
    context.commit('setNewTasks', newTasks)
    return newTasks
  },

  loopUpdate: async (context) => {
    context.commit('updateAllowances')
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

  getPomodoroBlocked: async (context) => {
    const state = context.state
    const dateNow = new Date()
    const blockingRules = []

    let allowPrompt = true
    let maxWait = 1

    state.rules.map(jsonRule => {
      const rule = RuleMaker(jsonRule)
      if (!(rule instanceof PomodoroRule)) { return false }
      if (!rule.saved) { return false }

      const pomodoroState = rule.test({
        start: state.pomodoroStart,
        pomodoroNo: state.pomodoroNo,
        timeNow: dateNow
      })

      if (
        (pomodoroState === PomodoroRule.STATES.break) ||
        (pomodoroState === PomodoroRule.STATES.prompt)
      ) {
        maxWait = Math.max(maxWait, rule.blockDuration)
        blockingRules.push(rule)
      }
      if (pomodoroState !== PomodoroRule.STATES.prompt) {
        allowPrompt = false
      }
    })

    return [allowPrompt, maxWait, blockingRules]
  },

  getTimeBlocked: async (context) => {
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

  getBlockedTasks: async (context) => {
    const timeSinceStart = await context.dispatch('timeSinceStart')
    const state = context.state
    let maxWait = 1

    const blockedTasks = []
    const blockedTaskPids = []
    state.rules.map(jsonRule => {
      const rule = RuleMaker(jsonRule)
      if (!(rule instanceof TaskRule)) { return false }
      if (!rule.saved) { return false }

      const [blocked, ruleBlockedTasks] = rule.test({
        dateTime: new Date(),
        timeSinceStart: timeSinceStart,
        tasks: state.tasks
      })

      if (blocked) {
        maxWait = Math.max(maxWait, rule.blockDuration)
      }

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
