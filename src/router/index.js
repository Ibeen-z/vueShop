import Vue from 'vue'
import Router from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Welcome from '../components/Welcome.vue'
import Users from '../components/user/Users.vue'
import Rights from '../components/power/Rights.vue'
import Roles from '../components/power/Roles.vue'
import Goods from '../components/goods/cate.vue'
import Params from '../components/goods/params.vue'
import List from '../components/goods/List.vue'
import AddGoods from '../components/goods/Add.vue'
import Orders from '../components/order/Order.vue'
Vue.use(Router)

const router =  new Router({
  routes: [
    { path: '/', redirect: '/login' }, // 自动跳转到根路径
    { path: '/login', component: Login },
    { path: '/home',
      component: Home,
      redirect:'/welcome',
      children:[
        { path: '/welcome', component: Welcome },
        { path: '/users', component: Users },
        { path: '/rights', component: Rights },
        { path: '/roles', component: Roles },
        { path: '/categories', component: Goods },
        { path: '/params', component: Params },
        { path: '/goods', component: List },
        { path: '/goods/add', component: AddGoods },
        { path: '/orders', component: Orders },
    ]
    },
    

  ]
})


router.beforeEach((to,from,next)=>{

  if(to.path === '/login') return next()
  const tokenStr = window.sessionStorage.getItem('token')
  if(!tokenStr) next('/login')
  next()
})

export default router