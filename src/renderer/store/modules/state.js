import TaskGrabber from '@/components/TaskGrabber.js'

const state = {
  tasks: [],
  rules
}

const mutations = {
  // mutations must be synchronous
  setNewTasks: (state, newTasks) => {
    state.tasks = newTasks
  },

  setNewRule: (state, task) => {
    
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
