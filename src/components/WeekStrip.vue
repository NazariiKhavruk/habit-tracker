<script setup>
import { computed } from 'vue'
import { formatKey, lastDays } from '@/lib/dates.js'

// Останні 7 днів, щоб швидко відмітити вчорашню чи позавчорашню звичку
const props = defineProps({
  modelValue: { type: String, required: true },
  today: { type: String, required: true },
  progress: { type: Function, required: true }, // (key) => відсоток або null
})

const emit = defineEmits(['update:modelValue'])

const days = computed(() =>
  lastDays(props.today, 7).map((key) => ({
    key,
    weekday: formatKey(key, 'EEEEEE'),
    day: formatKey(key, 'd'),
    full: formatKey(key, 'EEEE, d MMMM'),
    percent: props.progress(key),
  })),
)
</script>

<template>
  <div class="week" role="group" aria-label="Оберіть день">
    <button
      v-for="day in days"
      :key="day.key"
      type="button"
      class="week-day"
      :class="{ 'is-today': day.key === today, 'is-complete': day.percent === 100 }"
      :aria-pressed="day.key === modelValue"
      :aria-label="`${day.full}${day.percent !== null ? `, виконано ${day.percent}%` : ''}`"
      @click="emit('update:modelValue', day.key)"
    >
      <span class="week-name">{{ day.weekday }}</span>
      <span class="week-num">{{ day.day }}</span>
      <span class="week-dot" :style="{ '--p': day.percent ?? 0 }" aria-hidden="true"></span>
    </button>
  </div>
</template>

<style scoped>
.week {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 0.375rem;
}

.week-day {
  display: grid;
  justify-items: center;
  gap: 0.125rem;
  padding: 0.5rem 0.25rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface);
  color: var(--text);
}

.week-day:hover {
  border-color: var(--primary);
}

.week-day[aria-pressed='true'] {
  border-color: var(--primary);
  background: var(--primary);
  color: var(--on-primary);
}

.week-name {
  font-size: 0.75rem;
  text-transform: capitalize;
  opacity: 0.85;
}

.week-num {
  font-size: 1.1rem;
  font-weight: 800;
}

.is-today:not([aria-pressed='true']) .week-num {
  color: var(--primary-text);
}

/* Маленьке кільце: наскільки виконано день */
.week-dot {
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 50%;
  background: conic-gradient(var(--success) calc(var(--p) * 1%), var(--surface-2) 0);
}

.week-day[aria-pressed='true'] .week-dot {
  background: conic-gradient(currentColor calc(var(--p) * 1%), rgb(255 255 255 / 30%) 0);
}
</style>
