<script setup>
import { useRoute } from 'vue-router'
import { computed } from 'vue'
import { APP_NAME } from '@/lib/constants.js'
import { useUiStore } from '@/stores/ui.js'
import AppIcon from './AppIcon.vue'

defineProps({
  links: { type: Array, required: true },
})

const route = useRoute()

const ui = useUiStore()

const nextTheme = computed(() => (ui.resolvedTheme === 'dark' ? 'light' : 'dark'))
const themeLabel = computed(() =>
  nextTheme.value === 'dark' ? 'Увімкнути темну тему' : 'Увімкнути світлу тему',
)
</script>

<template>
  <header class="app-header">
    <div class="app-header-inner">
      <RouterLink class="logo" :to="{ name: 'today' }" :aria-label="`${APP_NAME}, на головну`">
        <span class="logo-mark" aria-hidden="true">
          <AppIcon name="check" :size="18" />
        </span>
        <span class="logo-text">{{ APP_NAME }}</span>
      </RouterLink>

      <nav class="desktop-nav" aria-label="Головне меню">
        <RouterLink
          v-for="link in links"
          :key="link.name"
          :to="{ name: link.name }"
          :class="{ 'is-section-active': route.meta.section === link.name }"
          :aria-current="route.meta.section === link.name ? 'page' : undefined"
        >
          <AppIcon :name="link.icon" :size="18" />
          {{ link.label }}
        </RouterLink>
      </nav>

      <button
        class="btn btn-ghost btn-icon"
        type="button"
        :aria-label="themeLabel"
        :title="themeLabel"
        @click="ui.setTheme(nextTheme)"
      >
        <AppIcon :name="nextTheme === 'dark' ? 'moon' : 'sun'" />
      </button>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 20;
  background: color-mix(in srgb, var(--surface) 88%, transparent);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--border);
}

.app-header-inner {
  display: flex;
  align-items: center;
  gap: 1rem;
  max-width: 72rem;
  height: var(--header-h);
  margin: 0 auto;
  padding: 0 1rem;
}

.logo {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-right: auto;
  color: var(--text);
  text-decoration: none;
  font-weight: 800;
  font-size: 1.2rem;
  letter-spacing: -0.01em;
}

:root[data-theme='dark'] .logo {
  color: var(--text);
}

.logo-mark {
  display: inline-grid;
  place-items: center;
  width: 2rem;
  height: 2rem;
  border-radius: 0.6rem;
  background: var(--primary);
  color: var(--on-primary);
}

.desktop-nav {
  display: none;
}

@media (min-width: 48rem) {
  .app-header-inner {
    padding: 0 1.5rem;
  }

  .desktop-nav {
    display: flex;
    gap: 0.25rem;
  }

  .desktop-nav a {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.5rem 0.75rem;
    border-radius: var(--radius-sm);
    color: var(--text-muted);
    font-weight: 600;
    text-decoration: none;
  }

  .desktop-nav a:hover {
    background: var(--surface-2);
    color: var(--text);
  }

  .desktop-nav a.is-section-active {
    background: var(--primary-soft);
    color: var(--primary-text);
  }
}
</style>
