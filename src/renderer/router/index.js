import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'start',
      component: require('@/components/start').default
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
