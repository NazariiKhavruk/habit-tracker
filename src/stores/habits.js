import { defineStore } from 'pinia'
import { ACHIEVEMENTS } from '@/lib/constants.js'
import { todayKey } from '@/lib/dates.js'
import { buildDemoData } from '@/lib/demo.js'
import { StorageFullError, loadData, saveData } from '@/lib/storage.js'
import { bestStreak, currentStreak, isScheduled, newAchievements, startKey } from '@/lib/streaks.js'
import { pluralDays } from '@/lib/labels.js'
import { useUiStore } from './ui.js'

// Чи була вже показана помилка збереження (щоб не показувати її після кожної зміни)
let saveFailed = false

function cleanForm(form) {
  return {
    name: form.name.trim(),
    icon: form.icon,
    color: form.color,
    category: form.category,
    schedule:
      form.schedule.type === 'daily'
        ? { type: 'daily' }
        : { type: 'days', days: [...form.schedule.days].sort((a, b) => a - b) },
  }
}

export const useHabitsStore = defineStore('habits', {
  state: () => ({
    habits: [],
    completions: [],
    status: 'loading', // loading | ready
    loadError: '',
    today: todayKey(),
  }),

  getters: {
    activeHabits: (state) => state.habits.filter((habit) => !habit.archived),

    // Map<habitId, Set<дата>> — швидка перевірка «чи виконано в цей день»
    doneSets: (state) => {
      const map = new Map(state.habits.map((habit) => [habit.id, new Set()]))
      for (const { habitId, date } of state.completions) map.get(habitId)?.add(date)
      return map
    },

    getHabit: (state) => (id) => state.habits.find((habit) => habit.id === id),

    doneSetOf() {
      return (id) => this.doneSets.get(id) ?? new Set()
    },

    isDone() {
      return (id, key) => this.doneSetOf(id).has(key)
    },

    streakOf() {
      return (habit) => currentStreak(habit, this.doneSetOf(habit.id), this.today)
    },

    bestStreakOf() {
      return (habit) => bestStreak(habit, this.doneSetOf(habit.id), this.today)
    },

    // Активні звички, заплановані на дату (і вже створені на той момент)
    habitsForDay() {
      return (key) =>
        this.activeHabits.filter(
          (habit) => isScheduled(habit, key) && key >= startKey(habit, this.doneSetOf(habit.id)),
        )
    },
  },

  actions: {
    async init() {
      this.status = 'loading'
      // Даємо браузеру спершу намалювати скелетон
      await new Promise((resolve) => setTimeout(resolve, 0))

      // Перший запуск (status 'empty') починається з порожнього списку.
      // Демо-дані користувач може завантажити сам кнопкою «Демо-дані».
      const result = loadData()

      if (result.status === 'ok') {
        this.habits = result.data.habits
        this.completions = result.data.completions
      } else if (result.status === 'corrupted') {
        this.loadError =
          'Збережені дані пошкоджено, тому застосунок почав роботу з порожнім списком. ' +
          'Копію пошкодженого запису збережено окремо. Ви можете імпортувати резервну копію в налаштуваннях.'
        console.error(result.error)
      }

      this.persist()
      this.$subscribe(() => this.persist())
      this.status = 'ready'
    },

    persist() {
      try {
        saveData({ habits: this.habits, completions: this.completions })
        saveFailed = false
      } catch (error) {
        console.error(error)
        if (saveFailed) return
        saveFailed = true
        const message =
          error instanceof StorageFullError
            ? 'Сховище переповнене. Зробіть експорт і видаліть зайві звички.'
            : 'Не вдалося зберегти дані в браузері.'
        useUiStore().notify(message, 'error', { title: 'Зміни не збережено', timeout: 8000 })
      }
    },

    refreshToday() {
      const key = todayKey()
      if (key !== this.today) this.today = key
    },

    addHabit(form) {
      const habit = {
        id: `h-${crypto.randomUUID()}`,
        ...cleanForm(form),
        createdAt: this.today,
        archived: false,
        achievements: [],
      }
      this.habits.push(habit)
      return habit
    },

    updateHabit(id, form) {
      const habit = this.getHabit(id)
      if (habit) Object.assign(habit, cleanForm(form))
      return habit
    },

    setArchived(id, archived) {
      const habit = this.getHabit(id)
      if (habit) habit.archived = archived
    },

    removeHabit(id) {
      this.habits = this.habits.filter((habit) => habit.id !== id)
      this.completions = this.completions.filter((item) => item.habitId !== id)
    },

    // Повертає true, якщо після дії день відмічено
    toggleCompletion(id, key) {
      const habit = this.getHabit(id)
      if (!habit || key > this.today || !isScheduled(habit, key)) return false

      if (this.isDone(id, key)) {
        this.completions = this.completions.filter(
          (item) => !(item.habitId === id && item.date === key),
        )
        return false
      }

      this.completions.push({ habitId: id, date: key })
      this.checkAchievements(habit)
      return true
    },

    checkAchievements(habit) {
      const earned = newAchievements(habit, this.doneSetOf(habit.id), this.today)
      if (earned.length === 0) return

      habit.achievements.push(...earned)
      const ui = useUiStore()
      for (const { threshold } of earned) {
        const info = ACHIEVEMENTS.find((item) => item.threshold === threshold)
        ui.notify(`«${habit.name}»: ${pluralDays(threshold)} поспіль`, 'achievement', {
          title: `Досягнення «${info.title}»`,
          icon: info.icon,
          timeout: 6000,
        })
      }
    },

    replaceData(data) {
      this.habits = data.habits
      this.completions = data.completions
      this.loadError = ''
    },

    loadDemo() {
      this.replaceData(buildDemoData(this.today))
    },

    resetAll() {
      this.replaceData({ habits: [], completions: [] })
    },
  },
})
