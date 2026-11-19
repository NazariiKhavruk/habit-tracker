import { ACHIEVEMENTS, APP_NAME, CATEGORIES, NAME_MAX, NAME_MIN } from './constants.js'
import { isDateKey } from './dates.js'

export const DATA_KEY = 'habitflow:data:v1'
export const CORRUPTED_KEY = 'habitflow:data:corrupted-backup'
export const THEME_KEY = 'habitflow:theme'
export const DATA_VERSION = 1

export class DataError extends Error {}
export class StorageFullError extends Error {}

const COLOR_RE = /^#[0-9a-f]{6}$/i
const THRESHOLDS = ACHIEVEMENTS.map((item) => item.threshold)

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function validateSchedule(schedule, where) {
  if (!isPlainObject(schedule)) throw new DataError(`${where}: немає розкладу`)
  if (schedule.type === 'daily') return { type: 'daily' }

  const days = schedule.days
  if (
    schedule.type !== 'days' ||
    !Array.isArray(days) ||
    days.length === 0 ||
    !days.every((day) => Number.isInteger(day) && day >= 1 && day <= 7) ||
    new Set(days).size !== days.length
  ) {
    throw new DataError(`${where}: некоректний розклад`)
  }
  return { type: 'days', days: [...days].sort((a, b) => a - b) }
}

function validateHabit(raw, index) {
  const where = `Звичка №${index + 1}`
  if (!isPlainObject(raw)) throw new DataError(`${where}: запис не є об’єктом`)

  const { id, name, icon, color, category, createdAt, archived } = raw
  if (typeof id !== 'string' || id.length === 0 || id.length > 64) {
    throw new DataError(`${where}: некоректний id`)
  }
  if (typeof name !== 'string' || name.trim().length < NAME_MIN || name.trim().length > NAME_MAX) {
    throw new DataError(`${where}: назва має містити від ${NAME_MIN} до ${NAME_MAX} символів`)
  }
  if (typeof icon !== 'string' || icon.length === 0 || icon.length > 8) {
    throw new DataError(`${where}: некоректна іконка`)
  }
  if (typeof color !== 'string' || !COLOR_RE.test(color)) {
    throw new DataError(`${where}: некоректний колір`)
  }
  if (!Object.hasOwn(CATEGORIES, category)) {
    throw new DataError(`${where}: невідома категорія`)
  }
  if (!isDateKey(createdAt)) throw new DataError(`${where}: некоректна дата створення`)
  if (typeof archived !== 'boolean') throw new DataError(`${where}: поле archived має бути true або false`)

  const achievements = raw.achievements ?? []
  if (
    !Array.isArray(achievements) ||
    !achievements.every(
      (item) => isPlainObject(item) && THRESHOLDS.includes(item.threshold) && isDateKey(item.unlockedAt),
    )
  ) {
    throw new DataError(`${where}: некоректні досягнення`)
  }

  return {
    id,
    name: name.trim(),
    icon,
    color: color.toLowerCase(),
    category,
    schedule: validateSchedule(raw.schedule, where),
    createdAt,
    archived,
    achievements: achievements.map(({ threshold, unlockedAt }) => ({ threshold, unlockedAt })),
  }
}

// Перевіряє дані за схемою і повертає очищену копію. Використовується
// і під час читання з localStorage, і під час імпорту файлу.
export function validateData(value) {
  if (!isPlainObject(value)) throw new DataError('Дані мають бути JSON-об’єктом')
  if (value.version !== DATA_VERSION) throw new DataError('Непідтримувана версія даних')
  if (!Array.isArray(value.habits)) throw new DataError('Немає списку звичок')
  if (!Array.isArray(value.completions)) throw new DataError('Немає списку відміток')

  const habits = value.habits.map(validateHabit)
  const ids = new Set(habits.map((habit) => habit.id))
  if (ids.size !== habits.length) throw new DataError('У файлі є звички з однаковим id')

  const seen = new Set()
  const completions = []
  value.completions.forEach((raw, index) => {
    if (!isPlainObject(raw) || !ids.has(raw.habitId) || !isDateKey(raw.date)) {
      throw new DataError(`Відмітка №${index + 1}: некоректна звичка або дата`)
    }
    const key = `${raw.habitId}|${raw.date}`
    if (!seen.has(key)) {
      seen.add(key)
      completions.push({ habitId: raw.habitId, date: raw.date })
    }
  })

  return { habits, completions }
}

// Повертає { status: 'empty' | 'ok' | 'corrupted', data?, error? }
export function loadData(storage = localStorage) {
  const raw = storage.getItem(DATA_KEY)
  if (raw === null) return { status: 'empty' }

  try {
    return { status: 'ok', data: validateData(JSON.parse(raw)) }
  } catch (error) {
    // Пошкоджений запис не губимо: зберігаємо копію під окремим ключем
    try {
      storage.setItem(CORRUPTED_KEY, raw)
    } catch {
      // місця немає навіть для копії, нічого не робимо
    }
    return { status: 'corrupted', error }
  }
}

export function saveData(data, storage = localStorage) {
  const payload = { version: DATA_VERSION, habits: data.habits, completions: data.completions }
  try {
    storage.setItem(DATA_KEY, JSON.stringify(payload))
  } catch (error) {
    if (error?.name === 'QuotaExceededError' || error?.code === 22) {
      throw new StorageFullError('Сховище браузера переповнене')
    }
    throw error
  }
}

export function buildExport(data, now = new Date()) {
  return {
    app: APP_NAME,
    version: DATA_VERSION,
    exportedAt: now.toISOString(),
    habits: data.habits,
    completions: data.completions,
  }
}

export function parseImport(text) {
  let value
  try {
    value = JSON.parse(text)
  } catch {
    throw new DataError('Файл не є коректним JSON')
  }
  return validateData(value)
}
