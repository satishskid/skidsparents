/**
 * PatientThread — Chat-like care episode thread for a single patient
 *
 * Design: WhatsApp conversation view.
 * Shows all care episodes for this child as a chronological thread.
 * Each episode shows:
 * - Parent's observation (left-aligned bubble, like received message)
 * - System's response (left-aligned, SKIDS badge)
 * - Doctor's response if any (right-aligned, like sent message)
 * - Status/pathway indicators
 *
 * Quick action bar at bottom for the doctor to respond.
 */

import { useState, useEffect, useCallback, useRef } from 'react'

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
  }
  resolvedAt: string | null
  resolutionNote: string | null
  resolvedBy: string | null
  createdAt: string
}

interface PatientThreadProps {
  childId: string
  childName: string
  childDob: string
  parentName: string
  token: string
  onBack: () => void
}

const PATHWAY_LABELS: Record<string, string> = {
  '1_observe': 'Home monitoring',
  '2_ped_initiated': 'Ped-initiated',
  '3_econsult': 'E-consult',
  '4_tele': 'Telemedicine',
  '5_inperson': 'In-person',
}

const ALERT_LABELS: Record<string, string> = {
  emergency: 'EMERGENCY',
  urgent: 'URGENT',
  review: 'REVIEW',
  info: 'INFO',
}

