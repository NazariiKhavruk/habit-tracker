<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AchievementBadges from '@/components/AchievementBadges.vue'
import AppIcon from '@/components/AppIcon.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import EmptyState from '@/components/EmptyState.vue'
import HabitFormDialog from '@/components/HabitFormDialog.vue'
import MonthCalendar from '@/components/MonthCalendar.vue'
import StatTile from '@/components/StatTile.vue'
import { CATEGORIES } from '@/lib/constants.js'
import { formatLong } from '@/lib/dates.js'
import { percentLabel, pluralDays, scheduleLabel } from '@/lib/labels.js'
import { completionRate, totalCompletions } from '@/lib/streaks.js'
import { useHabitsStore } from '@/stores/habits.js'
import { useUiStore } from '@/stores/ui.js'

const route = useRoute()
const router = useRouter()
const store = useHabitsStore()
const ui = useUiStore()

const habit = computed(() => store.getHabit(String(route.params.id)))
const doneSet = computed(() => store.doneSetOf(habit.value?.id))

const stats = computed(() => {
  const h = habit.value
  return {
    current: store.streakOf(h),
    best: store.bestStreakOf(h),
    week: completionRate(h, doneSet.value, store.today, 7),
    month: completionRate(h, doneSet.value, store.today, 30),
    total: totalCompletions(doneSet.value, store.today),
  }
})

const editOpen = ref(false)
const confirmDelete = ref(false)

function toggleDay(key) {
  store.toggleCompletion(habit.value.id, key)
}

function toggleArchive() {
  const archived = !habit.value.archived
  store.setArchived(habit.value.id, archived)
  ui.notify(
    archived ? `«${habit.value.name}» перенесено в архів` : `«${habit.value.name}» знову активна`,
  )
}

function remove() {
  const name = habit.value.name
  confirmDelete.value = false
  store.removeHabit(habit.value.id)
  ui.notify(`Звичку «${name}» видалено`)
  router.push({ name: 'habits' })
}
</script>

<template>
  <div class="page">
    <RouterLink class="back-link" :to="{ name: 'habits' }">
      <AppIcon name="arrow-left" :size="18" />
      Усі звички
    </RouterLink>

    <EmptyState
      v-if="!habit"
      emoji="🤷"
      title="Звичку не знайдено"
      text="Можливо, її видалили або посилання містить помилку."
    >
      <RouterLink class="btn" :to="{ name: 'habits' }">До списку звичок</RouterLink>
    </EmptyState>

    <template v-else>
      <header class="detail-head card section" :style="{ '--habit-color': habit.color }">
        <span class="habit-icon detail-icon" aria-hidden="true">{{ habit.icon }}</span>
        <div class="detail-info">
          <h1>{{ habit.name }}</h1>
          <p class="detail-tags">
            <span class="badge badge-primary">{{ CATEGORIES[habit.category] }}</span>
            <span class="badge">
              <AppIcon name="calendar" :size="14" />
              {{ scheduleLabel(habit.schedule) }}
            </span>
            <span v-if="habit.archived" class="badge badge-warning">
              <AppIcon name="archive" :size="14" />
              В архіві
            </span>
          </p>
        </div>
        <div class="detail-actions">
          <button class="btn btn-secondary btn-sm" type="button" @click="editOpen = true">
            <AppIcon name="edit" :size="16" />
            Редагувати
          </button>
          <button class="btn btn-secondary btn-sm" type="button" @click="toggleArchive">
            <AppIcon :name="habit.archived ? 'restore' : 'archive'" :size="16" />
            {{ habit.archived ? 'Відновити' : 'В архів' }}
          </button>
          <button class="btn btn-danger-outline btn-sm" type="button" @click="confirmDelete = true">
            <AppIcon name="trash" :size="16" />
            Видалити
          </button>
        </div>
      </header>

      <section class="section" aria-label="Показники звички">
        <div class="tiles">
          <StatTile icon="🔥" label="Поточна серія" :value="pluralDays(stats.current)" />
          <StatTile icon="🏆" label="Найкраща серія" :value="pluralDays(stats.best)" />
          <StatTile
            label="За 7 днів"
            :value="percentLabel(stats.week.percent)"
            :hint="`${stats.week.done} з ${stats.week.scheduled} запланованих`"
          />
          <StatTile
            label="За 30 днів"
            :value="percentLabel(stats.month.percent)"
            :hint="`${stats.month.done} з ${stats.month.scheduled} запланованих`"
          />
          <StatTile label="Усього виконань" :value="stats.total" />
          <StatTile label="Створено" :value="formatLong(habit.createdAt)" />
        </div>
      </section>

      <div class="detail-grid">
        <section class="card" aria-labelledby="calendar-title">
          <h2 id="calendar-title" class="section-title">Календар</h2>
          <MonthCalendar
            :key="habit.id"
            :habit="habit"
            :done-set="doneSet"
            :today="store.today"
            @toggle="toggleDay"
          />
        </section>

        <section class="card" aria-labelledby="badges-title">
          <h2 id="badges-title" class="section-title">Досягнення</h2>
          <AchievementBadges :achievements="habit.achievements" :best="stats.best" />
          <p class="badges-note muted">
            Серія рахує лише дні з розкладу. Пропуск запланованого дня обриває серію, але отримані
            бейджі залишаються.
          </p>
        </section>
      </div>

      <HabitFormDialog :open="editOpen" :habit="habit" @close="editOpen = false" />
      <ConfirmDialog
        :open="confirmDelete"
        title="Видалити звичку?"
        :message="`Звичку «${habit.name}» і всі її відмітки буде видалено назавжди. Якщо хочете лише приховати її, перенесіть в архів.`"
        confirm-text="Видалити"
        danger
        @confirm="remove"
        @cancel="confirmDelete = false"
      />
    </template>
  </div>
</template>

<style scoped>
.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  margin-bottom: 1rem;
  font-weight: 600;
  text-decoration: none;
}

.back-link:hover {
  text-decoration: underline;
}

.detail-head {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 1rem;
  align-items: center;
  border-top: 4px solid var(--habit-color);
}

.detail-icon {
  width: 3.5rem;
  height: 3.5rem;
  font-size: 1.8rem;
}

.detail-info h1 {
  overflow-wrap: anywhere;
}

.detail-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
  margin-top: 0.375rem;
}

.detail-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  grid-column: 1 / -1;
}

@media (min-width: 48rem) {
  .detail-head {
    grid-template-columns: auto 1fr auto;
  }

  .detail-actions {
    grid-column: auto;
    justify-content: flex-end;
  }
}

.tiles {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}

@media (min-width: 48rem) {
  .tiles {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (min-width: 80rem) {
  .tiles {
    grid-template-columns: repeat(6, minmax(0, 1fr));
  }
}

.detail-grid {
  display: grid;
  gap: 1rem;
}

@media (min-width: 64rem) {
  .detail-grid {
    grid-template-columns: 3fr 2fr;
    align-items: start;
  }
}

.badges-note {
  margin-top: 0.875rem;
  font-size: 0.85rem;
}
</style>
