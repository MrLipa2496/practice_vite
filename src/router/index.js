import { createRouter, createWebHashHistory } from 'vue-router'

const Login = () => import('../views/Login.vue')
const Campaigns = () => import('../views/Campaigns.vue')
const Campaign = () => import('../views/Campaign.vue')
const Users = () => import('../views/Users.vue')
const User = () => import('../views/User.vue')

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
  },
  {
    path: '/users',
    name: 'Users',
    component: Users
  },
  {
    path: '/user/:id',
    name: 'User',
    component: User
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
