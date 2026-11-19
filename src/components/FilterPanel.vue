<script setup>
import { CATEGORIES } from '@/lib/constants.js'
import AppIcon from './AppIcon.vue'

// v-model: { query, category, status, sort }
const filters = defineModel({ type: Object, required: true })
defineEmits(['reset'])

const SORTS = {
  name: 'За назвою (А–Я)',
  streak: 'За серією днів',
  newest: 'Спершу нові',
  oldest: 'Спершу старі',
}

function update(key, value) {
  filters.value = { ...filters.value, [key]: value }
}
</script>

<template>
  <section class="filters card" aria-label="Пошук і фільтри">
    <div class="field filters-search">
      <label class="field-label" for="habit-search">Пошук</label>
      <div class="search-wrap">
        <AppIcon class="search-icon" name="search" :size="18" />
        <input
          id="habit-search"
          class="input"
          type="search"
          placeholder="Назва звички"
          :value="filters.query"
          @input="update('query', $event.target.value)"
        />
      </div>
    </div>

    <div class="field">
      <label class="field-label" for="habit-category">Категорія</label>
      <select
        id="habit-category"
        class="select"
        :value="filters.category"
        @change="update('category', $event.target.value)"
      >
        <option value="all">Усі категорії</option>
        <option v-for="(label, value) in CATEGORIES" :key="value" :value="value">
          {{ label }}
        </option>
      </select>
    </div>

    <div class="field">
      <label class="field-label" for="habit-status">Статус</label>
      <select
        id="habit-status"
        class="select"
        :value="filters.status"
        @change="update('status', $event.target.value)"
      >
        <option value="active">Активні</option>
        <option value="archived">Архів</option>
        <option value="all">Усі</option>
      </select>
    </div>

    <div class="field">
      <label class="field-label" for="habit-sort">Сортування</label>
      <select
        id="habit-sort"
        class="select"
        :value="filters.sort"
        @change="update('sort', $event.target.value)"
      >
        <option v-for="(label, value) in SORTS" :key="value" :value="value">{{ label }}</option>
      </select>
    </div>
  </section>
</template>

<style scoped>
.filters {
  display: grid;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

@media (min-width: 48rem) {
  .filters {
    grid-template-columns: 2fr repeat(3, minmax(0, 1fr));
    align-items: end;
  }
}

.search-wrap {
  position: relative;
}

.search-icon {
  position: absolute;
  top: 50%;
  left: 0.75rem;
  color: var(--text-muted);
  transform: translateY(-50%);
  pointer-events: none;
}

.search-wrap .input {
  padding-left: 2.4rem;
}
</style>
