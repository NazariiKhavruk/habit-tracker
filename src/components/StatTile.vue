<script setup>
defineProps({
  label: { type: String, required: true },
  value: { type: [String, Number], required: true },
  hint: { type: String, default: '' },
  icon: { type: String, default: '' },
})
</script>

<template>
  <div class="tile">
    <p class="tile-label">
      <span v-if="icon" aria-hidden="true">{{ icon }}</span>
      {{ label }}
    </p>
    <p class="tile-value">{{ value }}</p>
    <p v-if="hint" class="tile-hint">{{ hint }}</p>
  </div>
</template>

<style scoped>
.tile {
  padding: 0.875rem 1rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface);
}

.tile-label {
  display: flex;
  gap: 0.375rem;
  font-size: 0.85rem;
  color: var(--text-muted);
  font-weight: 600;
}

.tile-value {
  margin-top: 0.25rem;
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: -0.01em;
  overflow-wrap: anywhere;
}

.tile-hint {
  font-size: 0.8rem;
  color: var(--text-muted);
}
</style>
