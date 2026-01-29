import { createRouter, createWebHashHistory } from 'vue-router'

const Login = () => import('../views/Login.vue')
const Campaigns = () => import('../views/Campaigns.vue')
const Campaign = () => import('../views/Campaign.vue') // Раскомментировано

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
  },
  {
    path: '/campaign/:id',
    name: 'Campaign',
    component: Campaign
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
