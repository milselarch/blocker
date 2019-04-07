import TaskGrabber from '@/components/TaskGrabber.js'

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

  setNewRule: (state, rule) => {
    console.log('NOSTATE', state.rules)
    state.rules = [rule].concat(state.rules)
  }
}

const actions = {
  updater: async (context) => {
    const newTasks = await TaskGrabber.getAll()
    console.log('GRABBED TASKS', newTasks)
    context.commit('setNewTasks', newTasks)
    return newTasks
  },

  addNewRule: async (context, newRule) => {
    context.commit('setNewRule', newRule)
    return true
  }
}

const getters = {
  test: () => 234,
  tasks: (state) => {
    return Object.freeze(state.tasks)
  },
  rules: (state) => {
    return Object.freeze(state.rules)
  }
}

export default {
  state,
  mutations,
  actions,
  getters
}
