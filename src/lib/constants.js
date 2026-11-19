export const APP_NAME = 'HabitFlow'

export const CATEGORIES = {
  health: 'Здоров’я',
  sport: 'Спорт',
  study: 'Навчання',
  mind: 'Розум і настрій',
  routine: 'Режим дня',
  other: 'Інше',
}

export const ICONS = [
  '💧',
  '🏃',
  '📚',
  '🧘',
  '🍎',
  '😴',
  '💪',
  '🚶',
  '✍️',
  '🎯',
  '🌱',
  '🦷',
  '🧠',
  '🎸',
  '💊',
  '🚭',
]

// Кольори підібрано так, щоб білий текст і значок на них були контрастними
export const COLORS = [
  { value: '#2563eb', name: 'Синій' },
  { value: '#15803d', name: 'Зелений' },
  { value: '#b91c1c', name: 'Червоний' },
  { value: '#c2410c', name: 'Помаранчевий' },
  { value: '#7c3aed', name: 'Фіолетовий' },
  { value: '#be185d', name: 'Рожевий' },
  { value: '#0e7490', name: 'Бірюзовий' },
  { value: '#4b5563', name: 'Сірий' },
]

// Дні тижня у форматі ISO: 1 = понеділок, 7 = неділя
export const WEEKDAYS = [
  { value: 1, short: 'Пн', long: 'понеділок' },
  { value: 2, short: 'Вт', long: 'вівторок' },
  { value: 3, short: 'Ср', long: 'середа' },
  { value: 4, short: 'Чт', long: 'четвер' },
  { value: 5, short: 'Пт', long: 'пʼятниця' },
  { value: 6, short: 'Сб', long: 'субота' },
  { value: 7, short: 'Нд', long: 'неділя' },
]

export const ACHIEVEMENTS = [
  { threshold: 3, title: 'Перший крок', icon: '🌱' },
  { threshold: 7, title: 'Тиждень', icon: '🔥' },
  { threshold: 30, title: 'Місяць', icon: '🏅' },
  { threshold: 100, title: 'Сотня', icon: '🏆' },
]

export const STATS_PERIODS = [7, 30, 90]

export const NAME_MIN = 2
export const NAME_MAX = 50
