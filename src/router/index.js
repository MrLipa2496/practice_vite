import { createRouter, createWebHashHistory } from 'vue-router'

const Login = () => import('../views/Login.vue')

const routes = [{ path: '/', name: 'Sign in', component: Login }]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
