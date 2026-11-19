import { defineStore } from 'pinia'
import { THEME_KEY } from '@/lib/storage.js'

const THEMES = ['system', 'light', 'dark']
const darkQuery = window.matchMedia('(prefers-color-scheme: dark)')

function readTheme() {
  try {
    const value = localStorage.getItem(THEME_KEY)
    return THEMES.includes(value) ? value : 'system'
  } catch {
    return 'system'
  }
}

let nextToastId = 1

export const useUiStore = defineStore('ui', {
  state: () => ({
    theme: readTheme(),
    systemDark: darkQuery.matches,
    toasts: [],
    // Фільтри списку звичок зберігаються тут, щоб не скидатися після переходу на сторінку звички
    habitFilters: { query: '', category: 'all', status: 'active', sort: 'name' },
  }),

  getters: {
    resolvedTheme: (state) =>
      state.theme === 'system' ? (state.systemDark ? 'dark' : 'light') : state.theme,
  },

  actions: {
    initTheme() {
      darkQuery.addEventListener('change', (event) => {
        this.systemDark = event.matches
        this.applyTheme()
      })
      this.applyTheme()
    },

    setTheme(value) {
      if (!THEMES.includes(value)) return
      this.theme = value
      try {
        localStorage.setItem(THEME_KEY, value)
      } catch {
        this.notify('Тему змінено, але не збережено: сховище недоступне', 'error')
      }
      this.applyTheme()
    },

    applyTheme() {
      document.documentElement.dataset.theme = this.resolvedTheme
    },

    notify(message, type = 'success', { title = '', icon = '', timeout = 4000 } = {}) {
      const id = nextToastId++
      this.toasts.push({ id, message, type, title, icon })
      if (timeout) setTimeout(() => this.dismiss(id), timeout)
    },

    dismiss(id) {
      this.toasts = this.toasts.filter((toast) => toast.id !== id)
    },

    resetHabitFilters() {
      this.habitFilters = { query: '', category: 'all', status: 'active', sort: 'name' }
    },
  },
})
