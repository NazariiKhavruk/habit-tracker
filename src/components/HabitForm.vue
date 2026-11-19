<script setup>
import { computed, nextTick, reactive, ref } from 'vue'
import { CATEGORIES, COLORS, ICONS, NAME_MAX, NAME_MIN, WEEKDAYS } from '@/lib/constants.js'

const props = defineProps({
  formId: { type: String, required: true },
  habit: { type: Object, default: null },
})

const emit = defineEmits(['submit'])

const form = reactive({
  name: props.habit?.name ?? '',
  icon: props.habit?.icon ?? ICONS[0],
  color: props.habit?.color ?? COLORS[0].value,
  category: props.habit?.category ?? 'health',
  schedule: {
    type: props.habit?.schedule.type ?? 'daily',
    days: props.habit?.schedule.days ? [...props.habit.schedule.days] : [1, 2, 3, 4, 5],
  },
})

// Помилки показуються після першого введення або після спроби зберегти
const touched = reactive({ name: false, days: false })
const nameInput = ref(null)

const nameLength = computed(() => form.name.trim().length)

const errors = computed(() => ({
  name:
    nameLength.value === 0
      ? 'Введіть назву звички'
      : nameLength.value < NAME_MIN || nameLength.value > NAME_MAX
        ? `Назва має містити від ${NAME_MIN} до ${NAME_MAX} символів`
        : '',
  days:
    form.schedule.type === 'days' && form.schedule.days.length === 0
      ? 'Оберіть хоча б один день тижня'
      : '',
}))

const isValid = computed(() => !errors.value.name && !errors.value.days)

async function submit() {
  touched.name = true
  touched.days = true
  if (!isValid.value) {
    await nextTick()
    if (errors.value.name) nameInput.value.focus()
    return
  }
  emit('submit', {
    name: form.name,
    icon: form.icon,
    color: form.color,
    category: form.category,
    schedule: { type: form.schedule.type, days: form.schedule.days },
  })
}

function focusName() {
  nameInput.value?.focus()
}

defineExpose({ focusName })
</script>

<template>
  <form :id="formId" class="habit-form" novalidate @submit.prevent="submit">
    <div class="field">
      <label class="field-label" :for="`${formId}-name`">Назва</label>
      <input
        :id="`${formId}-name`"
        ref="nameInput"
        v-model="form.name"
        class="input"
        type="text"
        autocomplete="off"
        placeholder="Наприклад, «Випити 2 л води»"
        :aria-invalid="touched.name && !!errors.name"
        :aria-describedby="`${formId}-name-hint ${formId}-name-error`"
        @input="touched.name = true"
        @blur="touched.name = true"
      />
      <div class="name-meta">
        <p :id="`${formId}-name-error`" class="field-error" aria-live="polite">
          {{ touched.name ? errors.name : '' }}
        </p>
        <p
          :id="`${formId}-name-hint`"
          class="field-hint"
          :class="{ 'is-over': nameLength > NAME_MAX }"
        >
          {{ nameLength }}/{{ NAME_MAX }}
        </p>
      </div>
    </div>

    <fieldset class="field">
      <legend class="field-label">Іконка</legend>
      <div class="icon-grid">
        <label v-for="icon in ICONS" :key="icon" class="icon-option">
          <input v-model="form.icon" class="sr-only" type="radio" name="icon" :value="icon" />
          <span :style="{ '--habit-color': form.color }">{{ icon }}</span>
        </label>
      </div>
    </fieldset>

    <fieldset class="field">
      <legend class="field-label">Колір</legend>
      <div class="color-grid">
        <label v-for="color in COLORS" :key="color.value" class="color-option">
          <input
            v-model="form.color"
            class="sr-only"
            type="radio"
            name="color"
            :value="color.value"
          />
          <span :style="{ background: color.value }" :title="color.name">
            <span class="sr-only">{{ color.name }}</span>
          </span>
        </label>
      </div>
    </fieldset>

    <div class="field">
      <label class="field-label" :for="`${formId}-category`">Категорія</label>
      <select :id="`${formId}-category`" v-model="form.category" class="select">
        <option v-for="(label, value) in CATEGORIES" :key="value" :value="value">
          {{ label }}
        </option>
      </select>
    </div>

    <fieldset class="field">
      <legend class="field-label">Розклад</legend>
      <div class="segmented">
        <label>
          <input v-model="form.schedule.type" type="radio" name="schedule" value="daily" />
          <span>Щодня</span>
        </label>
        <label>
          <input v-model="form.schedule.type" type="radio" name="schedule" value="days" />
          <span>Вибрані дні</span>
        </label>
      </div>

      <div v-if="form.schedule.type === 'days'" class="days" role="group" aria-label="Дні тижня">
        <label v-for="day in WEEKDAYS" :key="day.value" class="day-option">
          <input
            v-model="form.schedule.days"
            class="sr-only"
            type="checkbox"
            :value="day.value"
            @change="touched.days = true"
          />
          <span :title="day.long">{{ day.short }}</span>
        </label>
      </div>
      <p v-if="touched.days && errors.days" class="field-error" role="alert">{{ errors.days }}</p>
    </fieldset>
  </form>
</template>

<style scoped>
.habit-form {
  display: grid;
  gap: 1.1rem;
}

.name-meta {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  min-height: 1.3rem;
}

.name-meta .field-hint {
  margin-left: auto;
}

.field-hint.is-over {
  color: var(--danger);
  font-weight: 600;
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(8, minmax(0, 1fr));
  gap: 0.375rem;
}

.icon-option span {
  display: grid;
  place-items: center;
  aspect-ratio: 1;
  border: 2px solid var(--border);
  border-radius: 0.75rem;
  font-size: 1.3rem;
  cursor: pointer;
  transition: transform 0.1s ease;
}

.icon-option span:hover {
  transform: scale(1.06);
}

.icon-option input:checked + span {
  border-color: var(--habit-color);
  background: color-mix(in srgb, var(--habit-color) 16%, var(--surface));
}

.color-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.color-option > span {
  position: relative;
  display: block;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: inset 0 0 0 2px rgb(255 255 255 / 25%);
}

.color-option input:checked + span::after {
  content: '';
  position: absolute;
  inset: -4px;
  border: 3px solid var(--text);
  border-radius: 50%;
}

.icon-option input:focus-visible + span,
.color-option input:focus-visible + span,
.day-option input:focus-visible + span {
  outline: 3px solid var(--focus);
  outline-offset: 2px;
}

.days {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
  margin-top: 0.75rem;
}

.day-option span {
  display: inline-grid;
  place-items: center;
  width: 2.75rem;
  height: 2.75rem;
  border: 2px solid var(--border);
  border-radius: 50%;
  font-weight: 700;
  font-size: 0.875rem;
  cursor: pointer;
}

.day-option input:checked + span {
  border-color: var(--primary);
  background: var(--primary);
  color: var(--on-primary);
}

@media (max-width: 22.5rem) {
  .icon-grid {
    grid-template-columns: repeat(6, minmax(0, 1fr));
  }
}
</style>
