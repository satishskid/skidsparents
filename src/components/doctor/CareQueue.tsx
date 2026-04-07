/**
 * Doctor Care Queue — Shows care episodes requiring attention
 *
 * Displays episodes sorted by severity: emergency → urgent → review → info
 * Each episode shows the twin record: parent's observation + clinical projections
 * Doctor can: respond (e-consult text), resolve, escalate, schedule
 */

import { useState, useEffect } from 'react'

interface CareEpisode {
  id: string
  childId: string
  childName: string
  childDob: string
  parentName: string
  observationText: string
  observationStructured: {
    domains?: string[]
    clarifyingQuestions?: string[]
    confidence?: number
    projectionsCount?: number
  }
  pathway: string
  status: string
  parentSummaryShown: string
  parentGuidanceShown: {
    activities?: string[]
    watchFor?: string[]
    escalateIf?: string[]
  }
  pedAlertLevel: string
  pedResponseText: string | null
  pedResponseAt: string | null
  projectionSnapshot: {
    projections?: Array<{
      conditionName: string
      icd10?: string
      domain: string
      category: string
      baseProbability: number
      adjustedProbability: number
      urgency: string
      mustNotMiss: boolean
      parentExplanation: string
      doctorExamPoints?: string[]
      matchSource?: string
    }>
    confidence?: number
    domainsDetected?: string[]
    clarifyingQuestions?: string[]
  }
  followUpAt: string | null
  resolvedAt: string | null
  resolutionNote: string | null
  resolvedBy: string | null
  createdAt: string
}

interface QueueCounts {
  emergency: number
  urgent: number
  review: number
  info: number
  total: number
}

interface CareQueueProps {
  token: string
}

const ALERT_COLORS: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  emergency: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', badge: 'bg-red-500' },
  urgent: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-800', badge: 'bg-orange-500' },
  review: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-800', badge: 'bg-amber-500' },
  info: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', badge: 'bg-blue-500' },
  none: { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-600', badge: 'bg-gray-400' },
}

const ALERT_LABELS: Record<string, string> = {
  emergency: 'Emergency',
  urgent: 'Urgent',
  review: 'Review',
  info: 'Info',
  none: 'Logged',
}

const PATHWAY_LABELS: Record<string, string> = {
  '1_observe': 'Observe at home',
  '2_ped_initiated': 'Ped-initiated',
  '3_econsult': 'E-consult',
  '4_tele': 'Telemedicine',
  '5_inperson': 'In-person',
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function ageFromDob(dob: string): string {
  const birth = new Date(dob)
  const now = new Date()
  let totalMonths = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth())
  if (now.getDate() < birth.getDate()) totalMonths--
  if (totalMonths < 0) totalMonths = 0
  if (totalMonths < 24) return `${totalMonths}m`
  return `${Math.floor(totalMonths / 12)}y ${totalMonths % 12}m`
}

