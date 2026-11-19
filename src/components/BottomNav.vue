<script setup>
import { useRoute } from 'vue-router'
import AppIcon from './AppIcon.vue'

defineProps({
  links: { type: Array, required: true },
})

const route = useRoute()
</script>

<template>
  <nav class="bottom-nav" aria-label="Головне меню">
    <RouterLink
      v-for="link in links"
      :key="link.name"
      :to="{ name: link.name }"
      :class="{ 'is-section-active': route.meta.section === link.name }"
      :aria-current="route.meta.section === link.name ? 'page' : undefined"
    >
      <AppIcon :name="link.icon" :size="22" />
      <span>{{ link.label }}</span>
    </RouterLink>
  </nav>
</template>

<style scoped>
.bottom-nav {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 20;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  height: calc(var(--bottom-nav-h) + env(safe-area-inset-bottom));
  padding-bottom: env(safe-area-inset-bottom);
  background: var(--surface);
  border-top: 1px solid var(--border);
}

.bottom-nav a {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.2rem;
  color: var(--text-muted);
  font-size: 0.75rem;
  font-weight: 600;
  text-decoration: none;
}

.bottom-nav a.is-section-active {
  color: var(--primary-text);
}

:root[data-theme='dark'] .bottom-nav a.is-section-active {
  color: var(--primary);
}

.bottom-nav a:focus-visible {
  outline-offset: -4px;
}

@media (min-width: 48rem) {
  .bottom-nav {
    display: none;
  }
}
</style>
