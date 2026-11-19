<script setup>
import { nextTick, ref, watch } from 'vue'
import AppIcon from './AppIcon.vue'

// Модальне вікно на основі <dialog>: браузер сам тримає фокус усередині
// і закриває вікно клавішею Esc
const props = defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, required: true },
  size: { type: String, default: 'md' }, // sm | md
})

const emit = defineEmits(['close'])
const dialog = ref(null)
const titleId = `modal-title-${Math.random().toString(36).slice(2, 8)}`

watch(
  () => props.open,
  async (open) => {
    await nextTick()
    if (!dialog.value) return
    if (open && !dialog.value.open) dialog.value.showModal()
    if (!open && dialog.value.open) dialog.value.close()
  },
  { immediate: true },
)

function onCancel(event) {
  event.preventDefault()
  emit('close')
}

// Клік по затемненому фону закриває вікно
function onClick(event) {
  if (event.target === dialog.value) emit('close')
}
</script>

<template>
  <dialog
    ref="dialog"
    class="modal"
    :class="`modal-${size}`"
    :aria-labelledby="titleId"
    @cancel="onCancel"
    @click="onClick"
  >
    <div class="modal-box">
      <header class="modal-head">
        <h2 :id="titleId">{{ title }}</h2>
        <button
          class="btn btn-ghost btn-icon"
          type="button"
          aria-label="Закрити"
          @click="emit('close')"
        >
          <AppIcon name="x" />
        </button>
      </header>
      <div class="modal-body">
        <slot />
      </div>
      <footer v-if="$slots.footer" class="modal-foot">
        <slot name="footer" />
      </footer>
    </div>
  </dialog>
</template>

<style scoped>
.modal {
  width: min(100% - 2rem, 34rem);
  max-height: calc(100dvh - 2rem);
  padding: 0;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
  color: var(--text);
  box-shadow: var(--shadow-lg);
}

.modal-sm {
  width: min(100% - 2rem, 26rem);
}

.modal[open] {
  animation: modal-in 0.18s ease;
}

.modal::backdrop {
  background: rgb(10 12 20 / 55%);
}

@keyframes modal-in {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.98);
  }
}

.modal-box {
  display: flex;
  flex-direction: column;
  max-height: calc(100dvh - 2rem);
}

.modal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1rem 0.5rem 1.25rem;
}

.modal-body {
  padding: 0.5rem 1.25rem 1.25rem;
  overflow-y: auto;
}

.modal-foot {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 1rem 1.25rem;
  border-top: 1px solid var(--border);
}
</style>
