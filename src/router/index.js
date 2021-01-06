import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'SignUp',
    component: () => import('../views/SignUp.vue')
  },
  {
    path: '/chat',
    name: 'Chat',
    component: () => import('../views/Chat.vue')
  },
  {
    path: '/vue-socket',
    name: 'VueSocket',
    component: () => import('../views/VueSocket.vue')
  }
]

const router = new VueRouter({
  routes
})

export default router