const ALERT_BADGE_STYLES: Record<string, string> = {
  emergency: 'bg-red-500 text-white',
  urgent: 'bg-orange-500 text-white',
  review: 'bg-amber-100 text-amber-800',
  info: 'bg-blue-100 text-blue-700',
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (date.toDateString() === today.toDateString()) return 'Today'
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
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

export default function PatientThread({ childId, childName, childDob, parentName, token, onBack }: PatientThreadProps) {
  const [episodes, setEpisodes] = useState<CareEpisode[]>([])
  const [loading, setLoading] = useState(true)
  const [responseText, setResponseText] = useState('')
  const [respondingToId, setRespondingToId] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [showProjections, setShowProjections] = useState<string | null>(null)
  const [quickAction, setQuickAction] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const fetchEpisodes = useCallback(async () => {
    setLoading(true)
    try {
      // Fetch all episodes (active + resolved) for this child
      const res = await fetch(`/api/doctor/episodes?filter=all`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json() as { episodes: CareEpisode[] }
        // Filter to this child only, sort chronologically (oldest first)
        const childEps = (data.episodes || [])
          .filter((ep: CareEpisode) => ep.childId === childId)
          .sort((a: CareEpisode, b: CareEpisode) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        setEpisodes(childEps)
      }
    } catch {}
    setLoading(false)
  }, [token, childId])

  useEffect(() => {
    fetchEpisodes()
  }, [fetchEpisodes])

  // Scroll to bottom on load/new episodes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [episodes, loading])

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
        await fetchEpisodes()
        setRespondingToId(null)
        setResponseText('')
        setQuickAction(null)
      }
    } catch {}
    setActionLoading(false)
  }

  function handleRespond(episodeId: string) {
    setRespondingToId(episodeId)
    setQuickAction(null)
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  function handleSend() {
    if (!respondingToId || !responseText.trim()) return
    handleAction(respondingToId, 'respond', { responseText: responseText.trim() })
  }

  // ── Date grouping helper ──
  function groupByDate(eps: CareEpisode[]): Array<{ date: string; episodes: CareEpisode[] }> {
    const groups: Array<{ date: string; episodes: CareEpisode[] }> = []
    let currentDate = ''
    for (const ep of eps) {
      const date = formatDate(ep.createdAt)
      if (date !== currentDate) {
        groups.push({ date, episodes: [ep] })
        currentDate = date
      } else {
        groups[groups.length - 1].episodes.push(ep)
      }
    }
    return groups
  }

  const dateGroups = groupByDate(episodes)
  const unresolvedEps = episodes.filter(ep => ep.status !== 'resolved')
  const latestUnresolved = unresolvedEps.length > 0 ? unresolvedEps[unresolvedEps.length - 1] : null

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] bg-gray-50">
      {/* ── Thread header ── */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 flex-shrink-0">
        <button onClick={onBack} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
          <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>

        <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-semibold text-sm flex-shrink-0">
          {childName[0].toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-gray-900 text-sm truncate">{childName}</h2>
            <span className="text-[11px] text-gray-400">{ageFromDob(childDob)}</span>
          </div>
          <p className="text-[11px] text-gray-400 truncate">{parentName}</p>
        </div>

        {/* Quick actions */}
        <div className="flex items-center gap-1">
          <a
            href={`/doctor/console?childId=${childId}&name=${encodeURIComponent(childName)}&age=${ageFromDob(childDob)}`}
            className="px-2.5 py-1.5 rounded-lg bg-blue-600 text-white text-[11px] font-semibold hover:bg-blue-700 transition-colors"
          >
            Console
          </a>
        </div>
      </div>

      {/* ── Message area ── */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          </div>
        ) : episodes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-gray-400">No care episodes for this patient</p>
          </div>
        ) : (
          dateGroups.map((group) => (
            <div key={group.date}>
              {/* Date separator */}
              <div className="flex items-center justify-center mb-3">
                <span className="px-3 py-1 rounded-full bg-gray-200/60 text-[11px] text-gray-500 font-medium">
                  {group.date}
                </span>
              </div>

              {group.episodes.map((ep) => (
                <div key={ep.id} className="mb-4">
                  {/* ── Parent observation bubble (left-aligned) ── */}
                  <div className="flex gap-2 mb-1.5 max-w-[85%]">
                    <div className="bg-white rounded-2xl rounded-tl-sm p-3 shadow-sm border border-gray-100 flex-1">
                      {/* Alert badge */}
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                          ALERT_BADGE_STYLES[ep.pedAlertLevel] || 'bg-gray-100 text-gray-600'
                        }`}>
                          {ALERT_LABELS[ep.pedAlertLevel] || 'LOGGED'}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {PATHWAY_LABELS[ep.pathway] || ep.pathway}
                        </span>
                        {ep.status === 'resolved' && (
                          <span className="text-[10px] text-green-600 font-medium">Resolved</span>
                        )}
                      </div>

                      {/* Observation text */}
                      <p className="text-sm text-gray-800 leading-relaxed">
                        {ep.observationText}
                      </p>

                      {/* Time */}
                      <p className="text-[10px] text-gray-400 mt-1.5 text-right">
                        {formatTime(ep.createdAt)} &middot; {ep.parentName}
                      </p>
                    </div>
                  </div>

                  {/* ── System intelligence (clinical data, toggleable) ── */}
                  <div className="ml-4 mb-1.5">
                    <button
                      onClick={() => setShowProjections(showProjections === ep.id ? null : ep.id)}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-[10px] text-gray-500 font-medium transition-colors"
                    >
                      <svg className={`w-3 h-3 transition-transform ${showProjections === ep.id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                      {(ep.projectionSnapshot?.projections || []).length} projections
                      {ep.observationStructured?.confidence != null &&
                        ` \u00B7 ${(ep.observationStructured.confidence * 100).toFixed(0)}% conf`}
                    </button>

                    {/* Expanded projections */}
                    {showProjections === ep.id && (
                      <div className="mt-2 space-y-1.5">
                        {/* Parent interaction record */}
                        <div className="bg-indigo-50/80 rounded-lg p-2.5 border border-indigo-100">
                          <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider mb-1">Parent saw</p>
                          <p className="text-[11px] text-gray-600 italic leading-relaxed">
                            {ep.parentSummaryShown || 'Not recorded'}
                          </p>
                          {ep.parentGuidanceShown?.activities && ep.parentGuidanceShown.activities.length > 0 && (
                            <p className="text-[11px] text-gray-500 mt-1">
                              Activities: {ep.parentGuidanceShown.activities.slice(0, 2).join('; ')}
                            </p>
                          )}
                        </div>

                        {/* Projections */}
                        {(ep.projectionSnapshot?.projections || []).slice(0, 5).map((proj, i) => (
                          <div
                            key={i}
                            className={`flex items-center gap-2 p-2 rounded-lg border text-[11px] ${
                              proj.mustNotMiss
                                ? 'border-red-200 bg-red-50/60'
                                : 'border-gray-100 bg-white'
                            }`}
                          >
                            <div className="flex-1 min-w-0">
                              <span className="font-medium text-gray-800">{proj.conditionName}</span>
                              {proj.icd10 && <span className="text-gray-400 ml-1">{proj.icd10}</span>}
                              {proj.mustNotMiss && (
                                <span className="ml-1 px-1 py-0.5 rounded text-[8px] font-bold bg-red-100 text-red-600">MNM</span>
                              )}
                              <p className="text-gray-400 mt-0.5">{proj.domain} &middot; {proj.urgency}</p>
                              {proj.doctorExamPoints && proj.doctorExamPoints.length > 0 && (
                                <p className="text-gray-500 mt-0.5">Exam: {proj.doctorExamPoints.slice(0, 2).join('; ')}</p>
                              )}
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="font-bold text-gray-800">
                                {(proj.adjustedProbability * 100).toFixed(1)}%
                              </p>
                              <p className="text-gray-400 text-[9px]">
                                base {(proj.baseProbability * 100).toFixed(1)}%
                              </p>
                            </div>
                          </div>
                        ))}

                        {ep.observationStructured?.domains && (
                          <p className="text-[10px] text-gray-400 px-1">
                            Domains: {ep.observationStructured.domains.join(', ')}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* ── Doctor response bubble (right-aligned) ── */}
                  {ep.pedResponseText && (
                    <div className="flex justify-end mb-1.5">
                      <div className="bg-blue-600 rounded-2xl rounded-tr-sm p-3 max-w-[85%] shadow-sm">
                        <p className="text-sm text-white leading-relaxed">
                          {ep.pedResponseText}
                        </p>
                        <p className="text-[10px] text-blue-200 mt-1.5 text-right">
                          {ep.pedResponseAt ? formatTime(ep.pedResponseAt) : ''} &middot; You
                        </p>
                      </div>
                    </div>
                  )}

                  {/* ── Resolution note ── */}
                  {ep.status === 'resolved' && ep.resolvedBy === 'doctor' && !ep.pedResponseText && (
                    <div className="flex justify-end mb-1.5">
                      <div className="bg-gray-200 rounded-2xl rounded-tr-sm px-3 py-2 max-w-[85%]">
                        <p className="text-[11px] text-gray-500 italic">
                          Reviewed — {ep.resolutionNote || 'no action needed'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* ── Inline action buttons (for unresolved, not currently responding) ── */}
                  {ep.status !== 'resolved' && !ep.pedResponseText && respondingToId !== ep.id && (
                    <div className="ml-4 flex items-center gap-1.5 mt-1">
                      <button
                        onClick={() => handleRespond(ep.id)}
                        className="px-2.5 py-1 rounded-lg bg-blue-600 text-white text-[11px] font-semibold hover:bg-blue-700 transition-colors"
                      >
                        Reply
                      </button>
                      <button
                        onClick={() => handleAction(ep.id, 'resolve', { resolutionNote: 'Reviewed, no action needed' })}
                        disabled={actionLoading}
                        className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600 text-[11px] font-medium hover:bg-gray-200 transition-colors"
                      >
                        Dismiss
                      </button>
                      <button
                        onClick={() => setQuickAction(quickAction === ep.id ? null : ep.id)}
                        className="px-2 py-1 rounded-lg bg-gray-100 text-gray-500 text-[11px] hover:bg-gray-200 transition-colors"
                      >
                        &middot;&middot;&middot;
                      </button>

                      {/* Quick action dropdown */}
                      {quickAction === ep.id && (
                        <div className="flex items-center gap-1 ml-1">
                          {ep.pathway !== '4_tele' && ep.pathway !== '5_inperson' && (
                            <button
                              onClick={() => handleAction(ep.id, 'schedule', { scheduleType: 'tele' })}
                              disabled={actionLoading}
                              className="px-2.5 py-1 rounded-lg bg-purple-100 text-purple-700 text-[11px] font-medium hover:bg-purple-200 transition-colors"
                            >
                              Tele
                            </button>
                          )}
                          <button
                            onClick={() => handleAction(ep.id, 'schedule', { scheduleType: 'inperson' })}
                            disabled={actionLoading}
                            className="px-2.5 py-1 rounded-lg bg-orange-100 text-orange-700 text-[11px] font-medium hover:bg-orange-200 transition-colors"
                          >
                            Visit
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))
        )}
      </div>

      {/* ── Reply bar (fixed at bottom) ── */}
      {latestUnresolved && (
        <div className="bg-white border-t border-gray-200 p-3 flex-shrink-0">
          {respondingToId ? (
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={responseText}
                onChange={(e) => {
                  setResponseText(e.target.value)
                  e.target.style.height = 'auto'
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`
                }}
                placeholder="Write your guidance for the parent..."
                className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 max-h-[120px]"
                rows={1}
              />
              <button
                onClick={handleSend}
                disabled={!responseText.trim() || actionLoading}
                className="p-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors flex-shrink-0"
              >
                {actionLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                  </svg>
                )}
              </button>
              <button
                onClick={() => { setRespondingToId(null); setResponseText('') }}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : (
            <button
              onClick={() => handleRespond(latestUnresolved.id)}
              className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-100 text-gray-500 text-sm hover:bg-gray-200 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
              </svg>
              Respond to {childName}'s concern...
            </button>
          )}
        </div>
      )}
    </div>
  )
}
