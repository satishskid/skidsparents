import { useState, useEffect, useCallback } from 'react'

interface VaccineWithStatus {
  key: string
  name: string
  abbreviation: string
  dose: string
  dueAgeMonths: number
  category: string
  status: 'done' | 'due' | 'overdue' | 'upcoming'
  administeredDate?: string
  provider?: string
}

interface VaccineSummary {
  done: number
  due: number
  overdue: number
  total: number
}

interface VaccinationTrackerProps {
  childId: string
  token: string
}

const STATUS_CONFIG = {
  done: { label: 'Done', color: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
  due: { label: 'Due Now', color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
  overdue: { label: 'Overdue', color: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
  upcoming: { label: 'Upcoming', color: 'bg-gray-100 text-gray-500', dot: 'bg-gray-300' },
}

// Group vaccines by due age for display
const AGE_LABELS: Record<number, string> = {
  0: 'Birth',
  1.5: '6 Weeks',
  2.5: '10 Weeks',
  3.5: '14 Weeks',
  9: '9 Months',
  12: '12 Months',
  15: '15 Months',
  16: '16-18 Months',
  18: '18 Months',
  48: '4-6 Years',
  108: '9-12 Years',
  114: '9-12 Years',
  120: '10-12 Years',
}

export default function VaccinationTracker({ childId, token }: VaccinationTrackerProps) {
  const [schedule, setSchedule] = useState<VaccineWithStatus[]>([])
  const [summary, setSummary] = useState<VaccineSummary>({ done: 0, due: 0, overdue: 0, total: 0 })
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState<string | null>(null) // vaccine key
  const [addDate, setAddDate] = useState(new Date().toISOString().split('T')[0])
  const [addProvider, setAddProvider] = useState('')
  const [saving, setSaving] = useState(false)
  const [expanded, setExpanded] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/vaccinations?childId=${childId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setSchedule(data.schedule || [])
        setSummary(data.summary || { done: 0, due: 0, overdue: 0, total: 0 })
      }
    } catch {} finally {
      setLoading(false)
    }
  }, [childId, token])

  useEffect(() => { fetchData() }, [fetchData])

  const handleMarkDone = async (vaccine: VaccineWithStatus) => {
    setSaving(true)
    try {
      const res = await fetch('/api/vaccinations', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          childId,
          vaccineName: vaccine.name,
          dose: vaccine.dose,
          administeredDate: addDate,
          provider: addProvider.trim() || undefined,
        }),
      })
      if (res.ok) {
        setShowAddForm(null)
        setAddProvider('')
        fetchData()
      }
    } catch {} finally {
      setSaving(false)
    }
  }

  // Group by age
  const groups = new Map<string, VaccineWithStatus[]>()
  for (const v of schedule) {
    const label = AGE_LABELS[v.dueAgeMonths] || `${Math.round(v.dueAgeMonths)} months`
    if (!groups.has(label)) groups.set(label, [])
    groups.get(label)!.push(v)
  }

  if (loading) {
    return <div className="bg-white rounded-xl p-6 animate-pulse h-32" />
  }

  const progressPct = summary.total > 0 ? Math.round((summary.done / summary.total) * 100) : 0

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      {/* Header with toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-4 text-left"
      >
        <span className="text-xl">💉</span>
        <div className="flex-1">
          <h3 className="text-sm font-bold text-gray-900">Vaccination Schedule</h3>
          <div className="flex items-center gap-3 mt-1">
            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${progressPct}%` }} />
            </div>
            <span className="text-xs text-gray-500 flex-shrink-0">{summary.done}/{summary.total}</span>
          </div>
        </div>
        {(summary.due > 0 || summary.overdue > 0) && (
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            summary.overdue > 0 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
          }`}>
            {summary.overdue > 0 ? `${summary.overdue} overdue` : `${summary.due} due`}
          </span>
        )}
        <svg className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-4">
          {Array.from(groups.entries()).map(([label, vaccines]) => {
            // Only show groups that have due/overdue/done vaccines (skip far-future upcoming)
            const hasRelevant = vaccines.some((v) => v.status !== 'upcoming')
            if (!hasRelevant && !vaccines.some((v) => v.status === 'upcoming' && v.dueAgeMonths < 200)) return null

            return (
              <div key={label}>
                <h4 className="text-xs font-semibold text-gray-400 uppercase mb-1.5">{label}</h4>
                <div className="space-y-1">
                  {vaccines.map((v) => {
                    const cfg = STATUS_CONFIG[v.status]
                    const isAdding = showAddForm === v.key

                    return (
                      <div key={v.key}>
                        <div className="flex items-center gap-2 py-1.5">
                          <div className={`w-2 h-2 rounded-full ${cfg.dot} flex-shrink-0`} />
                          <span className={`text-sm flex-1 ${v.status === 'done' ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                            {v.abbreviation}
                          </span>
                          {v.status === 'done' ? (
                            <span className="text-[10px] text-gray-400">
                              {v.administeredDate ? new Date(v.administeredDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '✓'}
                            </span>
                          ) : (
                            <button
                              onClick={(e) => { e.stopPropagation(); setShowAddForm(isAdding ? null : v.key) }}
                              className={`px-2 py-0.5 rounded text-[10px] font-medium ${cfg.color}`}
                            >
                              {isAdding ? 'Cancel' : v.status === 'overdue' ? 'Mark Done' : v.status === 'due' ? 'Mark Done' : 'Mark Done'}
                            </button>
                          )}
                        </div>

                        {isAdding && (
                          <div className="ml-4 pl-2 border-l-2 border-green-200 py-2 space-y-2">
                            <div className="flex gap-2">
                              <input
                                type="date" value={addDate} onChange={(e) => setAddDate(e.target.value)}
                                className="flex-1 px-2 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-xs"
                              />
                              <input
                                type="text" value={addProvider} onChange={(e) => setAddProvider(e.target.value)}
                                placeholder="Provider"
                                className="flex-1 px-2 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-xs"
                              />
                            </div>
                            <button
                              onClick={() => handleMarkDone(v)}
                              disabled={saving}
                              className="px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-medium disabled:opacity-50"
                            >
                              {saving ? 'Saving...' : 'Confirm'}
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
