<script setup>
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import AppIcon from '@/components/AppIcon.vue'
import EmptyState from '@/components/EmptyState.vue'
import FilterPanel from '@/components/FilterPanel.vue'
import HabitFormDialog from '@/components/HabitFormDialog.vue'
import HabitListItem from '@/components/HabitListItem.vue'
import { useHabitsStore } from '@/stores/habits.js'
import { useUiStore } from '@/stores/ui.js'

const store = useHabitsStore()
const ui = useUiStore()
const { habitFilters: filters } = storeToRefs(ui)

const formOpen = ref(false)

const withStreak = computed(() =>
  store.habits.map((habit) => ({ habit, streak: store.streakOf(habit) })),
)

// Показуються лише звички, що відповідають усім умовам одночасно
const visible = computed(() => {
  const { query, category, status, sort } = filters.value
  const text = query.trim().toLowerCase()

  const list = withStreak.value.filter(
    ({ habit }) =>
      habit.name.toLowerCase().includes(text) &&
      (category === 'all' || habit.category === category) &&
      (status === 'all' || (status === 'archived') === habit.archived),
  )

  const compare = {
    name: (a, b) => a.habit.name.localeCompare(b.habit.name, 'uk'),
    streak: (a, b) => b.streak - a.streak || a.habit.name.localeCompare(b.habit.name, 'uk'),
    newest: (a, b) => b.habit.createdAt.localeCompare(a.habit.createdAt),
    oldest: (a, b) => a.habit.createdAt.localeCompare(b.habit.createdAt),
  }[sort]

  return [...list].sort(compare)
})

const hasFilters = computed(() => {
  const { query, category, status } = filters.value
  return query !== '' || category !== 'all' || status !== 'active'
})
</script>

<template>
  <div class="page">
    <header class="page-head">
      <div>
        <h1>Звички</h1>
        <p class="page-subtitle">
          Активних: {{ store.activeHabits.length }}, в архіві:
          {{ store.habits.length - store.activeHabits.length }}
        </p>
      </div>
      <button class="btn" type="button" @click="formOpen = true">
        <AppIcon name="plus" />
        Нова звичка
      </button>
    </header>

    <EmptyState
      v-if="store.habits.length === 0"
      emoji="📋"
      title="Список звичок порожній"
      text="Додайте першу звичку: назву, іконку, колір і розклад."
    >
      <button class="btn" type="button" @click="formOpen = true">
        <AppIcon name="plus" />
        Створити звичку
      </button>
    </EmptyState>

    <template v-else>
      <FilterPanel v-model="filters" />

      <div class="results-head">
        <p class="muted" aria-live="polite">Знайдено: {{ visible.length }}</p>
        <button
          v-if="hasFilters"
          class="btn btn-ghost btn-sm"
          type="button"
          @click="ui.resetHabitFilters()"
        >
          <AppIcon name="x" :size="16" />
          Скинути фільтри
        </button>
      </div>

      <EmptyState
        v-if="visible.length === 0"
        emoji="🔍"
        title="Нічого не знайдено"
        text="Спробуйте іншу назву, категорію або статус. Архівні звички показуються у статусі «Архів»."
      >
        <button class="btn btn-secondary" type="button" @click="ui.resetHabitFilters()">
          Скинути фільтри
        </button>
      </EmptyState>

      <TransitionGroup v-else tag="ul" name="list" class="habit-list grid grid-2">
        <li v-for="item in visible" :key="item.habit.id">
          <HabitListItem :habit="item.habit" :streak="item.streak" />
        </li>
      </TransitionGroup>
    </template>

    <HabitFormDialog :open="formOpen" @close="formOpen = false" />
  </div>
</template>

<style scoped>
.results-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  min-height: 2.25rem;
  margin-bottom: 0.5rem;
}

.habit-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.list-enter-active,
.list-leave-active {
  transition: all 0.2s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(6px);
}

.list-leave-active {
  position: absolute;
  visibility: hidden;
}
</style>
