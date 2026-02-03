import { createRouter, createWebHashHistory } from 'vue-router'

const Login = () => import('../views/Login.vue')
const Campaigns = () => import('../views/Campaigns.vue')
const Campaign = () => import('../views/Campaign.vue')
const Users = () => import('../views/Users.vue')
const User = () => import('../views/User.vue')
const Ads = () => import('../views/Ads.vue')
const Payments = () => import('../views/Payments.vue')
const Sites = () => import('../views/Sites.vue')
const Statistics = () => import('../views/Statistics.vue')

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
  },
  {
    path: '/ads',
    name: 'Ads',
    component: Ads
  },
  {
    path: '/payments',
    name: 'Payments',
    component: Payments
  },
  {
    path: '/sites',
    name: 'Sites',
    component: Sites
  },
  {
    path: '/statistics',
    name: 'Statistics',
    component: Statistics
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
