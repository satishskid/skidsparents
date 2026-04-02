/**
 * InterventionProgress — Compliance visualization for parent view.
 *
 * Shows weekly grid, progress bar, streak, and overall stats.
 * Expandable tile in the MORE_TILES section of ChildDashboard.
 */

import { useState, useEffect, useCallback } from 'react'

interface Assignment {
  id: string
  protocolName: string
  protocolDescription: string
  category: string
  status: string
  startDate: string
  endDate: string
  durationDays: number
  dayNumber: number
  customParams: Record<string, any>
  doctorName: string
  streak: {
    currentStreak: number
    longestStreak: number
    compliancePct: number
    totalDone: number
    totalSkipped: number
    totalPartial: number
  }
}

const CATEGORY_EMOJI: Record<string, string> = {
  vision: '👁️', hearing: '👂', dental: '🦷', developmental: '🧩',
  nutrition: '🥄', skin: '🧴', respiratory: '🫁', physio: '🏋️',
  behavioral: '🧠', growth: '📏', cardiac: '❤️', allergy: '🤧',
}

export default function InterventionProgress({
  childId,
  token,
}: {
  childId: string
  token: string
}) {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)

  const fetchAssignments = useCallback(async () => {
    try {
      const res = await fetch(`/api/interventions/active?childId=${childId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setAssignments(data.assignments || [])
      }
    } catch {} finally {
      setLoading(false)
    }
  }, [childId, token])

  useEffect(() => { fetchAssignments() }, [fetchAssignments])

  if (loading) {
    return <div className="bg-white rounded-2xl p-4 animate-pulse h-32" />
  }

  if (assignments.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
        <p className="text-sm text-gray-500">No active interventions</p>
        <p className="text-xs text-gray-400 mt-1">When your doctor prescribes a home therapy, it will appear here.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {assignments.map(a => {
        const progressPct = Math.min(100, (a.dayNumber / a.durationDays) * 100)
        const emoji = CATEGORY_EMOJI[a.category] || '💊'

        return (
          <div key={a.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            {/* Header */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">{emoji}</span>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-gray-900">{a.protocolName}</h3>
                <p className="text-[10px] text-gray-500">
                  Prescribed by Dr. {a.doctorName || 'Unknown'} · Day {a.dayNumber}/{a.durationDays}
                </p>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                a.status === 'active' ? 'bg-green-100 text-green-700' :
                a.status === 'paused' ? 'bg-amber-100 text-amber-700' :
                'bg-gray-100 text-gray-600'
              }`}>
                {a.status}
              </span>
            </div>

            {/* Progress bar */}
            <div className="mb-3">
              <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                <span>Progress</span>
                <span>{Math.round(progressPct)}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full transition-all"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-4 gap-2">
              <StatBox
                label="Compliance"
                value={`${Math.round(a.streak.compliancePct)}%`}
                color={a.streak.compliancePct >= 70 ? 'text-green-600' : a.streak.compliancePct >= 40 ? 'text-amber-600' : 'text-red-600'}
              />
              <StatBox
                label="Streak"
                value={`${a.streak.currentStreak}d`}
                color="text-orange-600"
                emoji="🔥"
              />
              <StatBox
                label="Done"
                value={String(a.streak.totalDone)}
                color="text-green-600"
              />
              <StatBox
                label="Skipped"
                value={String(a.streak.totalSkipped)}
                color="text-red-500"
              />
            </div>

            {/* Custom params */}
            {a.customParams && Object.keys(a.customParams).length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-[10px] text-gray-400 mb-1">Prescribed parameters</p>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(a.customParams).map(([key, value]) => (
                    <span key={key} className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full">
                      {key.replace(/_/g, ' ')}: {String(value)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function StatBox({ label, value, color, emoji }: {
  label: string; value: string; color: string; emoji?: string
}) {
  return (
    <div className="text-center bg-gray-50 rounded-lg py-2">
      <p className={`text-sm font-bold ${color}`}>
        {emoji && <span className="text-xs">{emoji}</span>} {value}
      </p>
      <p className="text-[9px] text-gray-400">{label}</p>
    </div>
  )
}
