<script setup>
import { computed, ref, watch } from 'vue'
import AppIcon from '@/components/AppIcon.vue'
import EmptyState from '@/components/EmptyState.vue'
import HabitCheckCard from '@/components/HabitCheckCard.vue'
import HabitFormDialog from '@/components/HabitFormDialog.vue'
import ProgressBar from '@/components/ProgressBar.vue'
import WeekStrip from '@/components/WeekStrip.vue'
import { formatKey } from '@/lib/dates.js'
import { useHabitsStore } from '@/stores/habits.js'
import { useUiStore } from '@/stores/ui.js'

const store = useHabitsStore()
const ui = useUiStore()

const selected = ref(store.today)
const formOpen = ref(false)

// Коли настає новий день, переходимо на нього
watch(
  () => store.today,
  (today, previous) => {
    if (selected.value === previous) selected.value = today
  },
)

const isToday = computed(() => selected.value === store.today)
const dayHabits = computed(() => store.habitsForDay(selected.value))
const doneCount = computed(
  () => dayHabits.value.filter((habit) => store.isDone(habit.id, selected.value)).length,
)
const percent = computed(() =>
  dayHabits.value.length === 0 ? 0 : Math.round((doneCount.value / dayHabits.value.length) * 100),
)

const title = computed(() => (isToday.value ? 'Сьогодні' : formatKey(selected.value, 'EEEE')))
const dateText = computed(() => formatKey(selected.value, 'd MMMM yyyy'))

const summaryText = computed(() => {
  if (percent.value === 100) return 'Усе виконано. Чудова робота!'
  if (doneCount.value === 0)
    return isToday.value ? 'Почнімо день із першої звички.' : 'Цього дня відміток немає.'
  return `Залишилось ${dayHabits.value.length - doneCount.value}`
})

function dayProgress(key) {
  const habits = store.habitsForDay(key)
  if (habits.length === 0) return null
  const done = habits.filter((habit) => store.isDone(habit.id, key)).length
  return Math.round((done / habits.length) * 100)
}

function toggle(habit) {
  const done = store.toggleCompletion(habit.id, selected.value)
  if (done && percent.value === 100 && dayHabits.value.length > 1) {
    ui.notify('Усі звички на цей день виконано 🎉')
  }
}
</script>

<template>
  <div class="page">
    <header class="page-head">
      <div>
        <h1 class="today-title">{{ title }}</h1>
        <p class="page-subtitle">{{ dateText }}</p>
      </div>
      <button class="btn" type="button" @click="formOpen = true">
        <AppIcon name="plus" />
        Нова звичка
      </button>
    </header>

    <EmptyState
      v-if="store.habits.length === 0"
      emoji="🌱"
      title="Ще немає жодної звички"
      text="Створіть першу звичку і відмічайте її щодня. Або завантажте демо-дані, щоб подивитися, як усе працює."
    >
      <button class="btn" type="button" @click="formOpen = true">
        <AppIcon name="plus" />
        Створити звичку
      </button>
      <button class="btn btn-secondary" type="button" @click="store.loadDemo()">
        <AppIcon name="sparkles" />
        Демо-дані
      </button>
    </EmptyState>

    <template v-else>
      <section class="section">
        <WeekStrip v-model="selected" :today="store.today" :progress="dayProgress" />
      </section>

      <section class="summary card section" aria-labelledby="summary-title">
        <div class="summary-row">
          <div>
            <h2 id="summary-title" class="summary-count" aria-live="polite">
              Виконано {{ doneCount }} з {{ dayHabits.length }}
            </h2>
            <p class="muted">
              {{ dayHabits.length ? summaryText : 'Цього дня немає запланованих звичок.' }}
            </p>
          </div>
          <p class="summary-percent">{{ percent }}%</p>
        </div>
        <ProgressBar :value="percent" label="Прогрес за день" />
      </section>

      <EmptyState
        v-if="dayHabits.length === 0"
        emoji="☕"
        title="На цей день нічого не заплановано"
        text="Звички з розкладом «вибрані дні» показуються лише у свої дні. Можна відпочити або додати нову звичку."
      />

      <TransitionGroup v-else tag="div" name="list" class="grid grid-2">
        <HabitCheckCard
          v-for="habit in dayHabits"
          :key="habit.id"
          :habit="habit"
          :done="store.isDone(habit.id, selected)"
          :streak="store.streakOf(habit)"
          @toggle="toggle(habit)"
        />
      </TransitionGroup>
    </template>

    <HabitFormDialog :open="formOpen" @close="formOpen = false" />
  </div>
</template>

<style scoped>
.today-title {
  font-size: 1.75rem;
  text-transform: capitalize;
}

.summary {
  display: grid;
  gap: 0.875rem;
}

.summary-row {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
}

.summary-count {
  font-size: 1.2rem;
}

.summary-percent {
  font-size: 2rem;
  font-weight: 800;
  line-height: 1;
  color: var(--primary-text);
}

:root[data-theme='dark'] .summary-percent {
  color: var(--primary);
}

.list-enter-active,
.list-leave-active {
  transition: all 0.25s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
