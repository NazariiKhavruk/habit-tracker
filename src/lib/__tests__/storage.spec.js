import { describe, expect, it } from 'vitest'
import { isDateKey } from '../dates.js'
import { buildDemoData } from '../demo.js'
import {
  CORRUPTED_KEY,
  DATA_KEY,
  DataError,
  StorageFullError,
  buildExport,
  loadData,
  parseImport,
  saveData,
  validateData,
} from '../storage.js'

function memoryStorage(initial = {}) {
  const items = { ...initial }
  return {
    items,
    getItem: (key) => (key in items ? items[key] : null),
    setItem: (key, value) => {
      items[key] = String(value)
    },
  }
}

const demo = buildDemoData('2026-11-20')

describe('isDateKey', () => {
  it('приймає лише справжні дати у форматі YYYY-MM-DD', () => {
    expect(isDateKey('2026-11-20')).toBe(true)
    expect(isDateKey('2026-02-30')).toBe(false)
    expect(isDateKey('20.11.2026')).toBe(false)
  })
})

describe('validateData', () => {
  it('приймає демо-дані', () => {
    expect(() => validateData({ version: 1, ...demo })).not.toThrow()
  })

  it('відхиляє закоротку назву', () => {
    const habits = [{ ...demo.habits[0], name: 'a' }]
    expect(() => validateData({ version: 1, habits, completions: [] })).toThrow(DataError)
  })

  it('відхиляє відмітку для неіснуючої звички', () => {
    const completions = [{ habitId: 'nope', date: '2026-11-20' }]
    expect(() => validateData({ version: 1, habits: demo.habits, completions })).toThrow(
      /Відмітка №1/,
    )
  })

  it('відхиляє іншу версію даних', () => {
    expect(() => validateData({ version: 2, habits: [], completions: [] })).toThrow(DataError)
  })

  it('прибирає дублікати відміток', () => {
    const completions = [
      { habitId: 'demo-water', date: '2026-11-20' },
      { habitId: 'demo-water', date: '2026-11-20' },
    ]
    expect(validateData({ version: 1, habits: demo.habits, completions }).completions).toHaveLength(
      1,
    )
  })
})

describe('експорт та імпорт', () => {
  it('файл експорту імпортується назад без втрат', () => {
    const text = JSON.stringify(buildExport(demo))
    expect(parseImport(text)).toEqual(demo)
  })

  it('відхиляє файл, що не є JSON', () => {
    expect(() => parseImport('{ not json')).toThrow('Файл не є коректним JSON')
  })
})

describe('localStorage', () => {
  it('порожнє сховище дає статус empty', () => {
    expect(loadData(memoryStorage()).status).toBe('empty')
  })

  it('пошкоджений запис зберігається в резервну копію', () => {
    const storage = memoryStorage({ [DATA_KEY]: '{broken' })
    expect(loadData(storage).status).toBe('corrupted')
    expect(storage.items[CORRUPTED_KEY]).toBe('{broken')
  })

  it('збережені дані читаються назад', () => {
    const storage = memoryStorage()
    saveData(demo, storage)
    expect(loadData(storage)).toEqual({ status: 'ok', data: demo })
  })

  it('переповнення сховища дає StorageFullError', () => {
    const storage = {
      setItem() {
        const error = new Error('full')
        error.name = 'QuotaExceededError'
        throw error
      },
    }
    expect(() => saveData(demo, storage)).toThrow(StorageFullError)
  })
})
