import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import StudentView from '../views/StudentView.vue'
import TeacherView from '../views/TeacherView.vue'
import LoginView from '../views/LoginView.vue'
import SessionsView from '../views/SessionsView.vue'
import { verify } from '../services/auth.service.js'


const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: HomeView },
    { path: '/login', component: LoginView },
    { path: '/student', component: StudentView },
    { 
      path: '/teacher', 
      component: TeacherView,
      meta: { requiresAuth: true },
      children: [
        { path: 'sessions', component: SessionsView }
      ]
    }
  ]
})

// Vérifie l'authentification avant chaque navigation
router.beforeEach(async (to) => {
  if (to.meta.requiresAuth) {
    try {
      await verify()    // appelle GET /auth/verify
    } catch {
      return '/login'   // redirige vers login si session invalide
    }
  }
})


export default router