import Vue from 'vue';
import router from './router';
import './assets/css/global.css';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import App from './App.vue';
import './assets/fonts/iconfont.css'
import axios from 'axios'


axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
Vue.prototype.$http = axios
Vue.config.productionTip = false

Vue.use(ElementUI);

new Vue({
  router,
  el: '#app',
  render: h => h(App)
});