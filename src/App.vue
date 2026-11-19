<script setup>
import { onBeforeUnmount, onMounted } from 'vue'
import AppHeader from '@/components/AppHeader.vue'
import AppIcon from '@/components/AppIcon.vue'
import AppSkeleton from '@/components/AppSkeleton.vue'
import BottomNav from '@/components/BottomNav.vue'
import ToastContainer from '@/components/ToastContainer.vue'
import { useHabitsStore } from '@/stores/habits.js'
import { useUiStore } from '@/stores/ui.js'

const store = useHabitsStore()
const ui = useUiStore()

const links = [
  { name: 'today', label: 'Сьогодні', icon: 'today' },
  { name: 'habits', label: 'Звички', icon: 'list' },
  { name: 'stats', label: 'Статистика', icon: 'chart' },
  { name: 'settings', label: 'Налаштування', icon: 'settings' },
]

// Якщо застосунок відкритий опівночі, «сьогодні» має перейти на нову дату
let timer = null

onMounted(() => {
  ui.initTheme()
  store.init()
  timer = setInterval(() => store.refreshToday(), 60 * 1000)
  document.addEventListener('visibilitychange', store.refreshToday)
})

onBeforeUnmount(() => {
  clearInterval(timer)
  document.removeEventListener('visibilitychange', store.refreshToday)
})
</script>

<template>
  <a class="skip-link" href="#main">Перейти до вмісту</a>
  <AppHeader :links="links" />

  <main id="main" tabindex="-1">
    <div v-if="store.loadError" class="page load-error-wrap">
      <div class="load-error card" role="alert">
        <AppIcon name="alert" />
        <div>
          <p class="load-error-title">Не вдалося прочитати збережені дані</p>
          <p>{{ store.loadError }}</p>
          <div class="load-error-actions">
            <RouterLink class="btn btn-sm" :to="{ name: 'settings' }">До налаштувань</RouterLink>
            <button class="btn btn-sm btn-secondary" type="button" @click="store.loadError = ''">
              Зрозуміло
            </button>
          </div>
        </div>
      </div>
    </div>

    <AppSkeleton v-if="store.status === 'loading'" />
    <RouterView v-else v-slot="{ Component, route }">
      <Transition name="fade" mode="out-in">
        <component :is="Component" :key="route.path" />
      </Transition>
    </RouterView>
  </main>

  <BottomNav :links="links" />
  <ToastContainer />
</template>

<style scoped>
.skip-link {
  position: absolute;
  top: -100px;
  left: 1rem;
  z-index: 100;
  padding: 0.5rem 1rem;
  border-radius: var(--radius-sm);
  background: var(--primary);
  color: var(--on-primary);
  font-weight: 700;
}

.skip-link:focus {
  top: 0.5rem;
}

main:focus {
  outline: none;
}

.load-error-wrap {
  padding-bottom: 0;
}

.load-error {
  display: flex;
  gap: 0.75rem;
  border-color: var(--danger);
  background: var(--danger-soft);
  color: var(--text);
}

.load-error > .icon {
  color: var(--danger);
}

.load-error-title {
  font-weight: 700;
}

.load-error-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.75rem;
}
</style>
