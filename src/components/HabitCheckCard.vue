<script setup>
import { CATEGORIES } from '@/lib/constants.js'
import { pluralDays } from '@/lib/labels.js'
import AppIcon from './AppIcon.vue'

defineProps({
  habit: { type: Object, required: true },
  done: { type: Boolean, required: true },
  streak: { type: Number, required: true },
})

const emit = defineEmits(['toggle'])
</script>

<template>
  <article
    class="check-card"
    :class="{ 'is-done': done }"
    :style="{ '--habit-color': habit.color }"
  >
    <span class="habit-icon" aria-hidden="true">{{ habit.icon }}</span>

    <div class="check-main">
      <RouterLink class="check-name" :to="{ name: 'habit', params: { id: habit.id } }">
        {{ habit.name }}
      </RouterLink>
      <p class="check-meta">
        <span>{{ CATEGORIES[habit.category] }}</span>
        <span v-if="streak > 0" class="streak">
          <AppIcon name="flame" :size="14" />
          {{ pluralDays(streak) }}
        </span>
      </p>
    </div>

    <span class="status badge" :class="done ? 'badge-success' : ''">
      {{ done ? 'Виконано' : 'Не виконано' }}
    </span>

    <button
      class="check-btn"
      type="button"
      :aria-pressed="done"
      :aria-label="
        done ? `Скасувати відмітку «${habit.name}»` : `Позначити «${habit.name}» виконаною`
      "
      @click="emit('toggle')"
    >
      <AppIcon name="check" :size="22" />
    </button>
  </article>
</template>

<style scoped>
.check-card {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 0.875rem 0.875rem 0.875rem 1rem;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
  box-shadow: var(--shadow);
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease;
}

.check-card.is-done {
  border-color: color-mix(in srgb, var(--success) 40%, var(--border));
  background: color-mix(in srgb, var(--success) 7%, var(--surface));
}

.check-main {
  flex: 1;
  min-width: 0;
}

.check-name {
  display: block;
  color: var(--text);
  font-weight: 700;
  text-decoration: none;
  overflow-wrap: anywhere;
}

:root[data-theme='dark'] .check-name {
  color: var(--text);
}

.check-name:hover {
  text-decoration: underline;
}

.check-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem 0.75rem;
  margin-top: 0.125rem;
  font-size: 0.85rem;
  color: var(--text-muted);
}

.streak {
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  color: #c2410c;
  font-weight: 700;
}

:root[data-theme='dark'] .streak {
  color: #fb923c;
}

.status {
  display: none;
}

@media (min-width: 30rem) {
  .status {
    display: inline-flex;
  }
}

.check-btn {
  display: inline-grid;
  place-items: center;
  flex: none;
  width: 3rem;
  height: 3rem;
  border: 2px solid var(--border);
  border-radius: 50%;
  background: var(--surface);
  color: var(--text-muted);
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    transform 0.15s ease;
}

.check-btn:hover {
  border-color: var(--habit-color);
  color: var(--habit-color);
}

.check-btn[aria-pressed='true'] {
  border-color: var(--success);
  background: var(--success);
  color: #ffffff;
  animation: pop 0.3s ease;
}

:root[data-theme='dark'] .check-btn[aria-pressed='true'] {
  color: #0e1016;
}

@keyframes pop {
  50% {
    transform: scale(1.15);
  }
}
</style>
