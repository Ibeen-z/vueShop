import Vue from 'vue';
import router from './router';
import './assets/css/global.css';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import App from './App.vue';
import './assets/fonts/iconfont.css'
import axios from 'axios'
import treeTable from 'vue-table-with-tree-grid'
import VueQuillEditor from 'vue-quill-editor'

import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme

Vue.use(VueQuillEditor, /* { default global options } */)

axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'

axios.interceptors.request.use(config =>{
  // console.log(config)
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})

Vue.prototype.$http = axios

Vue.config.productionTip = false

Vue.use(ElementUI);
Vue.component('tree-table',treeTable)

// 时间处理
Vue.filter('dateFormat',function (param) {
    const dt = new Date(param)
    const y =dt.getFullYear()
    const m= (dt.getMonth()+ 1 +"").padStart(2,'0')
    const d = (dt.getDate()+'').padStart(2,'0')
    const hh = (dt.getHours()+'').padStart(2,'0')
    const mm = (dt.getMinutes() + '').padStart(2,"0")
    const ss =(dt.getSeconds() +'').padStart(2,"0")

    return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
 })


new Vue({
  router,
  el: '#app',
  render: h => h(App)
});