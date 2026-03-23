import { useState, useEffect, useCallback } from 'react'
import { analytics } from '@/lib/analytics/manager'
import {
  getMilestonesForAge,
  MILESTONE_CATEGORIES,
  type MilestoneDefinition,
} from '@/lib/content/milestones'

interface DbMilestone {
  milestone_key: string
  title: string
  category: string
  status: string
  expected_age_min: number
  expected_age_max: number
}

interface Step2Props {
  token: string
  childId: string
  childName: string
  ageMonths: number
  onComplete: (milestoneId: string | null, status: string | null, logged: boolean) => void
  onSkip: () => void
}

export default function Step2Milestones({
  token,
  childId,
  childName,
  ageMonths,
  onComplete,
  onSkip,
}: Step2Props) {
  const [milestones, setMilestones] = useState<MilestoneDefinition[]>([])
  const [dbStatuses, setDbStatuses] = useState<Record<string, string>>({})
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const [expandedKey, setExpandedKey] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  // Auto-dismiss toast after 3s
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 3000)
    return () => clearTimeout(t)
  }, [toast])

  // Fetch existing milestones from DB on mount
  useEffect(() => {
    if (!childId) return
    fetch(`/api/milestones?childId=${childId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json() as Promise<{ milestones: DbMilestone[] }>)
      .then((data) => {
        const statusMap: Record<string, string> = {}
        for (const m of data.milestones ?? []) {
          statusMap[m.milestone_key] = m.status
        }
        setDbStatuses(statusMap)
      })
      .catch(() => {
        // non-blocking — proceed without existing data
      })
  }, [childId, token])

  // Derive age-appropriate milestones (3–6 cards)
  useEffect(() => {
    const ageMilestones = getMilestonesForAge(ageMonths)

    // Prioritise exact-range matches first
    const exact = ageMilestones.filter(
      (m) => m.expectedAgeMin <= ageMonths && m.expectedAgeMax >= ageMonths
    )
    const nearby = ageMilestones.filter(
      (m) => !(m.expectedAgeMin <= ageMonths && m.expectedAgeMax >= ageMonths)
    )

    const combined = [...exact, ...nearby].slice(0, 6)
    // Ensure at least 3
    const final = combined.length >= 3 ? combined : ageMilestones.slice(0, 6)
    setMilestones(final)
  }, [ageMonths])

  const getCategoryMeta = useCallback((cat: string) => {
    return (
      MILESTONE_CATEGORIES.find((c) => c.key === cat) ?? {
        label: cat,
        emoji: '📌',
        color: 'text-gray-600',
        bg: 'bg-gray-50',
      }
    )
  }, [])

  const handleCardTap = (key: string) => {
    setSelectedKey(key)
    setExpandedKey((prev) => (prev === key ? null : key))
  }

  const handleStatusSelect = async (milestone: MilestoneDefinition, status: 'achieved' | 'in_progress') => {
    setSaving(true)
    const observedAt = status === 'achieved' ? new Date().toISOString() : undefined

    let logged = false
    try {
      const res = await fetch('/api/milestones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          childId,
          milestoneKey: milestone.key,
          title: milestone.title,
          category: milestone.category,
          status,
          ...(observedAt ? { observedAt } : {}),
        }),
      })
      logged = res.ok
      if (!res.ok) {
        setToast("Couldn't save milestone — you can update it later")
      }
    } catch {
      setToast("Couldn't save milestone — you can update it later")
    }

    analytics.trackEvent('onboarding_step_completed', { step: 2 })
    setSaving(false)
    onComplete(milestone.key, status, logged)
  }

  const handleSkip = () => {
    analytics.trackEvent('onboarding_step_skipped', { step: 2 })
    onSkip()
  }

  const selectedMilestone = milestones.find((m) => m.key === selectedKey) ?? null

  return (
    <div className="flex flex-col h-full px-5 pt-4 pb-6 overflow-y-auto">
      {/* Heading */}
      <h2 className="text-xl font-semibold text-gray-900 mb-1">Milestones</h2>
      <p className="text-sm text-gray-500 mb-4">
        Here are some milestones for {childName} at {ageMonths} months.
      </p>

      {/* Milestone grid */}
      <div className="grid grid-cols-1 min-[400px]:grid-cols-2 gap-3 mb-6">
        {milestones.map((m) => {
          const cat = getCategoryMeta(m.category)
          const isSelected = selectedKey === m.key
          const isExpanded = expandedKey === m.key

          return (
            <div key={m.key} className="flex flex-col">
              <button
                type="button"
                onClick={() => handleCardTap(m.key)}
                className={`text-left rounded-2xl shadow-sm border p-4 cursor-pointer transition-shadow ${
                  isSelected
                    ? 'bg-green-50 border-green-500 shadow-sm'
                    : 'bg-white border-gray-100 hover:shadow-md'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cat.bg} ${cat.color}`}>
                    {cat.emoji} {cat.label}
                  </span>
                </div>
                <p className="text-sm font-medium text-gray-800 leading-snug">{m.title}</p>
              </button>

              {/* Inline status buttons */}
              {isExpanded && (
                <div className="flex gap-2 mt-2 px-1">
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => handleStatusSelect(m, 'achieved')}
                    className="flex-1 text-sm font-medium py-2 rounded-xl bg-green-500 text-white hover:bg-green-600 transition-colors disabled:opacity-50"
                  >
                    Achieved ✓
                  </button>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => handleStatusSelect(m, 'in_progress')}
                    className="flex-1 text-sm font-medium py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors disabled:opacity-50"
                  >
                    In Progress →
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Skip button */}
      <button
        type="button"
        onClick={handleSkip}
        className="mt-auto text-sm text-gray-400 hover:text-gray-600 transition-colors text-center py-2"
      >
        Skip for now
      </button>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm px-4 py-2 rounded-xl shadow-lg z-[10000]">
          {toast}
        </div>
      )}
    </div>
  )
}
