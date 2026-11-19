<script setup>
import { CATEGORIES } from '@/lib/constants.js'
import { formatLong } from '@/lib/dates.js'
import { pluralDays, scheduleLabel } from '@/lib/labels.js'
import AppIcon from './AppIcon.vue'

defineProps({
  habit: { type: Object, required: true },
  streak: { type: Number, required: true },
})
</script>

<template>
  <RouterLink
    class="habit-item"
    :class="{ 'is-archived': habit.archived }"
    :to="{ name: 'habit', params: { id: habit.id } }"
    :style="{ '--habit-color': habit.color }"
  >
    <span class="habit-icon" aria-hidden="true">{{ habit.icon }}</span>
    <span class="habit-item-main">
      <span class="habit-item-name">{{ habit.name }}</span>
      <span class="habit-item-meta">
        {{ CATEGORIES[habit.category] }} · {{ scheduleLabel(habit.schedule) }} · з
        {{ formatLong(habit.createdAt) }}
      </span>
    </span>
    <span class="habit-item-side">
      <span v-if="habit.archived" class="badge">
        <AppIcon name="archive" :size="14" />
        Архів
      </span>
      <span v-else class="badge" :class="{ 'badge-warning': streak > 0 }">
        <AppIcon name="flame" :size="14" />
        {{ pluralDays(streak) }}
      </span>
      <AppIcon class="chevron" name="chevron-right" :size="18" />
    </span>
  </RouterLink>
</template>

<style scoped>
.habit-item {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 0.875rem 1rem;
  border: 1px solid var(--border);
  border-left: 4px solid var(--habit-color);
  border-radius: var(--radius);
  background: var(--surface);
  color: var(--text);
  text-decoration: none;
  box-shadow: var(--shadow);
  transition:
    transform 0.15s ease,
    border-color 0.15s ease;
}

:root[data-theme='dark'] .habit-item {
  color: var(--text);
}

.habit-item:hover {
  transform: translateY(-1px);
  border-color: var(--habit-color);
}

.habit-item.is-archived {
  opacity: 0.75;
}

.habit-item-main {
  display: grid;
  flex: 1;
  min-width: 0;
}

.habit-item-name {
  font-weight: 700;
  overflow-wrap: anywhere;
}

.habit-item-meta {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.habit-item-side {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.chevron {
  color: var(--text-muted);
}
</style>
