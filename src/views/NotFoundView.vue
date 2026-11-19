<script setup>
import { useRoute } from 'vue-router'
import EmptyState from '@/components/EmptyState.vue'

const route = useRoute()
</script>

<template>
  <div class="page">
    <EmptyState
      emoji="🧭"
      title="Сторінку не знайдено"
      :text="`Адреси ${route.fullPath} у застосунку немає. Перевірте посилання або поверніться на головну.`"
    >
      <RouterLink class="btn" :to="{ name: 'today' }">На головну</RouterLink>
      <RouterLink class="btn btn-secondary" :to="{ name: 'habits' }">До звичок</RouterLink>
    </EmptyState>
  </div>
</template>
