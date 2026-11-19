<script setup>
import { computed, ref } from 'vue'
import AppIcon from '@/components/AppIcon.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import { APP_NAME } from '@/lib/constants.js'
import { DATA_KEY, buildExport, parseImport } from '@/lib/storage.js'
import { useHabitsStore } from '@/stores/habits.js'
import { useUiStore } from '@/stores/ui.js'

const store = useHabitsStore()
const ui = useUiStore()

const THEMES = [
  { value: 'system', label: 'Як у системі', icon: 'monitor' },
  { value: 'light', label: 'Світла', icon: 'sun' },
  { value: 'dark', label: 'Темна', icon: 'moon' },
]

const fileInput = ref(null)
const importError = ref('')
const pendingImport = ref(null)
const confirm = ref('') // '' | 'import' | 'demo' | 'reset'

const usedKb = computed(() => {
  // Перераховується після кожної зміни звичок чи відміток
  void store.habits.length
  void store.completions.length
  try {
    return ((localStorage.getItem(DATA_KEY)?.length ?? 0) / 1024).toFixed(1)
  } catch {
    return '—'
  }
})

function exportData() {
  const payload = buildExport({ habits: store.habits, completions: store.completions })
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `habitflow-backup-${store.today}.json`
  link.click()
  URL.revokeObjectURL(url)
  ui.notify(
    `Збережено файл з ${store.habits.length} звичками і ${store.completions.length} відмітками`,
  )
}

async function onFileChange(event) {
  const file = event.target.files[0]
  event.target.value = ''
  importError.value = ''
  if (!file) return

  try {
    if (file.size > 2 * 1024 * 1024) throw new Error('Файл завеликий (більше 2 МБ)')
    pendingImport.value = parseImport(await file.text())
    confirm.value = 'import'
  } catch (error) {
    importError.value = `Файл «${file.name}» не імпортовано: ${error.message}.`
    ui.notify('Невалідний файл імпорту', 'error')
  }
}

function applyConfirm() {
  const action = confirm.value
  confirm.value = ''

  if (action === 'import') {
    const data = pendingImport.value
    store.replaceData(data)
    pendingImport.value = null
    ui.notify(`Імпортовано ${data.habits.length} звичок і ${data.completions.length} відміток`)
  } else if (action === 'demo') {
    store.loadDemo()
    ui.notify('Завантажено демо-дані')
  } else if (action === 'reset') {
    store.resetAll()
    ui.notify('Усі дані видалено', 'info')
  }
}

const dialogs = {
  import: {
    title: 'Імпортувати дані?',
    message:
      'Поточні звички та відмітки буде замінено даними з файлу. Радимо спершу зробити експорт.',
    confirmText: 'Імпортувати',
  },
  demo: {
    title: 'Завантажити демо-дані?',
    message: 'Поточні звички та відмітки буде замінено демонстраційним набором.',
    confirmText: 'Завантажити',
  },
  reset: {
    title: 'Скинути всі дані?',
    message:
      'Усі звички, відмітки й досягнення буде видалено з цього браузера. Цю дію не можна скасувати.',
    confirmText: 'Скинути все',
    danger: true,
  },
}
</script>

<template>
  <div class="page">
    <header class="page-head">
      <div>
        <h1>Налаштування</h1>
        <p class="page-subtitle">Тема оформлення та резервні копії даних</p>
      </div>
    </header>

    <section class="card section" aria-labelledby="theme-title">
      <h2 id="theme-title" class="section-title">Тема</h2>
      <fieldset class="segmented">
        <legend class="sr-only">Тема оформлення</legend>
        <label v-for="theme in THEMES" :key="theme.value">
          <input
            type="radio"
            name="theme"
            :value="theme.value"
            :checked="ui.theme === theme.value"
            @change="ui.setTheme(theme.value)"
          />
          <span>
            <AppIcon :name="theme.icon" :size="16" />
            {{ theme.label }}
          </span>
        </label>
      </fieldset>
      <p class="hint muted">
        За замовчуванням тема береться з налаштувань системи. Вибір зберігається між сеансами.
      </p>
    </section>

    <section class="card section" aria-labelledby="data-title">
      <h2 id="data-title" class="section-title">Дані</h2>
      <p class="muted">
        Усе зберігається лише в цьому браузері (зараз {{ usedKb }} КБ). Щоб перенести дані на інший
        пристрій або мати резервну копію, зробіть експорт у JSON.
      </p>

      <div class="data-actions">
        <button class="btn" type="button" @click="exportData">
          <AppIcon name="download" :size="18" />
          Експорт JSON
        </button>
        <button class="btn btn-secondary" type="button" @click="fileInput.click()">
          <AppIcon name="upload" :size="18" />
          Імпорт JSON
        </button>
        <input
          ref="fileInput"
          class="sr-only"
          type="file"
          accept="application/json,.json"
          tabindex="-1"
          aria-hidden="true"
          @change="onFileChange"
        />
        <button class="btn btn-secondary" type="button" @click="confirm = 'demo'">
          <AppIcon name="sparkles" :size="18" />
          Демо-дані
        </button>
      </div>
      <p v-if="importError" class="import-error" role="alert">{{ importError }}</p>
    </section>

    <section class="card section danger-zone" aria-labelledby="reset-title">
      <h2 id="reset-title" class="section-title">Скидання</h2>
      <p class="muted">Видаляє всі звички, відмітки та досягнення. Тему не змінює.</p>
      <button class="btn btn-danger-outline" type="button" @click="confirm = 'reset'">
        <AppIcon name="trash" :size="18" />
        Скинути всі дані
      </button>
    </section>

    <p class="about muted">
      {{ APP_NAME }} · курсова робота з дисципліни «Веб-дизайн та веб-програмування»
    </p>

    <ConfirmDialog
      v-if="confirm"
      :open="Boolean(confirm)"
      :title="dialogs[confirm].title"
      :message="dialogs[confirm].message"
      :confirm-text="dialogs[confirm].confirmText"
      :danger="dialogs[confirm].danger"
      @confirm="applyConfirm"
      @cancel="confirm = ''"
    />
  </div>
</template>

<style scoped>
.hint {
  margin-top: 0.75rem;
  font-size: 0.9rem;
}

.data-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
}

.import-error {
  margin-top: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-sm);
  background: var(--danger-soft);
  color: var(--danger);
  font-weight: 600;
}

.danger-zone {
  display: grid;
  justify-items: start;
  gap: 0.75rem;
}

.danger-zone .section-title {
  margin-bottom: 0;
}

.about {
  text-align: center;
  font-size: 0.85rem;
}
</style>
