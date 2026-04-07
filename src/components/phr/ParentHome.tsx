/**
 * ParentHome — The redesigned parent home screen
 *
 * Design philosophy: "One child, one focus, one action"
 * - Top: child identity card (warm, personal)
 * - Middle: today's focus (KG-driven intelligence)
 * - Center: observation input (the primary action)
 * - Bottom: recent care timeline
 *
 * This replaces the busy ChildDashboard with a calm,
 * focused experience that guides without overwhelming.
 */

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import ObservationCapture from './ObservationCapture'
import LifeDialDrawer from './LifeDialDrawer'

interface Child {
  id: string
  name: string
  dob: string
  gender?: string
  v3_child_id?: string
}

interface CareEpisode {
  id: string
  observationText: string
  parentSummaryShown: string
  pedAlertLevel: string
  pedResponseText: string | null
  pathway: string
  status: string
  createdAt: string
}

interface DailyFocus {
  title: string
  body: string
  domain: string
  emoji: string
}

export default function ParentHome({ childId }: { childId: string }) {
  const { user, loading: authLoading, token } = useAuth()
  const [child, setChild] = useState<Child | null>(null)
  const [loadingChild, setLoadingChild] = useState(true)
  const [episodes, setEpisodes] = useState<CareEpisode[]>([])
  const [dailyFocus, setDailyFocus] = useState<DailyFocus | null>(null)
  const [showMore, setShowMore] = useState(false)
  const [expandedEpisodeId, setExpandedEpisodeId] = useState<string | null>(null)
  const [dialOpen, setDialOpen] = useState(false)
  const [peekTrigger, setPeekTrigger] = useState(0)
  const [completeness, setCompleteness] = useState<number | null>(null)

  // Fetch child data
  const fetchChild = useCallback(async () => {
    if (!token) return
    try {
      const res = await fetch(`/api/children/${childId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json() as { child?: Child; children?: Child[] }
        setChild(data.child || (data.children || []).find((c) => c.id === childId) || null)
      }
    } catch {} finally {
      setLoadingChild(false)
    }
  }, [token, childId])

  // Fetch recent care episodes
  const fetchEpisodes = useCallback(async () => {
    if (!token) return
    try {
      const res = await fetch(`/api/care/episodes?childId=${childId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json() as { episodes: CareEpisode[] }
        setEpisodes((data.episodes || []).slice(0, 10))
      }
    } catch {}
  }, [token, childId])

  // Fetch daily focus (from insights or nudges)
  const fetchDailyFocus = useCallback(async () => {
    if (!token) return
    try {
      const res = await fetch(`/api/daily-insights?childId=${childId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json() as { insights: Array<{ title: string; body: string; domain: string; emoji: string }> }
        const insights = data.insights || []
        if (insights.length > 0) {
          setDailyFocus({
            title: insights[0].title,
            body: insights[0].body,
            domain: insights[0].domain || 'general',
            emoji: insights[0].emoji || '',
          })
        }
      }
    } catch {}
  }, [token, childId])

  // Fetch milestone completeness for progress bar
  const fetchCompleteness = useCallback(async () => {
    if (!token || !child) return
    try {
      const res = await fetch(`/api/milestones?childId=${childId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json() as { milestones: Array<{ status: string }> }
        const achieved = (data.milestones || []).filter(m => m.status === 'achieved').length
        const total = Math.max(achieved, 1)
        // Rough completeness — actual calc is in LifeDial
        setCompleteness(Math.min(Math.round((achieved / Math.max(total, 4)) * 100), 100))
      }
    } catch {}
  }, [token, childId, child])

  useEffect(() => {
    if (token) {
      fetchChild()
      fetchEpisodes()
      fetchDailyFocus()
    }
  }, [token, fetchChild, fetchEpisodes, fetchDailyFocus])

  useEffect(() => {
    if (token && child) fetchCompleteness()
  }, [token, child, fetchCompleteness])

  function handleObservationComplete() {
    fetchEpisodes()
    fetchCompleteness()
    setPeekTrigger(prev => prev + 1) // trigger auto-peek on life dial
  }

  // ── Helpers ──

  function getAgeLabel(dob: string): string {
    const birth = new Date(dob)
    const now = new Date()
    const months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth())
    if (months < 1) return 'Newborn'
    if (months < 12) return `${months} months`
    const years = Math.floor(months / 12)
    const rem = months % 12
    return rem > 0 ? `${years}y ${rem}mo` : `${years} years`
  }

  function getGreeting(): string {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    if (days === 1) return 'yesterday'
    if (days < 7) return `${days} days ago`
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
  }

  const PATHWAY_TEXT: Record<string, string> = {
    '1_observe': 'Monitoring at home',
    '3_econsult': 'Doctor will review',
    '4_tele': 'Video consultation',
    '5_inperson': 'In-person visit',
  }

  const STATUS_TEXT: Record<string, string> = {
    'active': 'Active',
    'awaiting_ped': 'Doctor reviewing',
    'resolved': 'Resolved',
  }

  const ALERT_STYLES: Record<string, string> = {
    emergency: 'bg-red-50 border-red-200',
    urgent: 'bg-orange-50 border-orange-200',
    review: 'bg-amber-50 border-amber-100',
    info: 'bg-blue-50 border-blue-100',
  }

  // ── Loading ──
  if (authLoading || loadingChild) {
    return (
      <div className="max-w-lg mx-auto px-4 py-8 space-y-4">
        <div className="h-28 bg-white rounded-2xl animate-pulse" />
        <div className="h-20 bg-green-50/50 rounded-2xl animate-pulse" />
        <div className="h-44 bg-white rounded-2xl animate-pulse" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12 text-center">
        <p className="text-gray-500">Please sign in to continue.</p>
        <a href="/login" className="mt-4 inline-block px-6 py-2 rounded-xl bg-green-600 text-white text-sm font-semibold">
          Sign In
        </a>
      </div>
    )
  }

  if (!child) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12 text-center">
        <p className="text-gray-500">Child not found.</p>
        <a href="/me" className="mt-4 inline-block text-green-600 text-sm font-semibold">Back</a>
      </div>
    )
  }

  const firstName = child.name.split(' ')[0]
  const activeEpisodes = episodes.filter(e => e.status !== 'resolved')
  const resolvedEpisodes = episodes.filter(e => e.status === 'resolved')

  return (
    <div className="max-w-lg mx-auto px-4 py-6 pb-28 space-y-5">

      {/* ─────────────────────────────────────────────
          1. Child Identity Card
          Warm, personal, not clinical
      ───────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-100 to-emerald-50 flex items-center justify-center text-2xl shadow-sm">
            {child.gender === 'male' ? '\uD83D\uDC66' : child.gender === 'female' ? '\uD83D\uDC67' : '\uD83E\uDDD2'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-gray-900 truncate">{child.name}</h1>
              <span className="text-xs text-gray-400">{getAgeLabel(child.dob)}</span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">{getGreeting()}</p>
            {/* Life record progress bar */}
            {completeness !== null && (
              <div className="flex items-center gap-1.5 mt-1.5">
                <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-700"
                    style={{ width: `${completeness}%` }}
                  />
                </div>
                <span className="text-[10px] font-semibold text-green-600">{completeness}%</span>
              </div>
            )}
          </div>
          {/* Timeline toggle + Full record */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setDialOpen(true)}
              className="p-2 rounded-xl bg-green-50 border border-green-100 text-green-600 hover:bg-green-100 transition-colors"
              title="Life timeline"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Active care status indicator */}
        {activeEpisodes.length > 0 && (
          <div className="mt-4 flex items-center gap-2 px-3 py-2 rounded-xl bg-green-50 border border-green-100">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-medium text-green-700">
              {activeEpisodes.length} active care {activeEpisodes.length === 1 ? 'episode' : 'episodes'}
            </span>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────
          2. Daily Focus (intelligence-driven)
          One thing to pay attention to today
      ───────────────────────────────────────────── */}
      {dailyFocus && (
        <div className="bg-gradient-to-br from-emerald-50 to-green-50/50 rounded-2xl p-4 border border-green-100">
          <div className="flex items-start gap-3">
            <span className="text-xl mt-0.5">{dailyFocus.emoji || '\uD83C\uDF1F'}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-1">
                Today's focus
              </p>
              <p className="text-sm font-medium text-gray-800">{dailyFocus.title}</p>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed line-clamp-2">
                {dailyFocus.body}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────
          3. Observation Capture
          THE primary action — "How is [child] today?"
          Progressive disclosure: free text -> guided -> result
      ───────────────────────────────────────────── */}
      {token && (
        <ObservationCapture
          childId={childId}
          childName={firstName}
          token={token}
          onComplete={handleObservationComplete}
        />
      )}

      {/* ─────────────────────────────────────────────
          4. Recent Care Timeline
          Warm, non-clinical — what's been happening
      ───────────────────────────────────────────── */}
      {episodes.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-1">
            Recent activity
          </p>
          <div className="space-y-2">
            {(showMore ? episodes : episodes.slice(0, 4)).map((ep) => {
              const isExpanded = expandedEpisodeId === ep.id
              return (
                <button
                  key={ep.id}
                  onClick={() => setExpandedEpisodeId(isExpanded ? null : ep.id)}
                  className={`w-full text-left rounded-xl border p-3.5 transition-all ${
                    ALERT_STYLES[ep.pedAlertLevel] || 'bg-white border-gray-100'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Status dot */}
                    <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${
                      ep.status === 'resolved' ? 'bg-gray-300' :
                      ep.pedAlertLevel === 'emergency' ? 'bg-red-500' :
                      ep.pedAlertLevel === 'urgent' ? 'bg-orange-500' :
                      ep.pedAlertLevel === 'review' ? 'bg-amber-400' :
                      'bg-blue-400'
                    }`} />

                    <div className="flex-1 min-w-0">
                      {/* Observation text */}
                      <p className={`text-sm leading-relaxed ${isExpanded ? '' : 'line-clamp-2'} ${
                        ep.status === 'resolved' ? 'text-gray-500' : 'text-gray-800'
                      }`}>
                        {ep.observationText}
                      </p>

                      {/* Meta row */}
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className="text-[11px] text-gray-400">{timeAgo(ep.createdAt)}</span>
                        <span className={`text-[11px] px-1.5 py-0.5 rounded-full ${
                          ep.status === 'resolved'
                            ? 'bg-gray-100 text-gray-500'
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {STATUS_TEXT[ep.status] || ep.status}
                        </span>
                        {ep.pathway && ep.status !== 'resolved' && (
                          <span className="text-[11px] text-gray-400">
                            {PATHWAY_TEXT[ep.pathway] || ''}
                          </span>
                        )}
                      </div>

                      {/* Expanded: show system guidance + doctor response */}
                      {isExpanded && (
                        <div className="mt-3 space-y-2.5">
                          {/* What SKIDS told you */}
                          {ep.parentSummaryShown && (
                            <div className="bg-white/80 rounded-lg p-3 border border-gray-100">
                              <div className="flex items-center gap-1.5 mb-1.5">
                                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-[9px] font-bold">S</div>
                                <span className="text-[10px] font-semibold text-gray-500 uppercase">SKIDS Guide</span>
                              </div>
                              <p className="text-xs text-gray-600 leading-relaxed">{ep.parentSummaryShown}</p>
                            </div>
                          )}

                          {/* Doctor response */}
                          {ep.pedResponseText && (
                            <div className="bg-blue-50/80 rounded-lg p-3 border border-blue-100">
                              <div className="flex items-center gap-1.5 mb-1.5">
                                <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-white text-[9px] font-bold">Dr</div>
                                <span className="text-[10px] font-semibold text-blue-600 uppercase">Your pediatrician</span>
                              </div>
                              <p className="text-xs text-gray-700 leading-relaxed">{ep.pedResponseText}</p>
                            </div>
                          )}

                          {/* Awaiting doctor */}
                          {ep.status === 'awaiting_ped' && !ep.pedResponseText && (
                            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-100">
                              <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                              <span className="text-xs text-amber-700">Your pediatrician is reviewing this</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Expand indicator */}
                    <svg
                      className={`w-4 h-4 text-gray-300 transition-transform flex-shrink-0 mt-1 ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>
              )
            })}

            {/* Show more */}
            {episodes.length > 4 && (
              <button
                onClick={() => setShowMore(!showMore)}
                className="w-full py-2.5 text-center text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showMore ? 'Show less' : `Show ${episodes.length - 4} more`}
              </button>
            )}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────
          5. Quick Access Grid
          Secondary features — not the focus, but accessible
      ───────────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { href: `/child/${childId}`, emoji: '\uD83D\uDCCA', label: 'Growth' },
          { href: `/child/${childId}`, emoji: '\uD83C\uDFAF', label: 'Milestones' },
          { href: `/child/${childId}`, emoji: '\uD83D\uDC89', label: 'Vaccines' },
          { href: `/child/${childId}`, emoji: '\uD83D\uDCCB', label: 'Records' },
        ].map((item) => (
          <a
            key={item.label}
            href={item.href}
            className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-white border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all"
          >
            <span className="text-lg">{item.emoji}</span>
            <span className="text-[10px] font-medium text-gray-500">{item.label}</span>
          </a>
        ))}
      </div>

      {/* ─────────────────────────────────────────────
          SKIDS Guide FAB — mobile only
      ───────────────────────────────────────────── */}
      <button
        onClick={() => window.dispatchEvent(new CustomEvent('open-dr-skids', { detail: { childId } }))}
        className="fixed bottom-20 right-4 z-40 md:hidden flex items-center gap-2 px-4 py-2.5 rounded-full bg-green-600 text-white text-sm font-semibold shadow-lg shadow-green-500/30 hover:bg-green-700 transition-colors"
        aria-label="Ask SKIDS Guide"
      >
        <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">S</span>
        Ask SKIDS
      </button>

      {/* ─────────────────────────────────────────────
          Life Dial Drawer — collapsible left drawer
      ───────────────────────────────────────────── */}
      {token && child && (
        <LifeDialDrawer
          childId={childId}
          childDob={child.dob}
          childName={firstName}
          token={token}
          isOpen={dialOpen}
          onToggle={() => setDialOpen(prev => !prev)}
          peekTrigger={peekTrigger}
        />
      )}
    </div>
  )
}
