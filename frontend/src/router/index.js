import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import StudentView from '../views/StudentView.vue'
import TeacherView from '../views/TeacherView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: HomeView },
    { path: '/student', component: StudentView },
    { path: '/teacher', component: TeacherView }
  ]
})

export default router