import { ACHIEVEMENTS } from './constants.js'
import { addDaysKey, lastDays, rangeKeys, weekdayOf } from './dates.js'

export function isScheduled(habit, key) {
  return habit.schedule.type === 'daily' || habit.schedule.days.includes(weekdayOf(key))
}

// Початок історії звички: дата створення або найраніша відмітка,
// якщо користувач відмітив минулі дні
export function startKey(habit, doneSet) {
  let start = habit.createdAt
  for (const key of doneSet) {
    if (key < start) start = key
  }
  return start
}

// Поточна серія: скільки запланованих днів поспіль виконано до сьогодні.
// Незапланований день серію не перериває. Сьогоднішній день, який ще
// не відмічено, теж не перериває серію: день ще не закінчився.
export function currentStreak(habit, doneSet, today) {
  const start = startKey(habit, doneSet)
  let streak = 0

  for (let key = today; key >= start; key = addDaysKey(key, -1)) {
    if (!isScheduled(habit, key)) continue
    if (doneSet.has(key)) {
      streak += 1
    } else if (key !== today) {
      break
    }
  }

  return streak
}

// Проходить історію від початку до сьогодні і повертає найкращу серію
// та дати, коли вперше було досягнуто кожного порогу досягнень.
export function scanHistory(habit, doneSet, today) {
  const start = startKey(habit, doneSet)
  const reached = {}
  let run = 0
  let best = 0

  for (const key of rangeKeys(start, today)) {
    if (!isScheduled(habit, key)) continue

    if (doneSet.has(key)) {
      run += 1
      best = Math.max(best, run)
      for (const { threshold } of ACHIEVEMENTS) {
        if (run === threshold && !reached[threshold]) reached[threshold] = key
      }
    } else if (key !== today) {
      run = 0
    }
  }

  return { best, reached }
}

export function bestStreak(habit, doneSet, today) {
  return scanHistory(habit, doneSet, today).best
}

// Відсоток виконання за останні days днів (сьогодні рахується як звичайний день).
// Дні до початку історії звички не враховуються.
export function completionRate(habit, doneSet, today, days) {
  const start = startKey(habit, doneSet)
  let scheduled = 0
  let done = 0

  for (const key of lastDays(today, days)) {
    if (key < start || !isScheduled(habit, key)) continue
    scheduled += 1
    if (doneSet.has(key)) done += 1
  }

  return {
    done,
    scheduled,
    percent: scheduled === 0 ? null : Math.round((done / scheduled) * 100),
  }
}

export function totalCompletions(doneSet, today) {
  let total = 0
  for (const key of doneSet) {
    if (key <= today) total += 1
  }
  return total
}

// Нові досягнення, яких ще немає у звички
export function newAchievements(habit, doneSet, today) {
  const { reached } = scanHistory(habit, doneSet, today)
  const owned = new Set(habit.achievements.map((item) => item.threshold))

  return ACHIEVEMENTS.filter(({ threshold }) => reached[threshold] && !owned.has(threshold)).map(
    ({ threshold }) => ({ threshold, unlockedAt: reached[threshold] }),
  )
}
