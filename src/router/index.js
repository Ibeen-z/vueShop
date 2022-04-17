import Vue from 'vue'
import Router from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'

Vue.use(Router)

const router =  new Router({
  routes: [
    { path: '/', redirect: '/login' }, // 自动跳转到根路径
    { path: '/login', component: Login },
    { path: '/home', component: Home }

  ]
})


router.beforeEach((to,from,next)=>{

  if(to.path === '/login') return next()
  const tokenStr = window.sessionStorage.getItem('token')
  if(!tokenStr) next('/login')
  next()
})

export default router