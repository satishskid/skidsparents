/**
 * NudgeStrip — Horizontal scrollable strip of smart nudge cards
 *
 * Proactive, personalized nudges that appear between daily insights
 * and the timeline. Each nudge card has an action (log observation,
 * view milestone, open chat) and can be swiped to dismiss.
 */

import { useState, useEffect, useCallback } from 'react'

interface Nudge {
  key: string
  id: string
  type: string
  title: string
  body: string
  emoji: string
  actionType: string
  actionData?: string
  priority: number
}

interface Props {
  childId: string
  token: string
  onAction?: (actionType: string, actionData?: string) => void
}

export default function NudgeStrip({ childId, token, onAction }: Props) {
  const [nudges, setNudges] = useState<Nudge[]>([])
  const [loading, setLoading] = useState(true)
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  const fetchNudges = useCallback(async () => {
    try {
      const res = await fetch(`/api/nudges?childId=${childId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setNudges(data.nudges || [])
      }
    } catch {} finally {
      setLoading(false)
    }
  }, [childId, token])

  useEffect(() => {
    fetchNudges()
  }, [fetchNudges])

  async function handleDismiss(nudge: Nudge) {
    setDismissed(prev => new Set(prev).add(nudge.key))

    try {
      await fetch('/api/nudges', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'dismiss', nudgeKey: nudge.key }),
      })
    } catch {}
  }

  function handleTap(nudge: Nudge) {
    if (onAction) {
      onAction(nudge.actionType, nudge.actionData)
    } else if (nudge.actionType === 'open_chat' && nudge.actionData) {
      window.dispatchEvent(new CustomEvent('open-dr-skids', {
        detail: { question: nudge.actionData },
      }))
    }
  }

  const visibleNudges = nudges.filter(n => !dismissed.has(n.key))

  if (loading) {
    return (
      <div className="flex gap-2 overflow-hidden">
        <div className="min-w-[240px] h-20 bg-gray-50 rounded-xl animate-pulse" />
        <div className="min-w-[240px] h-20 bg-gray-50 rounded-xl animate-pulse" />
      </div>
    )
  }

  if (visibleNudges.length === 0) return null

  const TYPE_COLORS: Record<string, string> = {
    milestone_window: 'bg-amber-50 border-amber-200',
    observation_gap: 'bg-purple-50 border-purple-200',
    pattern_alert: 'bg-orange-50 border-orange-200',
    celebration: 'bg-green-50 border-green-200',
    vaccination_reminder: 'bg-red-50 border-red-200',
    screening_due: 'bg-teal-50 border-teal-200',
  }

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-2 px-1">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          🔔 For You
        </span>
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-1">
        {visibleNudges.map((nudge) => (
          <div
            key={nudge.key}
            className={`min-w-[260px] max-w-[280px] rounded-xl p-3.5 border snap-center ${
              TYPE_COLORS[nudge.type] || 'bg-gray-50 border-gray-200'
            }`}
          >
            <div className="flex items-start gap-2">
              <span className="text-xl flex-shrink-0">{nudge.emoji}</span>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-gray-800 leading-tight mb-0.5 truncate">
                  {nudge.title}
                </h4>
                <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
                  {nudge.body}
                </p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); handleDismiss(nudge) }}
                className="text-gray-400 hover:text-gray-600 flex-shrink-0 p-0.5"
                aria-label="Dismiss"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <button
              onClick={() => handleTap(nudge)}
              className="mt-2 w-full py-1.5 rounded-lg bg-white/80 border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-white transition-colors"
            >
              {nudge.actionType === 'add_observation' ? 'Log observation' :
               nudge.actionType === 'view_milestone' ? 'View milestones' :
               nudge.actionType === 'open_chat' ? 'Ask Dr. SKIDS' :
               nudge.actionType === 'view_vaccination' ? 'View vaccines' :
               'View'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
