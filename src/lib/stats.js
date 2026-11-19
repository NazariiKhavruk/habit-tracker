import { WEEKDAYS } from './constants.js'
import { lastDays, weekdayOf } from './dates.js'
import { completionRate, currentStreak, isScheduled, startKey } from './streaks.js'

function percent(done, scheduled) {
  return scheduled === 0 ? null : Math.round((done / scheduled) * 100)
}

// habits — активні звички, doneSets — Map<habitId, Set<дата>>
export function buildStats(habits, doneSets, today, period) {
  const days = lastDays(today, period)
  const starts = new Map(habits.map((habit) => [habit.id, startKey(habit, doneSets.get(habit.id))]))

  const daily = days.map((key) => {
    let scheduled = 0
    let done = 0
    for (const habit of habits) {
      if (key < starts.get(habit.id) || !isScheduled(habit, key)) continue
      scheduled += 1
      if (doneSets.get(habit.id).has(key)) done += 1
    }
    return { key, scheduled, done, percent: percent(done, scheduled) }
  })

  const weekdays = WEEKDAYS.map((day) => {
    const items = daily.filter((item) => weekdayOf(item.key) === day.value)
    const scheduled = items.reduce((sum, item) => sum + item.scheduled, 0)
    const done = items.reduce((sum, item) => sum + item.done, 0)
    return { ...day, scheduled, done, percent: percent(done, scheduled) }
  })

  const scheduled = daily.reduce((sum, item) => sum + item.scheduled, 0)
  const done = daily.reduce((sum, item) => sum + item.done, 0)

  const perHabit = habits
    .map((habit) => {
      const doneSet = doneSets.get(habit.id)
      return {
        habit,
        ...completionRate(habit, doneSet, today, period),
        streak: currentStreak(habit, doneSet, today),
      }
    })
    .sort((a, b) => (b.percent ?? -1) - (a.percent ?? -1) || b.done - a.done)

  // Найстабільніша звичка: найвищий відсоток, далі більше виконань, далі довша серія
  const candidates = perHabit.filter((item) => item.scheduled > 0)
  const mostStable =
    candidates.length === 0
      ? null
      : candidates.reduce((best, item) =>
          item.percent > best.percent ||
          (item.percent === best.percent && item.done > best.done) ||
          (item.percent === best.percent && item.done === best.done && item.streak > best.streak)
            ? item
            : best,
        )

  return {
    period,
    daily,
    weekdays,
    perHabit,
    mostStable,
    total: { scheduled, done, percent: percent(done, scheduled) },
    hasData: scheduled > 0,
  }
}
