import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      components: {
        Programs: require('@/components/taskview').default
      }
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
