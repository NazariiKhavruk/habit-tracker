import { addDays, format, getISODay, isValid, parse } from 'date-fns'
import { uk } from 'date-fns/locale'

// Усі дати в застосунку зберігаються як рядки YYYY-MM-DD у локальному часі.
// Такі рядки можна порівнювати звичайними < і >.
export const DATE_FORMAT = 'yyyy-MM-dd'

export function toKey(date) {
  return format(date, DATE_FORMAT)
}

export function fromKey(key) {
  return parse(key, DATE_FORMAT, new Date())
}

export function isDateKey(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = fromKey(value)
  return isValid(date) && toKey(date) === value
}

export function todayKey(now = new Date()) {
  return toKey(now)
}

export function addDaysKey(key, amount) {
  return toKey(addDays(fromKey(key), amount))
}

// 1 = понеділок ... 7 = неділя
export function weekdayOf(key) {
  return getISODay(fromKey(key))
}

// Масив дат від start до end включно
export function rangeKeys(start, end) {
  const keys = []
  for (let key = start; key <= end; key = addDaysKey(key, 1)) {
    keys.push(key)
  }
  return keys
}

// Останні count днів, що закінчуються датою end
export function lastDays(end, count) {
  return rangeKeys(addDaysKey(end, -(count - 1)), end)
}

export function formatKey(key, pattern) {
  return format(fromKey(key), pattern, { locale: uk })
}

export function formatLong(key) {
  return formatKey(key, 'd MMMM yyyy')
}
