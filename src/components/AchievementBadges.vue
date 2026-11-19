<script setup>
import { computed } from 'vue'
import { ACHIEVEMENTS } from '@/lib/constants.js'
import { formatLong } from '@/lib/dates.js'
import { pluralDays } from '@/lib/labels.js'

const props = defineProps({
  achievements: { type: Array, required: true },
  best: { type: Number, required: true },
})

const items = computed(() =>
  ACHIEVEMENTS.map((item) => {
    const owned = props.achievements.find((a) => a.threshold === item.threshold)
    return {
      ...item,
      owned: Boolean(owned),
      text: owned
        ? `Отримано ${formatLong(owned.unlockedAt)}`
        : `Ще ${pluralDays(Math.max(item.threshold - props.best, 1))} до порогу`,
    }
  }),
)
</script>

<template>
  <ul class="badges">
    <li
      v-for="item in items"
      :key="item.threshold"
      class="badge-card"
      :class="{ 'is-owned': item.owned }"
    >
      <span class="badge-emoji" aria-hidden="true">{{ item.owned ? item.icon : '🔒' }}</span>
      <span class="badge-title">{{ item.title }}</span>
      <span class="badge-days">{{ pluralDays(item.threshold) }} поспіль</span>
      <span class="badge-text">
        <span class="sr-only">{{ item.owned ? 'Отримано.' : 'Ще не отримано.' }}</span>
        {{ item.text }}
      </span>
    </li>
  </ul>
</template>

<style scoped>
.badges {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(9rem, 100%), 1fr));
  gap: 0.75rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.badge-card {
  display: grid;
  justify-items: center;
  gap: 0.125rem;
  padding: 1rem 0.5rem;
  border: 1px dashed var(--border);
  border-radius: var(--radius-sm);
  text-align: center;
  color: var(--text-muted);
}

.badge-card.is-owned {
  border-style: solid;
  border-color: #f59e0b;
  background: color-mix(in srgb, #f59e0b 10%, var(--surface));
  color: var(--text);
}

.badge-emoji {
  font-size: 1.75rem;
}

.badge-card:not(.is-owned) .badge-emoji {
  filter: grayscale(1);
  opacity: 0.6;
}

.badge-title {
  font-weight: 800;
}

.badge-days,
.badge-text {
  font-size: 0.8rem;
}

.badge-card .badge-text {
  color: var(--text-muted);
}
</style>
