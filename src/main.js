import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ViewUI from 'view-design';
import 'view-design/dist/styles/iview.css';
import axios from 'axios'


import VueRouter from 'vue-router'

Vue.use(ViewUI);
Vue.config.productionTip = false
Vue.prototype.$http = axios
require('./mock.js')

const originalPush = VueRouter.prototype.push
   VueRouter.prototype.push = function push(location) {
   return originalPush.call(this, location).catch(err => err)
}


new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
