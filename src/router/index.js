import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '../views/Home.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/portfolio', name: 'Portfolio', component: () => import('../views/Portfolio.vue') },
  { path: '/knowledge', name: 'Knowledge', component: () => import('../views/Knowledge.vue') },
  { path: '/interests', name: 'Interests', component: () => import('../views/Interests.vue') },
  { path: '/contact', name: 'Contact', component: () => import('../views/Contact.vue') },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router
