import Vue from 'vue'
import App from './App.vue'
import VueZoomer from 'vue-zoomer'
import vSelect from 'vue-select'
import router from './router'

import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'

import UserProfilePlugin from './plugins/UserProfilePlugins'

// Install BootstrapVue
Vue.use(BootstrapVue)
// Optionally install the BootstrapVue icon components plugin
Vue.use(IconsPlugin)

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import 'vue-select/dist/vue-select.css';

Vue.use(UserProfilePlugin)
Vue.use(VueZoomer)
Vue.component('v-select', vSelect)

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
