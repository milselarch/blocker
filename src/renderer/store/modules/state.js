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

  setNewRule: (state, task) => {
    state.rules.append(task)
  }
}

const actions = {
  updater: async (context) => {
    const newTasks = await TaskGrabber.getAll()
    console.log('GRABBED TASKS', newTasks)
    context.commit('setNewTasks', newTasks)
    return newTasks
  }
}

const getters = {
  test: () => 234,
  tasks: (state) => {
    return Object.freeze(state.tasks)
  }
}

export default {
  state,
  mutations,
  actions,
  getters
}
