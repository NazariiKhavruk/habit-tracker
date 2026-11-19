import { WEEKDAYS } from './constants.js'

export function scheduleLabel(schedule) {
  if (schedule.type === 'daily') return 'Щодня'
  const days = schedule.days.join(',')
  if (days === '1,2,3,4,5') return 'Будні'
  if (days === '6,7') return 'Вихідні'
  return schedule.days.map((day) => WEEKDAYS[day - 1].short).join(', ')
}

// 1 день, 2 дні, 5 днів
export function pluralDays(count) {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod10 === 1 && mod100 !== 11) return `${count} день`
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${count} дні`
  return `${count} днів`
}

export function percentLabel(value) {
  return value === null ? '—' : `${value}%`
}
