const state = {
  tasks: {}
}

const mutations = {
  // mutations must be synchronous
  updateTasks (state, newTasks) {
    state.tasks = newTasks
  }
}

const actions = {
  async updateTasks (context) {
    const newTasks = await TaskGrabber.getAll()
    context.commit("updateTasks", newTasks)
  }
}

const getters = {
  grabTasks: state => state.tasks
}

export default {
  state,
  mutations,
  actions,
  getters
}