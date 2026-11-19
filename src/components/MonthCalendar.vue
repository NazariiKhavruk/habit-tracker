<script setup>
import { computed, ref } from 'vue'
import { addMonths, endOfMonth, getISODay, startOfMonth } from 'date-fns'
import { WEEKDAYS } from '@/lib/constants.js'
import { formatKey, fromKey, rangeKeys, toKey } from '@/lib/dates.js'
import { isScheduled, startKey } from '@/lib/streaks.js'
import AppIcon from './AppIcon.vue'

const props = defineProps({
  habit: { type: Object, required: true },
  doneSet: { type: Set, required: true },
  today: { type: String, required: true },
})

const emit = defineEmits(['toggle'])

const month = ref(toKey(startOfMonth(fromKey(props.today))))
const currentMonth = computed(() => toKey(startOfMonth(fromKey(props.today))))

const title = computed(() => formatKey(month.value, 'LLLL yyyy'))
const start = computed(() => startKey(props.habit, props.doneSet))

const cells = computed(() => {
  const first = fromKey(month.value)
  const blanks = getISODay(first) - 1 // тиждень починається з понеділка
  const days = rangeKeys(month.value, toKey(endOfMonth(first))).map((key) => {
    const future = key > props.today
    const scheduled = isScheduled(props.habit, key)
    const done = props.doneSet.has(key)
    const missed = !future && scheduled && !done && key >= start.value && key !== props.today
    let state = 'не заплановано'
    if (future) state = 'майбутній день'
    else if (done) state = 'виконано'
    else if (missed) state = 'пропущено'
    else if (scheduled) state = 'не виконано'

    return {
      key,
      day: Number(key.slice(8)),
      done,
      missed,
      scheduled,
      future,
      isToday: key === props.today,
      canToggle: scheduled && !future,
      label: `${formatKey(key, 'd MMMM')}: ${state}`,
    }
  })
  return { blanks, days }
})

function shift(amount) {
  month.value = toKey(addMonths(fromKey(month.value), amount))
}
</script>

<template>
  <section
    class="calendar"
    :style="{ '--habit-color': habit.color }"
    aria-label="Календар виконання"
  >
    <div class="calendar-head">
      <button
        class="btn btn-ghost btn-icon"
        type="button"
        aria-label="Попередній місяць"
        @click="shift(-1)"
      >
        <AppIcon name="chevron-left" />
      </button>
      <h3 class="calendar-title" aria-live="polite">{{ title }}</h3>
      <button
        class="btn btn-ghost btn-icon"
        type="button"
        aria-label="Наступний місяць"
        :disabled="month >= currentMonth"
        @click="shift(1)"
      >
        <AppIcon name="chevron-right" />
      </button>
    </div>

    <div class="calendar-grid">
      <span v-for="day in WEEKDAYS" :key="day.value" class="calendar-weekday" :title="day.long">
        {{ day.short }}
      </span>
      <span v-for="n in cells.blanks" :key="`blank-${n}`" aria-hidden="true"></span>
      <button
        v-for="cell in cells.days"
        :key="cell.key"
        type="button"
        class="calendar-day"
        :class="{
          'is-done': cell.done,
          'is-missed': cell.missed,
          'is-off': !cell.scheduled,
          'is-today': cell.isToday,
        }"
        :disabled="!cell.canToggle"
        :aria-pressed="cell.canToggle ? cell.done : undefined"
        :aria-label="cell.label"
        :title="cell.label"
        @click="emit('toggle', cell.key)"
      >
        {{ cell.day }}
        <AppIcon v-if="cell.done" class="calendar-check" name="check" :size="10" />
      </button>
    </div>

    <ul class="legend">
      <li><span class="legend-mark is-done"></span>Виконано</li>
      <li><span class="legend-mark is-missed"></span>Пропущено</li>
      <li><span class="legend-mark is-off"></span>Не заплановано</li>
    </ul>
    <p class="calendar-hint">
      Натисніть на минулий або сьогоднішній день, щоб поставити чи зняти відмітку.
    </p>
  </section>
</template>

<style scoped>
.calendar-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.calendar-title {
  font-size: 1.05rem;
  text-transform: capitalize;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 0.3rem;
}

.calendar-weekday {
  padding-bottom: 0.25rem;
  text-align: center;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-muted);
}

.calendar-day {
  position: relative;
  display: grid;
  place-items: center;
  aspect-ratio: 1;
  min-height: 2.25rem;
  border: 2px solid var(--border);
  border-radius: 0.65rem;
  background: var(--surface);
  font-weight: 700;
  font-size: 0.9rem;
  transition:
    transform 0.1s ease,
    background-color 0.15s ease;
}

.calendar-day:not(:disabled):hover {
  transform: scale(1.06);
  border-color: var(--habit-color);
}

.calendar-day.is-done {
  border-color: var(--habit-color);
  background: var(--habit-color);
  color: #ffffff;
}

.calendar-day.is-missed {
  border-style: dashed;
  border-color: var(--danger);
  color: var(--danger);
}

.calendar-day.is-off,
.calendar-day:disabled:not(.is-done) {
  border-color: transparent;
  background: var(--surface-2);
  color: var(--text-muted);
  cursor: default;
}

.calendar-day.is-today {
  box-shadow:
    0 0 0 2px var(--surface),
    0 0 0 4px var(--primary);
}

.calendar-check {
  position: absolute;
  top: 3px;
  right: 3px;
}

.legend {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1rem;
  margin: 0.875rem 0 0;
  padding: 0;
  list-style: none;
  font-size: 0.85rem;
  color: var(--text-muted);
}

.legend li {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
}

.legend-mark {
  width: 0.9rem;
  height: 0.9rem;
  border: 2px solid var(--border);
  border-radius: 0.25rem;
}

.legend-mark.is-done {
  border-color: var(--habit-color);
  background: var(--habit-color);
}

.legend-mark.is-missed {
  border-style: dashed;
  border-color: var(--danger);
}

.legend-mark.is-off {
  border-color: transparent;
  background: var(--surface-2);
}

.calendar-hint {
  margin-top: 0.5rem;
  font-size: 0.85rem;
  color: var(--text-muted);
}
</style>
