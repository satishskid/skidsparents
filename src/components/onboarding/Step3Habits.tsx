import { useState, useEffect } from 'react'
import { analytics } from '@/lib/analytics/manager'
import { HABITS, type Habit } from '@/lib/content/habits'

interface Step3Props {
  token: string
  childId: string
  childName: string
  onComplete: (habitKey: string | null, logged: boolean) => void
  onSkip: () => void
}

export default function Step3Habits({
  token,
  childId,
  childName,
  onComplete,
  onSkip,
}: Step3Props) {
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  // Auto-dismiss toast after 3s
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 3000)
    return () => clearTimeout(t)
  }, [toast])

  const selectedHabit: Habit | null = HABITS.find((h) => h.key === selectedKey) ?? null

  const handleLog = async () => {
    if (!selectedKey || saving) return
    setSaving(true)

    const date = new Date().toISOString().split('T')[0]
    try {
      const res = await fetch('/api/habits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ childId, habitType: selectedKey, date, valueJson: {} }),
      })

      if (res.ok) {
        // { removed: true } means already logged today — treat as success
        onComplete(selectedKey, true)
      } else {
        setToast("Couldn't log habit — try again from the dashboard")
        onComplete(selectedKey, false)
      }
    } catch {
      setToast("Couldn't log habit — try again from the dashboard")
      onComplete(selectedKey, false)
    } finally {
      setSaving(false)
    }
  }

  const handleSkip = () => {
    analytics.trackEvent('onboarding_step_skipped', { step: 3 })
    onSkip()
  }

  return (
    <div className="flex flex-col h-full px-5 pt-4 pb-6 overflow-y-auto">
      {/* Heading */}
      <h2 className="text-xl font-semibold text-gray-900 mb-1">Habits</h2>
      <p className="text-sm text-gray-500 mb-4">
        Pick one healthy habit to log for {childName} today.
      </p>

      {/* Habit grid */}
      <div className="grid grid-cols-1 min-[400px]:grid-cols-2 gap-3 mb-4">
        {HABITS.map((habit) => {
          const isSelected = selectedKey === habit.key
          return (
            <button
              key={habit.key}
              type="button"
              onClick={() => setSelectedKey(habit.key)}
              className={`text-left rounded-2xl shadow-sm border p-4 cursor-pointer transition-shadow min-h-[44px] ${
                isSelected
                  ? 'bg-green-50 border-green-500 shadow-sm'
                  : 'bg-white border-gray-100 hover:shadow-md'
              }`}
            >
              <div className="text-2xl mb-1">{habit.emoji}</div>
              <p className="text-sm font-semibold text-gray-800 leading-snug">{habit.name}</p>
              <p className="text-xs text-gray-500 mt-0.5 leading-snug">{habit.tagline}</p>
            </button>
          )
        })}
      </div>

      {/* Tip + CTA — shown when a habit is selected */}
      {selectedHabit && (
        <div className="mb-4">
          <p className="text-sm text-gray-600 italic mb-3">💡 {selectedHabit.tip}</p>
          <button
            type="button"
            disabled={saving}
            onClick={handleLog}
            className="bg-green-500 text-white rounded-xl py-3 px-6 font-semibold text-base w-full hover:bg-green-600 active:bg-green-700 transition-colors disabled:opacity-40 min-h-[44px]"
          >
            {saving ? 'Logging…' : 'Log for Today'}
          </button>
        </div>
      )}

      {/* Skip button */}
      <button
        type="button"
        onClick={handleSkip}
        className="mt-auto text-sm text-gray-400 hover:text-gray-600 transition-colors text-center py-2 min-h-[44px]"
      >
        Skip for now
      </button>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm px-4 py-2 rounded-xl shadow-lg z-10000">
          {toast}
        </div>
      )}
    </div>
  )
}
