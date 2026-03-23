import { useState, useEffect, useCallback } from 'react'
import { HABITS } from '@/lib/content/habits'

interface HabitLog {
  id: string
  date: string
  habit_type: string
  streak_days: number
}

interface Props {
  childId: string
  token: string
}

export default function HabitsTracker({ childId, token }: Props) {
  const [logs, setLogs] = useState<HabitLog[]>([])
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState<string | null>(null)

  const today = new Date().toISOString().split('T')[0]
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }

  const fetchHabits = useCallback(async () => {
    try {
      const res = await fetch(`/api/habits?childId=${childId}&days=7`, { headers: { Authorization: `Bearer ${token}` } })
      if (res.ok) {
        const data = await res.json() as { habits?: HabitLog[] }
        setLogs(data.habits || [])
      }
    } catch {} finally {
      setLoading(false)
    }
  }, [childId, token])

  useEffect(() => { fetchHabits() }, [fetchHabits])

  function isCheckedToday(habitKey: string): boolean {
    return logs.some((l) => l.date === today && l.habit_type === habitKey)
  }

  function getStreak(habitKey: string): number {
    const log = logs.find((l) => l.habit_type === habitKey && l.date === today)
    return log?.streak_days || 0
  }

  async function toggleHabit(habitKey: string) {
    setToggling(habitKey)
    try {
      await fetch('/api/habits', {
        method: 'POST',
        headers,
        body: JSON.stringify({ childId, habitType: habitKey, date: today }),
      })
      await fetchHabits()
    } catch {} finally {
      setToggling(null)
    }
  }

  // Get last 7 days
  function getLast7Days(): string[] {
    const days: string[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      days.push(d.toISOString().split('T')[0])
    }
    return days
  }

  function getDayLabel(dateStr: string): string {
    const d = new Date(dateStr + 'T12:00:00')
    return d.toLocaleDateString('en', { weekday: 'short' }).charAt(0)
  }

  function isLoggedOn(habitKey: string, date: string): boolean {
    return logs.some((l) => l.habit_type === habitKey && l.date === date)
  }

  const todayCount = HABITS.filter((h) => isCheckedToday(h.key)).length
  const last7 = getLast7Days()

  if (loading) {
    return (
      <div className="space-y-3">
        {[1,2,3].map((i) => (
          <div key={i} className="bg-white rounded-xl p-4 animate-pulse h-16" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Today's Progress */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-700">Today</span>
          <span className="text-sm text-green-600 font-bold">{todayCount}/6</span>
        </div>
        <div className="flex gap-1">
          {HABITS.map((h) => (
            <div
              key={h.key}
              className={`flex-1 h-2 rounded-full transition-colors ${
                isCheckedToday(h.key) ? 'bg-green-400' : 'bg-gray-100'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Habit Cards */}
      <div className="space-y-2">
        {HABITS.map((habit) => {
          const checked = isCheckedToday(habit.key)
          const streak = getStreak(habit.key)
          const isToggling = toggling === habit.key

          return (
            <button
              key={habit.key}
              onClick={() => toggleHabit(habit.key)}
              disabled={isToggling}
              className={`w-full text-left rounded-xl p-4 border transition-all shadow-sm ${
                checked
                  ? 'bg-green-50 border-green-200'
                  : 'bg-white border-gray-100 hover:border-gray-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${habit.bgColor} flex items-center justify-center text-white text-lg shadow-sm ${
                  isToggling ? 'animate-pulse' : ''
                }`}>
                  {habit.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900">{habit.name}</span>
                    <span className={`text-xs font-bold ${habit.color}`}>{habit.letter}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">{habit.tip}</p>
                </div>
                <div className="flex items-center gap-2">
                  {streak > 1 && (
                    <span className="text-xs text-amber-600 font-semibold">
                      🔥 {streak}
                    </span>
                  )}
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                    checked
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'border-gray-300'
                  }`}>
                    {checked && (
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* 7-Day Grid */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Last 7 Days</h3>
        <div className="space-y-2">
          {/* Day headers */}
          <div className="grid grid-cols-[80px_repeat(7,1fr)] gap-1">
            <div />
            {last7.map((d) => (
              <div key={d} className={`text-center text-[10px] font-medium ${d === today ? 'text-green-600' : 'text-gray-400'}`}>
                {getDayLabel(d)}
              </div>
            ))}
          </div>
          {/* Habit rows */}
          {HABITS.map((habit) => (
            <div key={habit.key} className="grid grid-cols-[80px_repeat(7,1fr)] gap-1 items-center">
              <span className="text-[10px] font-medium text-gray-500 truncate">{habit.letter}. {habit.name.split(' ')[0]}</span>
              {last7.map((d) => (
                <div key={d} className="flex justify-center">
                  <div className={`w-5 h-5 rounded-md ${
                    isLoggedOn(habit.key, d)
                      ? 'bg-green-400'
                      : 'bg-gray-100'
                  }`} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
