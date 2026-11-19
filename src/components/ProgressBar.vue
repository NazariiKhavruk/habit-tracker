<script setup>
defineProps({
  value: { type: Number, required: true }, // 0–100
  label: { type: String, required: true },
  color: { type: String, default: '' },
  size: { type: String, default: 'md' }, // sm | md
})
</script>

<template>
  <div
    class="progress"
    :class="`progress-${size}`"
    role="progressbar"
    :aria-label="label"
    aria-valuemin="0"
    aria-valuemax="100"
    :aria-valuenow="value"
  >
    <div
      class="progress-fill"
      :style="{ width: `${value}%`, background: color || undefined }"
    ></div>
  </div>
</template>

<style scoped>
.progress {
  width: 100%;
  height: 0.75rem;
  border-radius: 999px;
  background: var(--surface-2);
  overflow: hidden;
}

.progress-sm {
  height: 0.5rem;
}

.progress-fill {
  height: 100%;
  border-radius: inherit;
  background: var(--primary);
  transition: width 0.35s ease;
}
</style>
