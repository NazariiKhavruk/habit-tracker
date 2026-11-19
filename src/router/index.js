import { createRouter, createWebHistory } from 'vue-router'
import { APP_NAME } from '@/lib/constants.js'
import TodayView from '@/views/TodayView.vue'
import HabitsView from '@/views/HabitsView.vue'
import HabitDetailView from '@/views/HabitDetailView.vue'
import StatsView from '@/views/StatsView.vue'
import SettingsView from '@/views/SettingsView.vue'
import NotFoundView from '@/views/NotFoundView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'today',
      component: TodayView,
      meta: { title: 'Сьогодні', section: 'today' },
    },
    {
      path: '/habits',
      name: 'habits',
      component: HabitsView,
      meta: { title: 'Звички', section: 'habits' },
    },
    {
      path: '/habits/:id',
      name: 'habit',
      component: HabitDetailView,
      meta: { title: 'Звичка', section: 'habits' },
    },
    {
      path: '/stats',
      name: 'stats',
      component: StatsView,
      meta: { title: 'Статистика', section: 'stats' },
    },
    {
      path: '/settings',
      name: 'settings',
      component: SettingsView,
      meta: { title: 'Налаштування', section: 'settings' },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: NotFoundView,
      meta: { title: 'Сторінку не знайдено' },
    },
  ],
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { top: 0 }
  },
})

router.afterEach((to) => {
  document.title = `${to.meta.title} · ${APP_NAME}`
})

export default router
