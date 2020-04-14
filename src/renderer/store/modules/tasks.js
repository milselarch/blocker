import TaskGrabber from '@/components/TaskGrabber.js'
// const _ = require('lodash');

const state = {
  // list of running system processes / tasks
  tasks: [],
  taskTimestamp: 0,
  prevTasks: [],
  prevTaskTimestamp: 0
}

const mutations = {
  setNewTasks: (state, newTasks) => {
    state.prevTasks = state.tasks
    state.prevTaskTimestamp = state.taskTimestamp
    state.tasks = newTasks
    state.taskTimestamp = (new Date()).getTime()
  }
}

const actions = {
  updater: async (context) => {
    const newTasks = await TaskGrabber.getAll()
    // console.log('GRABBED TASKS', newTasks)
    context.commit('setNewTasks', newTasks)
    return newTasks
  }
}

const getters = {
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
