/**
 * LifeDial — Vertical timeline of a child's milestone journey
 *
 * Shows Birth → NOW → Future as a scrollable vertical strip.
 * Past milestones shown with green checkmarks.
 * Current position highlighted with pulsing NOW marker + "watch for" items.
 * Upcoming milestones shown in amber/gray.
 * Observation dots at each month show care episode activity.
 *
 * Data sources:
 * - Milestone definitions from lib/content/milestones.ts
 * - Saved milestone records from /api/milestones
 * - Care episodes from /api/care/episodes
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { MILESTONES, type MilestoneDefinition } from '@/lib/content/milestones'

interface SavedMilestone {
  id: string
  milestone_key: string
  category: string
  title: string
  status: string
  observed_at?: string
  parent_notes?: string
  expected_age_min?: number
  expected_age_max?: number
}

interface EpisodeDot {
  month: number
  count: number
  hasActive: boolean
  hasUrgent: boolean
}

interface Props {
  childId: string
  childDob: string
  token: string
  onClose: () => void
}

const CATEGORY_COLORS: Record<string, string> = {
  motor: 'text-orange-600',
  cognitive: 'text-purple-600',
  social: 'text-pink-600',
  language: 'text-blue-600',
}

const CATEGORY_EMOJI: Record<string, string> = {
  motor: '\uD83C\uDFC3',
  cognitive: '\uD83E\uDDE0',
  social: '\u2764\uFE0F',
  language: '\uD83D\uDCAC',
}

export default function LifeDial({ childId, childDob, token, onClose }: Props) {
  const [saved, setSaved] = useState<SavedMilestone[]>([])
  const [episodeDots, setEpisodeDots] = useState<EpisodeDot[]>([])
  const [loading, setLoading] = useState(true)
  const nowRef = useRef<HTMLDivElement>(null)

  const ageMonths = getAgeMonths(childDob)

  // Fetch saved milestones + episodes
  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [milestoneRes, episodeRes] = await Promise.all([
        fetch(`/api/milestones?childId=${childId}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`/api/care/episodes?childId=${childId}`, { headers: { Authorization: `Bearer ${token}` } }),
      ])

      if (milestoneRes.ok) {
        const data = await milestoneRes.json() as { milestones: SavedMilestone[] }
        setSaved(data.milestones || [])
      }

      if (episodeRes.ok) {
        const data = await episodeRes.json() as { episodes: Array<{ createdAt: string; pedAlertLevel: string; status: string }> }
        // Group episodes by month of child's age when created
        const dots = new Map<number, EpisodeDot>()
        for (const ep of (data.episodes || [])) {
          const epDate = new Date(ep.createdAt)
          const birth = new Date(childDob)
          const monthAtEp = (epDate.getFullYear() - birth.getFullYear()) * 12 + (epDate.getMonth() - birth.getMonth())
          const clamped = Math.max(0, Math.min(monthAtEp, 60))
          const existing = dots.get(clamped) || { month: clamped, count: 0, hasActive: false, hasUrgent: false }
          existing.count++
          if (ep.status !== 'resolved') existing.hasActive = true
          if (ep.pedAlertLevel === 'emergency' || ep.pedAlertLevel === 'urgent') existing.hasUrgent = true
          dots.set(clamped, existing)
        }
        setEpisodeDots(Array.from(dots.values()))
      }
    } catch {}
    setLoading(false)
  }, [childId, token, childDob])

  useEffect(() => { fetchData() }, [fetchData])

  // Auto-scroll to NOW after load
  useEffect(() => {
    if (!loading && nowRef.current) {
      nowRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [loading])

  // Build timeline entries
  const savedMap = new Map(saved.map(s => [s.milestone_key, s]))

  // Get milestone status
  function getMilestoneStatus(def: MilestoneDefinition): 'achieved' | 'in_progress' | 'upcoming' | 'future' {
    const s = savedMap.get(def.key)
    if (s?.status === 'achieved') return 'achieved'
    if (s?.status === 'in_progress') return 'in_progress'
    if (def.expectedAgeMax < ageMonths) return 'upcoming' // should have happened
    if (def.expectedAgeMin <= ageMonths + 3) return 'upcoming'
    return 'future'
  }

  // Group milestones by their midpoint month for timeline placement
  function getMilestoneMonth(def: MilestoneDefinition): number {
    return Math.round((def.expectedAgeMin + def.expectedAgeMax) / 2)
  }

  // Build month entries from 0 to ageMonths + 6
  const maxMonth = Math.min(ageMonths + 6, 60)
  const monthEntries: Array<{
    month: number
    milestones: Array<{ def: MilestoneDefinition; status: string }>
    isNow: boolean
    isPast: boolean
    dots: EpisodeDot | null
  }> = []

  for (let m = maxMonth; m >= 0; m--) {
    const ms = MILESTONES
      .filter(def => getMilestoneMonth(def) === m)
      .map(def => ({ def, status: getMilestoneStatus(def) }))

    const dots = episodeDots.find(d => d.month === m) || null

    // Only include months that have milestones, dots, or are NOW, or are every 3rd month
    if (ms.length > 0 || dots || m === ageMonths || m % 3 === 0 || m === 0) {
      monthEntries.push({
        month: m,
        milestones: ms,
        isNow: m === ageMonths,
        isPast: m < ageMonths,
        dots,
      })
    }
  }

  // Watch-for items at current age
  const watchForMilestones = MILESTONES.filter(
    def => def.expectedAgeMin <= ageMonths + 2 && def.expectedAgeMax >= ageMonths && !savedMap.get(def.key)?.status?.includes('achieved')
  )

  // Completeness calculation
  const pastMilestones = MILESTONES.filter(def => def.expectedAgeMax <= ageMonths)
  const achievedCount = pastMilestones.filter(def => savedMap.get(def.key)?.status === 'achieved').length
  const totalPast = pastMilestones.length
  const completeness = totalPast > 0 ? Math.round((achievedCount / totalPast) * 100) : 0
  const totalAchieved = saved.filter(s => s.status === 'achieved').length
  const totalObservations = episodeDots.reduce((sum, d) => sum + d.count, 0)

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between z-10">
        <div>
          <p className="text-sm font-bold text-gray-900">Life Timeline</p>
          <p className="text-[10px] text-gray-400">Birth to present &middot; {ageMonths} months</p>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Completeness bar */}
      <div className="px-4 py-3 border-b border-gray-50 bg-white">
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-700"
              style={{ width: `${completeness}%` }}
            />
          </div>
          <span className="text-[11px] font-bold text-green-600">{completeness}%</span>
        </div>
        <p className="text-[10px] text-gray-400 mt-1">
          {totalAchieved} milestones &middot; {totalObservations} observations
        </p>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="py-2">
            {/* Future label */}
            <div className="px-4 py-2">
              <p className="text-[9px] font-bold text-gray-300 uppercase tracking-wider text-center">Coming up</p>
            </div>

            {monthEntries.map((entry) => {
              const isNow = entry.isNow

              return (
                <div
                  key={entry.month}
                  ref={isNow ? nowRef : undefined}
                  className={`flex items-start gap-3 px-4 py-3 border-b border-gray-50 ${
                    isNow ? 'bg-green-50 border-b-green-200 relative' : ''
                  } ${!entry.isPast && !isNow ? 'opacity-70' : ''}`}
                >
                  {/* Green left accent for NOW */}
                  {isNow && <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500 rounded-r" />}

                  {/* Timeline node */}
                  <div className="flex flex-col items-center flex-shrink-0 w-6">
                    {isNow ? (
                      <div className="relative w-4 h-4 rounded-full bg-green-600 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        <div className="absolute inset-[-3px] rounded-full border-2 border-green-500 animate-ping opacity-30" />
                      </div>
                    ) : entry.milestones.some(m => m.status === 'achieved') ? (
                      <div className="w-3.5 h-3.5 rounded-full bg-green-500 flex items-center justify-center">
                        <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    ) : entry.milestones.some(m => m.status === 'in_progress') ? (
                      <div className="w-3 h-3 rounded-full border-2 border-amber-400 bg-amber-50" />
                    ) : entry.milestones.some(m => m.status === 'upcoming') ? (
                      <div className="w-3 h-3 rounded-full border-2 border-amber-300 bg-white" />
                    ) : entry.isPast ? (
                      <div className="w-2 h-2 rounded-full bg-green-300" />
                    ) : (
                      <div className="w-2 h-2 rounded-full border border-gray-300 bg-white" />
                    )}
                    {/* Connector line */}
                    <div className={`w-px flex-1 min-h-[16px] ${
                      entry.isPast || isNow ? 'bg-green-300' : 'bg-gray-200'
                    }`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pb-1">
                    {/* Month label */}
                    <div className="flex items-center gap-1.5">
                      <p className={`text-xs font-medium ${
                        isNow ? 'text-green-800 font-bold' : entry.isPast ? 'text-gray-700' : 'text-gray-400'
                      }`}>
                        {entry.month === 0 ? 'Birth' : `${entry.month} months`}
                      </p>
                      {isNow && (
                        <span className="text-[8px] font-bold bg-green-600 text-white px-1.5 py-0.5 rounded-full">NOW</span>
                      )}
                    </div>

                    {/* Milestones */}
                    {entry.milestones.map(({ def, status }) => (
                      <div key={def.key} className="flex items-center gap-1.5 mt-1">
                        <span className="text-xs">{CATEGORY_EMOJI[def.category] || ''}</span>
                        <p className={`text-[11px] ${
                          status === 'achieved' ? 'text-green-600 font-medium' :
                          status === 'in_progress' ? 'text-amber-600 font-medium' :
                          entry.isPast ? 'text-gray-500' : 'text-gray-400'
                        }`}>
                          {def.title}
                          {status === 'achieved' && ' \u2714\uFE0F'}
                          {status === 'in_progress' && ' \u25D0'}
                        </p>
                      </div>
                    ))}

                    {/* Watch-for items at NOW */}
                    {isNow && watchForMilestones.length > 0 && (
                      <div className="mt-2 space-y-1">
                        <p className="text-[10px] font-semibold text-green-700">{'\uD83D\uDC40'} Watch for:</p>
                        {watchForMilestones.slice(0, 4).map(wf => (
                          <p key={wf.key} className="text-[11px] text-gray-600 pl-5">
                            {wf.title}
                            <span className="text-gray-400"> ({wf.expectedAgeMin}–{wf.expectedAgeMax}m)</span>
                          </p>
                        ))}
                      </div>
                    )}

                    {/* Episode dots */}
                    {entry.dots && (
                      <div className="flex items-center gap-1 mt-1.5">
                        {entry.dots.hasUrgent && <div className="w-2 h-2 rounded-full bg-red-400" />}
                        {entry.dots.hasActive && !entry.dots.hasUrgent && <div className="w-2 h-2 rounded-full bg-amber-400" />}
                        {!entry.dots.hasActive && <div className="w-2 h-2 rounded-full bg-gray-300" />}
                        <span className="text-[9px] text-gray-400">
                          {entry.dots.count} observation{entry.dots.count > 1 ? 's' : ''}
                          {entry.dots.hasActive ? ' (active)' : ''}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}

            {/* Birth label at bottom */}
            <div className="px-4 py-3">
              <p className="text-[9px] font-bold text-gray-300 uppercase tracking-wider text-center">Birth</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function getAgeMonths(dob: string): number {
  const birth = new Date(dob)
  const now = new Date()
  return (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth())
}
