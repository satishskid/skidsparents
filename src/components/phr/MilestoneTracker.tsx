import { useState, useEffect, useCallback } from 'react'
import { MILESTONES, MILESTONE_CATEGORIES, getMilestonesForAge, type MilestoneDefinition } from '@/lib/content/milestones'

interface SavedMilestone {
  id: string
  milestone_key: string
  status: string
  observed_at?: string
  parent_notes?: string
}

interface Props {
  childId: string
  ageMonths: number
  token: string
}

const STATUS_OPTIONS = [
  { value: 'not_started', label: 'Not Yet', icon: '○', color: 'text-gray-400' },
  { value: 'in_progress', label: 'Working On', icon: '◐', color: 'text-amber-500' },
  { value: 'achieved', label: 'Achieved!', icon: '●', color: 'text-green-600' },
]

export default function MilestoneTracker({ childId, ageMonths, token }: Props) {
  const [saved, setSaved] = useState<SavedMilestone[]>([])
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)

  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }

  const fetchMilestones = useCallback(async () => {
    try {
      const res = await fetch(`/api/milestones?childId=${childId}`, { headers: { Authorization: `Bearer ${token}` } })
      if (res.ok) {
        const data = await res.json() as { milestones?: SavedMilestone[] }
        setSaved(data.milestones || [])
      }
    } catch {} finally {
      setLoading(false)
    }
  }, [childId, token])

  useEffect(() => { fetchMilestones() }, [fetchMilestones])

  const relevantMilestones = getMilestonesForAge(ageMonths)

  const filtered = activeCategory === 'all'
    ? relevantMilestones
    : relevantMilestones.filter((m) => m.category === activeCategory)

  function getStatus(key: string): string {
    const s = saved.find((m) => m.milestone_key === key)
    return s?.status || 'not_started'
  }

  async function toggleStatus(milestone: MilestoneDefinition) {
    const current = getStatus(milestone.key)
    const next = current === 'not_started' ? 'in_progress'
      : current === 'in_progress' ? 'achieved'
      : 'not_started'

    setSaving(milestone.key)
    try {
      await fetch('/api/milestones', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          childId,
          milestoneKey: milestone.key,
          title: milestone.title,
          category: milestone.category,
          status: next,
          observedAt: next === 'achieved' ? new Date().toISOString().split('T')[0] : null,
          expectedAgeMin: milestone.expectedAgeMin,
          expectedAgeMax: milestone.expectedAgeMax,
        }),
      })
      await fetchMilestones()
    } catch {} finally {
      setSaving(null)
    }
  }

  const achievedCount = saved.filter((m) => m.status === 'achieved').length
  const totalRelevant = relevantMilestones.length

  if (loading) {
    return (
      <div className="space-y-3">
        {[1,2,3,4].map((i) => (
          <div key={i} className="bg-white rounded-xl p-4 animate-pulse h-16" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-700">Progress</span>
          <span className="text-sm text-green-600 font-bold">{achievedCount}/{totalRelevant}</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${totalRelevant ? (achievedCount / totalRelevant) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveCategory('all')}
          className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            activeCategory === 'all' ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 border border-gray-200'
          }`}
        >
          All
        </button>
        {MILESTONE_CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeCategory === cat.key ? `${cat.bg} ${cat.color}` : 'bg-white text-gray-600 border border-gray-200'
            }`}
          >
            {cat.emoji} {cat.label}
          </button>
        ))}
      </div>

      {/* Milestones List */}
      <div className="space-y-2">
        {filtered.map((m) => {
          const status = getStatus(m.key)
          const statusInfo = STATUS_OPTIONS.find((s) => s.value === status)!
          const isSaving = saving === m.key
          const cat = MILESTONE_CATEGORIES.find((c) => c.key === m.category)

          return (
            <button
              key={m.key}
              onClick={() => toggleStatus(m)}
              disabled={isSaving}
              className="w-full text-left bg-white rounded-xl p-4 border border-gray-100 hover:border-gray-200 transition-colors shadow-sm"
            >
              <div className="flex items-start gap-3">
                <span className={`text-lg mt-0.5 ${isSaving ? 'animate-spin' : ''} ${statusInfo.color}`}>
                  {isSaving ? '⏳' : statusInfo.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900">{m.title}</span>
                    {status === 'achieved' && <span className="text-xs bg-green-50 text-green-700 px-1.5 py-0.5 rounded-full">Done</span>}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{m.description}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className={`text-[10px] font-medium ${cat?.color || ''}`}>{cat?.emoji} {cat?.label}</span>
                    <span className="text-[10px] text-gray-400">
                      {m.expectedAgeMin}–{m.expectedAgeMax} months
                    </span>
                  </div>
                </div>
              </div>
            </button>
          )
        })}

        {filtered.length === 0 && (
          <div className="text-center py-8 text-gray-400 text-sm">
            No milestones for this age range in this category.
          </div>
        )}
      </div>
    </div>
  )
}
