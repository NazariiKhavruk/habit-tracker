<script setup>
import { useUiStore } from '@/stores/ui.js'
import AppIcon from './AppIcon.vue'

const ui = useUiStore()

const typeIcon = { success: 'check', error: 'alert', info: 'info' }
</script>

<template>
  <!-- aria-live: екранний диктор озвучує нові сповіщення -->
  <div class="toasts" aria-live="polite" aria-atomic="false">
    <TransitionGroup name="toast">
      <div
        v-for="toast in ui.toasts"
        :key="toast.id"
        class="toast"
        :class="`toast-${toast.type}`"
        role="status"
      >
        <span class="toast-icon" aria-hidden="true">
          <template v-if="toast.icon">{{ toast.icon }}</template>
          <AppIcon v-else :name="typeIcon[toast.type] ?? 'info'" :size="18" />
        </span>
        <div class="toast-body">
          <p v-if="toast.title" class="toast-title">{{ toast.title }}</p>
          <p>{{ toast.message }}</p>
        </div>
        <button
          class="toast-close"
          type="button"
          aria-label="Закрити сповіщення"
          @click="ui.dismiss(toast.id)"
        >
          <AppIcon name="x" :size="16" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toasts {
  position: fixed;
  right: 1rem;
  bottom: calc(var(--bottom-nav-h) + 1rem);
  left: 1rem;
  z-index: 60;
  display: grid;
  gap: 0.5rem;
  pointer-events: none;
}

@media (min-width: 48rem) {
  .toasts {
    left: auto;
    bottom: 1.5rem;
    width: 24rem;
  }
}

.toast {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem 0.75rem 0.75rem 1rem;
  border: 1px solid var(--border);
  border-left: 4px solid var(--primary);
  border-radius: var(--radius-sm);
  background: var(--surface);
  box-shadow: var(--shadow-lg);
  pointer-events: auto;
}

.toast-success {
  border-left-color: var(--success);
}

.toast-error {
  border-left-color: var(--danger);
}

.toast-achievement {
  border-left-color: #d97706;
  background: color-mix(in srgb, #f59e0b 10%, var(--surface));
}

.toast-icon {
  display: inline-grid;
  place-items: center;
  flex: none;
  width: 1.5rem;
  height: 1.5rem;
  font-size: 1.25rem;
  color: var(--primary);
}

.toast-success .toast-icon {
  color: var(--success);
}

.toast-error .toast-icon {
  color: var(--danger);
}

.toast-body {
  flex: 1;
  font-size: 0.925rem;
}

.toast-title {
  font-weight: 700;
}

.toast-close {
  display: inline-grid;
  place-items: center;
  width: 2rem;
  height: 2rem;
  border: 0;
  border-radius: 0.5rem;
  background: transparent;
  color: var(--text-muted);
}

.toast-close:hover {
  background: var(--surface-2);
}

.toast-enter-active,
.toast-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(12px);
}
</style>
