import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Sign in',
    component: () => import('../views/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/campaigns',
    name: 'Campaigns',
    component: () => import('../views/Campaigns.vue'),
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/campaign/:id',
    name: 'Campaign',
    component: () => import('../views/Campaign.vue'),
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/users',
    name: 'Users',
    component: () => import('../views/Users.vue'),
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/user/:id',
    name: 'User',
    component: () => import('../views/User.vue'),
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/ads',
    name: 'Ads',
    component: () => import('../views/Ads.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/payments',
    name: 'Payments',
    component: () => import('../views/Payments.vue'),
    meta: { requiresAuth: true, role: 'user' }
  },
  {
    path: '/sites',
    name: 'Sites',
    component: () => import('../views/Sites.vue'),
    meta: { requiresAuth: true, role: 'user' }
  },
  {
    path: '/statistics',
    name: 'Statistics',
    component: () => import('../views/Statistics.vue'),
    meta: { requiresAuth: true, role: 'user' }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const localUser = window.localStorage.getItem('user')
  const user = localUser ? JSON.parse(localUser) : null

  if (to.name) {
    document.title = to.name
  }

  if (to.meta.requiresAuth && (!user || !user.auth)) {
    return next('/')
  }

  if (user && user.auth) {
    if (to.path === '/') {
      return user.type === 'admin' ? next('/campaigns') : next('/statistics')
    }

    if (to.meta.role === 'admin' && user.type !== 'admin') {
      return next('/statistics')
    }

    if (to.meta.role === 'user' && user.type === 'admin') {
      return next('/campaigns')
    }
  }

  next()
})

export default router
