import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Practice from '../views/Practice.vue'
import Knowledge from '../views/Knowledge.vue'
import Stats from '../views/Stats.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/practice',
    name: 'Practice',
    component: Practice
  },
  {
    path: '/knowledge',
    name: 'Knowledge',
    component: Knowledge
  },
  {
    path: '/stats',
    name: 'Stats',
    component: Stats
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router