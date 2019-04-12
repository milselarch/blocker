import TaskGrabber from '@/components/TaskGrabber.js'
import Rule from '@/components/rules/Rule'
import Misc from '@/misc.js'
import Vue from 'vue'

const state = {
  // list of running system processes / tasks
  tasks: [],
  // list of blocking rules
  rules: [],
  unlockWaitTimes: {},
  unlockWaits: {}
}

const mutations = {
  // mutations must be synchronous
  setNewTasks: (state, newTasks) => {
    state.tasks = newTasks
  },

  resetUnlockWaits: (state) => {
    state.unlockWaitTimes = {}
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
      }

      Vue.set(state.unlockWaitTimes, ID, Misc.getTimePassed())
      // console.log('UNLOCKS', state.unlockWaits, ID, timePassed)
      Vue.set(state.unlockWaits, ID, state.unlockWaits[ID] + timePassed)
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
      throw new Error('UNSAVABLE NONEXISTANT RULE')
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

  relockRule: async (context, rule) => {
    context.commit('removeUnlock', rule)
  },
  unlockRule: async (context, rule) => {
    context.commit('unlock', rule)
  },

  onStart: async (context) => {
    context.commit('resetUnlockWaits')
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
          unlockRule = new Rule(rules[k])
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

  addNewRule: async (context, newRule) => {
    context.commit('setNewRule', newRule)
    return true
  },

  saveRule: async (context, rule) => {
    context.commit('saveRule', rule)
    return true
  },

  getBlockedTasks: async (context) => {
    const state = context.state
    let maxWait = 1

    let blockedTasks = state.tasks.filter((task) => {
      return state.rules.map(jsonRule => {
        const rule = new Rule(jsonRule)
        maxWait = Math.max(maxWait, rule.blockDuration)
        if (!rule.saved) { return false }
        return rule.testTask(task)
      }).reduce((oldValue, currentValue) => {
        return oldValue || currentValue
      }, false)
    })

    if (blockedTasks === undefined) {
      blockedTasks = []
    }

    return [maxWait, blockedTasks]
  }
}

const getters = {
  test: () => 234,
  tasks: (state) => {
    return Object.freeze(state.tasks)
  },
  rules: (state) => {
    return state.rules.map(jsonRule => {
      return new Rule(jsonRule)
    })
  },
  unlockWaits: (state) => {
    console.log('GET UNLOCK WAITS')
    return state.unlockWaits
  }
}

export default {
  state,
  mutations,
  actions,
  getters
}
