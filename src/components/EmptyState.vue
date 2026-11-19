<script setup>
defineProps({
  emoji: { type: String, default: '🌱' },
  title: { type: String, required: true },
  text: { type: String, default: '' },
})
</script>

<template>
  <section class="empty card">
    <p class="empty-emoji" aria-hidden="true">{{ emoji }}</p>
    <h2>{{ title }}</h2>
    <p v-if="text" class="muted">{{ text }}</p>
    <div v-if="$slots.default" class="empty-actions">
      <slot />
    </div>
  </section>
</template>

<style scoped>
.empty {
  display: grid;
  justify-items: center;
  gap: 0.5rem;
  padding: 2.5rem 1.25rem;
  text-align: center;
}

.empty-emoji {
  font-size: 2.5rem;
}

.empty .muted {
  max-width: 28rem;
}

.empty-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 0.75rem;
}
</style>
