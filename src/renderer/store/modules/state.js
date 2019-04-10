import TaskGrabber from '@/components/TaskGrabber.js'
import Rule from '@/components/rules/Rule'

const state = {
  // list of running system processes / tasks
  tasks: [],
  // list of blocking rules
  rules: []
}

const mutations = {
  // mutations must be synchronous
  setNewTasks: (state, newTasks) => {
    state.tasks = newTasks
  },

  removeRule: (state, targetRule) => {
    state.rules = state.rules.filter(rule => {
      if (rule.ID !== targetRule.ID) {
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
  },

  saveRule: (state, rule) => {
    let ruleExists = false
    for (let k = 0; k < state.rules.length; k++) {
      const jsonRule = state.rules[k]
      if (jsonRule.ID === rule.ID) {
        state.rules[k] = rule.jsonify()
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
    console.log('GRABBED TASKS', newTasks)
    context.commit('setNewTasks', newTasks)
    return newTasks
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
  }
}

export default {
  state,
  mutations,
  actions,
  getters
}
