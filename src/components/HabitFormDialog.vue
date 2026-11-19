<script setup>
import { computed } from 'vue'
import { useHabitsStore } from '@/stores/habits.js'
import { useUiStore } from '@/stores/ui.js'
import BaseModal from './BaseModal.vue'
import HabitForm from './HabitForm.vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  // Якщо передано звичку — форма редагування, інакше — створення
  habit: { type: Object, default: null },
})

const emit = defineEmits(['close', 'saved'])
const store = useHabitsStore()
const ui = useUiStore()

const isEdit = computed(() => props.habit !== null)
const formId = computed(() => (isEdit.value ? 'edit-habit' : 'new-habit'))

function save(form) {
  if (isEdit.value) {
    store.updateHabit(props.habit.id, form)
    ui.notify(`Зміни у «${form.name.trim()}» збережено`)
    emit('saved', props.habit)
  } else {
    const habit = store.addHabit(form)
    ui.notify(`Звичку «${habit.name}» створено`)
    emit('saved', habit)
  }
  emit('close')
}
</script>

<template>
  <BaseModal
    :open="open"
    :title="isEdit ? 'Редагувати звичку' : 'Нова звичка'"
    @close="emit('close')"
  >
    <!-- v-if перестворює форму при кожному відкритті, тож поля завжди свіжі -->
    <HabitForm v-if="open" :form-id="formId" :habit="habit" @submit="save" />
    <template #footer>
      <button class="btn btn-secondary" type="button" @click="emit('close')">Скасувати</button>
      <button class="btn" type="submit" :form="formId">
        {{ isEdit ? 'Зберегти' : 'Створити' }}
      </button>
    </template>
  </BaseModal>
</template>
