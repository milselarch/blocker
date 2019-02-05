import TaskGrabber from '@/components/TaskGrabber.js'

const state = {
  tasks: []
}

const mutations = {
  // mutations must be synchronous
  setNewTasks: (state, newTasks) => {
    state.tasks = newTasks
  }
}

const actions = {
  updater: async (context) => {
    const newTasks = await TaskGrabber.getAll()
    console.log('GRABBED TASKS', newTasks)
    context.commit('setNewTasks', newTasks)
    return 44
  }
}

const getters = {
  test: () => 234,
  tasks: (state) => { return state.tasks }
}

export default {
  state,
  mutations,
  actions,
  getters
}
