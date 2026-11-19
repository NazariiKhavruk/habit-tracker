import { describe, expect, it } from 'vitest'
import {
  bestStreak,
  completionRate,
  currentStreak,
  isScheduled,
  newAchievements,
  totalCompletions,
} from '../streaks.js'

// 2026-11-20 — пʼятниця
const TODAY = '2026-11-20'

function habit(overrides = {}) {
  return {
    id: 'h1',
    createdAt: '2026-11-01',
    schedule: { type: 'daily' },
    achievements: [],
    ...overrides,
  }
}

const mwf = habit({ schedule: { type: 'days', days: [1, 3, 5] } })

describe('isScheduled', () => {
  it('щоденна звичка запланована будь-якого дня', () => {
    expect(isScheduled(habit(), '2026-11-22')).toBe(true)
  })

  it('звичка Пн/Ср/Пт не запланована у вівторок', () => {
    expect(isScheduled(mwf, '2026-11-17')).toBe(false)
    expect(isScheduled(mwf, '2026-11-18')).toBe(true)
  })
})

describe('currentStreak', () => {
  it('рахує дні поспіль до вчора, якщо сьогодні ще не відмічено', () => {
    const done = new Set(['2026-11-17', '2026-11-18', '2026-11-19'])
    expect(currentStreak(habit(), done, TODAY)).toBe(3)
  })

  it('додає сьогоднішній день, коли його відмічено', () => {
    const done = new Set(['2026-11-18', '2026-11-19', TODAY])
    expect(currentStreak(habit(), done, TODAY)).toBe(3)
  })

  it('перериває серію на пропущеному запланованому дні', () => {
    const done = new Set(['2026-11-16', '2026-11-17', '2026-11-19'])
    expect(currentStreak(habit(), done, TODAY)).toBe(1)
  })

  it('не враховує незаплановані дні', () => {
    const done = new Set(['2026-11-13', '2026-11-16', '2026-11-18', TODAY])
    expect(currentStreak(mwf, done, TODAY)).toBe(4)
  })

  it('пропуск у середу обриває серію Пн/Ср/Пт', () => {
    const done = new Set(['2026-11-16', TODAY])
    expect(currentStreak(mwf, done, TODAY)).toBe(1)
  })

  it('без відміток серія дорівнює нулю', () => {
    expect(currentStreak(habit(), new Set(), TODAY)).toBe(0)
  })
})

describe('bestStreak', () => {
  it('знаходить найдовшу серію в історії', () => {
    const done = new Set([
      '2026-11-02', '2026-11-03', '2026-11-04', '2026-11-05', '2026-11-06',
      '2026-11-10', '2026-11-11',
    ])
    expect(bestStreak(habit(), done, TODAY)).toBe(5)
  })

  it('враховує відмітки, зроблені раніше дати створення', () => {
    const done = new Set(['2026-10-30', '2026-10-31', '2026-11-01'])
    expect(bestStreak(habit(), done, TODAY)).toBe(3)
  })
})

describe('completionRate', () => {
  it('рахує відсоток лише з дня створення звички', () => {
    const fresh = habit({ createdAt: '2026-11-18' })
    const done = new Set(['2026-11-18', '2026-11-19'])
    expect(completionRate(fresh, done, TODAY, 7)).toEqual({ done: 2, scheduled: 3, percent: 67 })
  })

  it('повертає null, якщо запланованих днів немає', () => {
    const fresh = habit({ createdAt: '2026-11-21' })
    expect(completionRate(fresh, new Set(), TODAY, 7).percent).toBeNull()
  })
})

describe('totalCompletions', () => {
  it('не рахує дати з майбутнього', () => {
    expect(totalCompletions(new Set(['2026-11-19', TODAY, '2026-11-25']), TODAY)).toBe(2)
  })
})

describe('newAchievements', () => {
  it('видає досягнення за 3 і 7 днів із датою отримання', () => {
    const done = new Set([
      '2026-11-14', '2026-11-15', '2026-11-16', '2026-11-17', '2026-11-18', '2026-11-19', TODAY,
    ])
    expect(newAchievements(habit(), done, TODAY)).toEqual([
      { threshold: 3, unlockedAt: '2026-11-16' },
      { threshold: 7, unlockedAt: TODAY },
    ])
  })

  it('не повторює вже отримані досягнення', () => {
    const owned = habit({ achievements: [{ threshold: 3, unlockedAt: '2026-11-03' }] })
    const done = new Set(['2026-11-18', '2026-11-19', TODAY])
    expect(newAchievements(owned, done, TODAY)).toEqual([])
  })
})