export default function CareQueue({ token }: CareQueueProps) {
  const [episodes, setEpisodes] = useState<CareEpisode[]>([])
  const [counts, setCounts] = useState<QueueCounts>({ emergency: 0, urgent: 0, review: 0, info: 0, total: 0 })
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'active' | 'resolved'>('active')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [respondingId, setRespondingId] = useState<string | null>(null)
  const [responseText, setResponseText] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [bookingConfirm, setBookingConfirm] = useState<{
    episodeId: string; orderId: string; scheduledAt: string; type: string
  } | null>(null)

  useEffect(() => {
    fetchEpisodes()
  }, [token, filter])

  async function fetchEpisodes() {
    setLoading(true)
    try {
      const res = await fetch(`/api/doctor/episodes?filter=${filter}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json() as { episodes: CareEpisode[]; counts: QueueCounts }
        setEpisodes(data.episodes || [])
        setCounts(data.counts || { emergency: 0, urgent: 0, review: 0, info: 0, total: 0 })
      }
    } catch { /* ignore */ }
    setLoading(false)
  }

  async function handleAction(episodeId: string, action: string, extra?: Record<string, string>) {
    setActionLoading(true)
    try {
      const res = await fetch('/api/doctor/episodes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ episodeId, action, ...extra }),
      })
      if (res.ok) {
        const data = await res.json() as Record<string, unknown>
        // Show booking confirmation if an order was created
        if (data.orderId) {
          setBookingConfirm({
            episodeId,
            orderId: data.orderId as string,
            scheduledAt: data.scheduledAt as string,
            type: extra?.scheduleType || 'tele',
          })
        }
        await fetchEpisodes()
        setRespondingId(null)
        setResponseText('')
        if (!data.orderId) setExpandedId(null)
      }
    } catch { /* ignore */ }
    setActionLoading(false)
  }

  // ── Summary badges ──
  const SummaryBadges = () => (
    <div className="flex items-center gap-2 flex-wrap">
      {counts.emergency > 0 && (
        <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold">
          {counts.emergency} emergency
        </span>
      )}
      {counts.urgent > 0 && (
        <span className="px-2.5 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-bold">
          {counts.urgent} urgent
        </span>
      )}
      {counts.review > 0 && (
        <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold">
          {counts.review} review
        </span>
      )}
      {counts.info > 0 && (
        <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
          {counts.info} info
        </span>
      )}
      {counts.total === 0 && (
        <span className="text-sm text-gray-400">No active episodes</span>
      )}
    </div>
  )

  // ── Episode card ──
  const EpisodeCard = ({ ep }: { ep: CareEpisode }) => {
    const colors = ALERT_COLORS[ep.pedAlertLevel] || ALERT_COLORS.none
    const isExpanded = expandedId === ep.id
    const isResponding = respondingId === ep.id
    const projections = ep.projectionSnapshot?.projections || []

    return (
      <div className={`rounded-xl border ${colors.border} ${colors.bg} overflow-hidden transition-all`}>
        {/* Header — always visible */}
        <button
          onClick={() => setExpandedId(isExpanded ? null : ep.id)}
          className="w-full text-left p-4"
        >
          <div className="flex items-start gap-3">
            {/* Alert level badge */}
            <div className={`w-2 h-2 rounded-full ${colors.badge} mt-2 flex-shrink-0`} />

            <div className="flex-1 min-w-0">
              {/* Top row: child name, age, time */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-sm text-gray-900">{ep.childName}</span>
                {ep.childDob && (
                  <span className="text-xs text-gray-500">{ageFromDob(ep.childDob)}</span>
                )}
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${colors.badge} text-white`}>
                  {ALERT_LABELS[ep.pedAlertLevel] || 'Logged'}
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-gray-200 text-gray-600">
                  {PATHWAY_LABELS[ep.pathway] || ep.pathway}
                </span>
                <span className="text-xs text-gray-400 ml-auto">{timeAgo(ep.createdAt)}</span>
              </div>

              {/* Observation text */}
              <p className="text-sm text-gray-700 mt-1.5 leading-relaxed line-clamp-2">
                "{ep.observationText}"
              </p>

              {/* Parent name */}
              <p className="text-xs text-gray-400 mt-1">
                by {ep.parentName}
              </p>
            </div>

            {/* Expand arrow */}
            <svg
              className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 mt-1 ${isExpanded ? 'rotate-180' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>

        {/* Expanded content */}
        {isExpanded && (
          <div className="border-t border-gray-200/60 p-4 space-y-4 bg-white/80">

            {/* Parent Interaction Record */}
            <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-100">
              <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-2">
                Parent Interaction Record
              </p>
              <div className="space-y-1.5 text-xs">
                <div className="flex gap-2">
                  <span className="text-indigo-400 w-20 flex-shrink-0">Saw:</span>
                  <span className="text-gray-700 italic">{ep.parentSummaryShown || 'Not recorded'}</span>
                </div>
                {ep.parentGuidanceShown?.activities && ep.parentGuidanceShown.activities.length > 0 && (
                  <div className="flex gap-2">
                    <span className="text-indigo-400 w-20 flex-shrink-0">Activities:</span>
                    <span className="text-gray-700">{ep.parentGuidanceShown.activities.slice(0, 3).join('; ')}</span>
                  </div>
                )}
                {ep.parentGuidanceShown?.watchFor && ep.parentGuidanceShown.watchFor.length > 0 && (
                  <div className="flex gap-2">
                    <span className="text-indigo-400 w-20 flex-shrink-0">Watch for:</span>
                    <span className="text-gray-700">{ep.parentGuidanceShown.watchFor.slice(0, 2).join('; ')}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Clinical Projections */}
            {projections.length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Projections ({projections.length})
                </p>
                <div className="space-y-2">
                  {projections.slice(0, 5).map((proj, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-3 p-2.5 rounded-lg border ${
                        proj.mustNotMiss ? 'border-red-200 bg-red-50/50' : 'border-gray-100 bg-gray-50/50'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-medium text-gray-900">{proj.conditionName}</span>
                          {proj.icd10 && <span className="text-[10px] text-gray-400">{proj.icd10}</span>}
                          {proj.mustNotMiss && (
                            <span className="px-1 py-0.5 rounded text-[9px] font-bold bg-red-100 text-red-600">MUST NOT MISS</span>
                          )}
                          {proj.matchSource === 'safety-net' && (
                            <span className="px-1 py-0.5 rounded text-[9px] bg-gray-200 text-gray-500">SAFETY NET</span>
                          )}
                        </div>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          {proj.domain} · {proj.category} · {proj.urgency}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold text-gray-900">
                          {(proj.adjustedProbability * 100).toFixed(1)}%
                        </p>
                        <p className="text-[10px] text-gray-400">
                          base: {(proj.baseProbability * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Domains & Confidence */}
            <div className="flex items-center gap-3 text-xs text-gray-400">
              {ep.observationStructured?.domains && (
                <span>Domains: {ep.observationStructured.domains.join(', ')}</span>
              )}
              {ep.observationStructured?.confidence != null && (
                <span>Confidence: {(ep.observationStructured.confidence * 100).toFixed(0)}%</span>
              )}
            </div>

            {/* Doctor Response (if already responded) */}
            {ep.pedResponseText && (
              <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                <p className="text-[10px] font-bold text-green-500 uppercase tracking-wider mb-1">Your Response</p>
                <p className="text-sm text-gray-700">{ep.pedResponseText}</p>
                {ep.pedResponseAt && (
                  <p className="text-[10px] text-gray-400 mt-1">{timeAgo(ep.pedResponseAt)}</p>
                )}
              </div>
            )}

            {/* E-consult response form */}
            {isResponding && (
              <div className="space-y-2">
                <textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Write your guidance for the parent... This will be shown to them in the app."
                  className="w-full p-3 rounded-lg border border-gray-200 text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={4}
                  autoFocus
                />
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAction(ep.id, 'respond', { responseText })}
                    disabled={!responseText.trim() || actionLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {actionLoading ? 'Sending...' : 'Send to parent'}
                  </button>
                  <button
                    onClick={() => { setRespondingId(null); setResponseText('') }}
                    className="px-4 py-2 text-gray-500 rounded-lg text-xs hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Action buttons (only for unresolved episodes) */}
            {ep.status !== 'resolved' && !isResponding && (
              <div className="flex items-center gap-2 flex-wrap pt-1">
                {/* Respond (e-consult) */}
                <button
                  onClick={() => setRespondingId(ep.id)}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors"
                >
                  Respond
                </button>

                {/* Resolve */}
                <button
                  onClick={() => handleAction(ep.id, 'resolve', { resolutionNote: 'Reviewed, no action needed' })}
                  disabled={actionLoading}
                  className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors"
                >
                  Dismiss
                </button>

                {/* Schedule tele */}
                {ep.pathway !== '4_tele' && ep.pathway !== '5_inperson' && (
                  <button
                    onClick={() => handleAction(ep.id, 'schedule', { scheduleType: 'tele' })}
                    disabled={actionLoading}
                    className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-xs font-medium hover:bg-purple-200 transition-colors"
                  >
                    Schedule tele
                  </button>
                )}

                {/* Schedule in-person */}
                <button
                  onClick={() => handleAction(ep.id, 'schedule', { scheduleType: 'inperson' })}
                  disabled={actionLoading}
                  className="px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg text-xs font-medium hover:bg-orange-200 transition-colors"
                >
                  Schedule visit
                </button>
              </div>
            )}

            {/* Resolution info */}
            {ep.status === 'resolved' && (
              <div className="text-xs text-gray-400 pt-1">
                Resolved {ep.resolvedAt ? timeAgo(ep.resolvedAt) : ''} by {ep.resolvedBy || 'unknown'}
                {ep.resolutionNote && ` — ${ep.resolutionNote}`}
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Care Queue</h2>
          <SummaryBadges />
        </div>
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
          <button
            onClick={() => setFilter('active')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              filter === 'active' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter('resolved')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              filter === 'resolved' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Resolved
          </button>
        </div>
      </div>

      {/* Booking confirmation banner */}
      {bookingConfirm && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-green-800">
              {bookingConfirm.type === 'tele' ? 'Video consultation' : 'In-person visit'} scheduled
            </p>
            <p className="text-xs text-green-600 mt-0.5">
              Order {bookingConfirm.orderId.slice(0, 8)}... · Parent has been notified
            </p>
          </div>
          <button
            onClick={() => setBookingConfirm(null)}
            className="text-green-400 hover:text-green-600 p-1"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Episode list */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        </div>
      ) : episodes.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-sm text-gray-500">
            {filter === 'active' ? 'No active care episodes. All caught up!' : 'No resolved episodes yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {episodes.map((ep) => (
            <EpisodeCard key={ep.id} ep={ep} />
          ))}
        </div>
      )}
    </div>
  )
}
