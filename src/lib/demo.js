import { addDaysKey, rangeKeys } from './dates.js'
import { isScheduled, scanHistory } from './streaks.js'

// Простий генератор псевдовипадкових чисел: однакове зерно дає однакові демо-дані
function random(seed) {
  let value = seed
  return () => {
    value = (value * 1664525 + 1013904223) % 4294967296
    return value / 4294967296
  }
}

const DEMO = [
  {
    id: 'demo-water',
    name: 'Випити 2 л води',
    icon: '💧',
    color: '#2563eb',
    category: 'health',
    schedule: { type: 'daily' },
    age: 70,
    chance: 0.85,
    perfectDays: 34,
    doneToday: true,
  },
  {
    id: 'demo-run',
    name: 'Ранкова пробіжка',
    icon: '🏃',
    color: '#15803d',
    category: 'sport',
    schedule: { type: 'days', days: [1, 3, 5] },
    age: 60,
    chance: 0.8,
    perfectDays: 14,
    doneToday: false,
  },
  {
    id: 'demo-read',
    name: 'Прочитати 20 сторінок',
    icon: '📚',
    color: '#7c3aed',
    category: 'study',
    schedule: { type: 'daily' },
    age: 45,
    chance: 0.7,
    perfectDays: 8,
    doneToday: false,
  },
  {
    id: 'demo-gym',
    name: 'Тренування в залі',
    icon: '💪',
    color: '#0e7490',
    category: 'sport',
    schedule: { type: 'days', days: [2, 4, 6] },
    age: 40,
    chance: 0.7,
    perfectDays: 8,
    doneToday: true,
  },
  {
    id: 'demo-sleep',
    name: 'Лягти спати до 23:30',
    icon: '😴',
    color: '#c2410c',
    category: 'routine',
    schedule: { type: 'days', days: [1, 2, 3, 4, 5] },
    age: 50,
    chance: 0.6,
    perfectDays: 0,
    doneToday: false,
  },
  {
    id: 'demo-guitar',
    name: 'Грати на гітарі',
    icon: '🎸',
    color: '#be185d',
    category: 'other',
    schedule: { type: 'days', days: [2, 4, 6] },
    age: 80,
    chance: 0.5,
    perfectDays: 0,
    doneToday: false,
    archived: true,
    stoppedDaysAgo: 40,
  },
]

export function buildDemoData(today) {
  const next = random(20261119)
  const habits = []
  const completions = []

  for (const demo of DEMO) {
    const habit = {
      id: demo.id,
      name: demo.name,
      icon: demo.icon,
      color: demo.color,
      category: demo.category,
      schedule: demo.schedule,
      createdAt: addDaysKey(today, -demo.age),
      archived: Boolean(demo.archived),
      achievements: [],
    }

    const last = addDaysKey(today, -(demo.stoppedDaysAgo ?? 1))
    const perfectFrom = addDaysKey(today, -demo.perfectDays)
    const done = new Set()

    for (const key of rangeKeys(habit.createdAt, last)) {
      if (!isScheduled(habit, key)) continue
      if (key >= perfectFrom || next() < demo.chance) done.add(key)
    }
    // День перед «ідеальним» відрізком пропущено, щоб серія мала зрозумілий початок
    done.delete(addDaysKey(perfectFrom, -1))
    if (demo.doneToday && isScheduled(habit, today)) done.add(today)

    const { reached } = scanHistory(habit, done, today)
    habit.achievements = Object.entries(reached).map(([threshold, unlockedAt]) => ({
      threshold: Number(threshold),
      unlockedAt,
    }))

    habits.push(habit)
    for (const date of [...done].sort()) completions.push({ habitId: habit.id, date })
  }

  return { habits, completions }
}
