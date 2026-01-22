import { createRouter, createWebHashHistory } from 'vue-router'

const Login = () => import('../views/Login.vue')
const Campaigns = () => import('../views/Campaigns.vue')

const routes = [
  {
    path: '/',
    name: 'Sign in',
    component: Login
  },
  {
    path: '/campaigns',
    name: 'Campaigns',
    component: Campaigns
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
