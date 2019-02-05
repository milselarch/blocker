import Vue from 'vue'
import axios from 'axios'

import App from './App'
import router from './router'
import store from './store'

import Buefy from 'buefy'
// import 'buefy/dist/buefy.css'

import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import {
  faCoffee, faBan, faShieldAlt, faWindowRestore
} from '@fortawesome/free-solid-svg-icons'
library.add(
  faCoffee, faBan, faShieldAlt, faWindowRestore
)
Vue.component(
  'font-awesome-icon', FontAwesomeIcon
)

Vue.config.productionTip = false
Vue.use(Buefy, {
  defaultIconPack: 'fas'
})

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store: store,
  template: '<App/>'
}).$mount('#app')
