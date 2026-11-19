<script setup>
import { computed, ref } from 'vue'
import BarChart from '@/components/BarChart.vue'
import EmptyState from '@/components/EmptyState.vue'
import ProgressBar from '@/components/ProgressBar.vue'
import StatTile from '@/components/StatTile.vue'
import { STATS_PERIODS } from '@/lib/constants.js'
import { formatKey } from '@/lib/dates.js'
import { percentLabel, pluralDays } from '@/lib/labels.js'
import { buildStats } from '@/lib/stats.js'
import { useHabitsStore } from '@/stores/habits.js'

const store = useHabitsStore()
const period = ref(30)

// Перераховується автоматично, коли змінюється період або відмітки
const stats = computed(() =>
  buildStats(store.activeHabits, store.doneSets, store.today, period.value),
)

const dailyItems = computed(() =>
  stats.value.daily.map((day) => ({
    label: period.value === 7 ? formatKey(day.key, 'EEEEEE') : formatKey(day.key, 'd.MM'),
    value: day.percent,
    title: `${formatKey(day.key, 'd MMMM')}: ${
      day.percent === null
        ? 'нічого не заплановано'
        : `${day.done} з ${day.scheduled} (${day.percent}%)`
    }`,
  })),
)

const weekdayItems = computed(() =>
  stats.value.weekdays.map((day) => ({
    label: day.short,
    value: day.percent,
    title: `${day.long}: ${day.percent === null ? 'немає даних' : `${day.percent}%`}`,
  })),
)

const labelEvery = computed(() => ({ 7: 1, 30: 5, 90: 15 })[period.value])

const bestWeekday = computed(() => {
  const days = stats.value.weekdays.filter((day) => day.percent !== null)
  if (days.length === 0) return null
  return days.reduce((best, day) => (day.percent > best.percent ? day : best))
})
</script>

<template>
  <div class="page">
    <header class="page-head">
      <div>
        <h1>Статистика</h1>
        <p class="page-subtitle">Активні звички за останні {{ period }} днів</p>
      </div>
      <fieldset class="segmented" aria-label="Період статистики">
        <legend class="sr-only">Період</legend>
        <label v-for="value in STATS_PERIODS" :key="value">
          <input v-model="period" type="radio" name="period" :value="value" />
          <span>{{ value }} днів</span>
        </label>
      </fieldset>
    </header>

    <EmptyState
      v-if="!stats.hasData"
      emoji="📊"
      title="Поки немає даних для статистики"
      text="Статистика з’явиться, коли у вас будуть активні звички із запланованими днями в цьому періоді."
    >
      <RouterLink class="btn" :to="{ name: 'habits' }">До звичок</RouterLink>
    </EmptyState>

    <template v-else>
      <section class="tiles section" aria-label="Підсумки періоду">
        <StatTile
          label="Загальне виконання"
          :value="percentLabel(stats.total.percent)"
          :hint="`${stats.total.done} з ${stats.total.scheduled} запланованих відміток`"
        />
        <StatTile
          icon="⭐"
          label="Найстабільніша звичка"
          :value="
            stats.mostStable ? `${stats.mostStable.habit.icon} ${stats.mostStable.habit.name}` : '—'
          "
          :hint="stats.mostStable ? `${stats.mostStable.percent}% виконання` : ''"
        />
        <StatTile
          label="Найкращий день тижня"
          :value="bestWeekday ? bestWeekday.long : '—'"
          :hint="bestWeekday ? `${bestWeekday.percent}% виконання` : ''"
        />
      </section>

      <section class="card section" aria-labelledby="daily-title">
        <h2 id="daily-title" class="section-title">Виконання по днях</h2>
        <BarChart
          :items="dailyItems"
          :label-every="labelEvery"
          :caption="`Відсоток виконаних звичок по днях за останні ${period} днів`"
        />
      </section>

      <div class="stats-grid">
        <section class="card" aria-labelledby="weekday-title">
          <h2 id="weekday-title" class="section-title">По днях тижня</h2>
          <BarChart
            :items="weekdayItems"
            caption="Відсоток виконання по днях тижня"
            :height="200"
          />
        </section>

        <section class="card" aria-labelledby="habits-title">
          <h2 id="habits-title" class="section-title">По звичках</h2>
          <ul class="habit-rates">
            <li
              v-for="item in stats.perHabit"
              :key="item.habit.id"
              :style="{ '--habit-color': item.habit.color }"
            >
              <div class="rate-row">
                <RouterLink
                  class="rate-name"
                  :to="{ name: 'habit', params: { id: item.habit.id } }"
                >
                  <span aria-hidden="true">{{ item.habit.icon }}</span>
                  {{ item.habit.name }}
                </RouterLink>
                <span class="rate-value">{{ percentLabel(item.percent) }}</span>
              </div>
              <ProgressBar
                :value="item.percent ?? 0"
                :label="`${item.habit.name}: виконання`"
                :color="item.habit.color"
                size="sm"
              />
              <p class="rate-meta">
                {{ item.done }} з {{ item.scheduled }} · серія {{ pluralDays(item.streak) }}
              </p>
            </li>
          </ul>
        </section>
      </div>
    </template>
  </div>
</template>

<style scoped>
.tiles {
  display: grid;
  gap: 0.75rem;
}

@media (min-width: 48rem) {
  .tiles {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

.stats-grid {
  display: grid;
  gap: 1rem;
}

@media (min-width: 64rem) {
  .stats-grid {
    grid-template-columns: 1fr 1fr;
    align-items: start;
  }
}

.habit-rates {
  display: grid;
  gap: 1rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.rate-row {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.375rem;
}

.rate-name {
  display: inline-flex;
  gap: 0.375rem;
  color: var(--text);
  font-weight: 600;
  text-decoration: none;
  overflow-wrap: anywhere;
}

:root[data-theme='dark'] .rate-name {
  color: var(--text);
}

.rate-name:hover {
  text-decoration: underline;
}

.rate-value {
  font-weight: 800;
}

.rate-meta {
  margin-top: 0.25rem;
  font-size: 0.8rem;
  color: var(--text-muted);
}
</style>
