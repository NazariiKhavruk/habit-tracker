import { describe, expect, it } from 'vitest'
import { buildStats } from '../stats.js'

const TODAY = '2026-11-20' // пʼятниця

const water = {
  id: 'water',
  createdAt: '2026-11-01',
  schedule: { type: 'daily' },
  achievements: [],
}
const run = {
  id: 'run',
  createdAt: '2026-11-01',
  schedule: { type: 'days', days: [1, 3, 5] },
  achievements: [],
}

// Тиждень 14–20 листопада: вода виконана 5 днів з 7, пробіжка 3 з 3
const doneSets = new Map([
  ['water', new Set(['2026-11-14', '2026-11-15', '2026-11-16', '2026-11-18', '2026-11-20'])],
  ['run', new Set(['2026-11-16', '2026-11-18', '2026-11-20'])],
])

describe('buildStats', () => {
  const stats = buildStats([water, run], doneSets, TODAY, 7)

  it('будує 7 днів для графіка', () => {
    expect(stats.daily).toHaveLength(7)
    expect(stats.daily.at(-1)).toEqual({ key: TODAY, scheduled: 2, done: 2, percent: 100 })
    expect(stats.daily.find((d) => d.key === '2026-11-17')).toMatchObject({ scheduled: 1, done: 0 })
  })

  it('рахує загальний відсоток', () => {
    expect(stats.total).toEqual({ scheduled: 10, done: 8, percent: 80 })
  })

  it('розподіляє виконання по днях тижня', () => {
    const monday = stats.weekdays.find((d) => d.value === 1)
    const tuesday = stats.weekdays.find((d) => d.value === 2)
    expect(monday.percent).toBe(100)
    expect(tuesday.percent).toBe(0)
  })

  it('визначає найстабільнішу звичку', () => {
    expect(stats.mostStable.habit.id).toBe('run')
    expect(stats.mostStable.percent).toBe(100)
  })

  it('без звичок повертає порожній стан', () => {
    const empty = buildStats([], new Map(), TODAY, 30)
    expect(empty.hasData).toBe(false)
    expect(empty.mostStable).toBeNull()
    expect(empty.total.percent).toBeNull()
  })

  it('перераховує дані для іншого періоду', () => {
    expect(buildStats([water, run], doneSets, TODAY, 30).daily).toHaveLength(30)
  })
})
