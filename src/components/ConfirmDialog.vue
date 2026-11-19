<script setup>
import BaseModal from './BaseModal.vue'

defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, required: true },
  message: { type: String, required: true },
  confirmText: { type: String, default: 'Підтвердити' },
  danger: { type: Boolean, default: false },
})

const emit = defineEmits(['confirm', 'cancel'])
</script>

<template>
  <BaseModal :open="open" :title="title" size="sm" @close="emit('cancel')">
    <p class="confirm-text">{{ message }}</p>
    <template #footer>
      <button class="btn btn-secondary" type="button" @click="emit('cancel')">Скасувати</button>
      <button class="btn" :class="{ 'btn-danger': danger }" type="button" @click="emit('confirm')">
        {{ confirmText }}
      </button>
    </template>
  </BaseModal>
</template>

<style scoped>
.confirm-text {
  color: var(--text-muted);
}
</style>
