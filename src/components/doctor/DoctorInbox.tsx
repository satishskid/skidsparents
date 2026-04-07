/**
 * DoctorInbox — WhatsApp-style unified inbox
 *
 * Design: chat thread list, sorted by urgency.
 * Each row = one child (patient), showing:
 * - Child name + age
 * - Latest observation/concern preview
 * - Urgency badge (emergency, urgent, review, info)
 * - Time ago
 * - Unresolved count badge
 *
 * Tap → opens PatientThread view
 *
 * This replaces the separate Patient Panel + Care Queue tabs
 * with a single unified view that's natural for Indian doctors
 * already habituated to WhatsApp workflows.
 */

import { useState, useEffect, useCallback } from 'react'
import PatientThread from './PatientThread'

interface PatientThread_ {
  childId: string
  childName: string
  childDob: string
  parentName: string
  parentPhone?: string
  // Latest episode info
  latestObservation: string
  latestAlertLevel: string
  latestPathway: string
  latestStatus: string
  latestCreatedAt: string
  // Counts
  unresolvedCount: number
  totalCount: number
  // Has doctor responded to latest?
  latestHasResponse: boolean
}

interface DoctorInboxProps {
  token: string
}

const URGENCY_ORDER: Record<string, number> = {
  emergency: 0,
  urgent: 1,
  review: 2,
  info: 3,
}

const ALERT_DOT_COLORS: Record<string, string> = {
  emergency: 'bg-red-500',
  urgent: 'bg-orange-500',
  review: 'bg-amber-400',
  info: 'bg-blue-400',
}

const ALERT_BADGE_STYLES: Record<string, string> = {
  emergency: 'bg-red-500 text-white',
  urgent: 'bg-orange-500 text-white',
  review: 'bg-amber-100 text-amber-700',
  info: 'bg-blue-100 text-blue-700',
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'now'
  if (mins < 60) return `${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  if (days === 1) return '1d'
  if (days < 7) return `${days}d`
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
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

export default function DoctorInbox({ token }: DoctorInboxProps) {
  const [threads, setThreads] = useState<PatientThread_[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedThread, setSelectedThread] = useState<PatientThread_ | null>(null)
  const [summaryCount, setSummaryCount] = useState({ emergency: 0, urgent: 0, review: 0, total: 0 })

  const fetchThreads = useCallback(async () => {
    setLoading(true)
    try {
      // Fetch all active episodes from the care queue
      const res = await fetch('/api/doctor/episodes?filter=active', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json() as {
          episodes: Array<{
            id: string
            childId: string
            childName: string
            childDob: string
            parentName: string
            observationText: string
            pedAlertLevel: string
            pathway: string
            status: string
            pedResponseText: string | null
            createdAt: string
          }>
          counts: { emergency: number; urgent: number; review: number; info: number; total: number }
        }

        const episodes = data.episodes || []
        setSummaryCount({
          emergency: data.counts?.emergency || 0,
          urgent: data.counts?.urgent || 0,
          review: data.counts?.review || 0,
          total: data.counts?.total || 0,
        })

        // Group by child → build thread list
        const childMap = new Map<string, PatientThread_>()

        for (const ep of episodes) {
          const existing = childMap.get(ep.childId)
          if (!existing) {
            childMap.set(ep.childId, {
              childId: ep.childId,
              childName: ep.childName,
              childDob: ep.childDob,
              parentName: ep.parentName,
              latestObservation: ep.observationText,
              latestAlertLevel: ep.pedAlertLevel,
              latestPathway: ep.pathway,
              latestStatus: ep.status,
              latestCreatedAt: ep.createdAt,
              unresolvedCount: ep.status !== 'resolved' ? 1 : 0,
              totalCount: 1,
              latestHasResponse: !!ep.pedResponseText,
            })
          } else {
            existing.totalCount++
            if (ep.status !== 'resolved') existing.unresolvedCount++
            // Keep the latest (most urgent or most recent)
            const existingUrgency = URGENCY_ORDER[existing.latestAlertLevel] ?? 99
            const newUrgency = URGENCY_ORDER[ep.pedAlertLevel] ?? 99
            if (newUrgency < existingUrgency || (newUrgency === existingUrgency && new Date(ep.createdAt) > new Date(existing.latestCreatedAt))) {
              existing.latestObservation = ep.observationText
              existing.latestAlertLevel = ep.pedAlertLevel
              existing.latestPathway = ep.pathway
              existing.latestStatus = ep.status
              existing.latestCreatedAt = ep.createdAt
              existing.latestHasResponse = !!ep.pedResponseText
            }
          }
        }

        // Sort: highest urgency first, then most recent
        const sorted = Array.from(childMap.values()).sort((a, b) => {
          const urgA = URGENCY_ORDER[a.latestAlertLevel] ?? 99
          const urgB = URGENCY_ORDER[b.latestAlertLevel] ?? 99
          if (urgA !== urgB) return urgA - urgB
          return new Date(b.latestCreatedAt).getTime() - new Date(a.latestCreatedAt).getTime()
        })

        setThreads(sorted)
      }
    } catch {}
    setLoading(false)
  }, [token])

  useEffect(() => {
    fetchThreads()
  }, [fetchThreads])

  function handleBack() {
    setSelectedThread(null)
    fetchThreads() // Refresh after actions
  }

  // ── Thread view (patient detail) ──
  if (selectedThread) {
    return (
      <PatientThread
        childId={selectedThread.childId}
        childName={selectedThread.childName}
        childDob={selectedThread.childDob}
        parentName={selectedThread.parentName}
        token={token}
        onBack={handleBack}
      />
    )
  }

  // ── Filter threads by search ──
  const filtered = threads.filter(t =>
    t.childName.toLowerCase().includes(search.toLowerCase()) ||
    t.parentName.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-0">

      {/* ── Header with summary counts ── */}
      <div className="px-1 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-900">Inbox</h2>
          <div className="flex items-center gap-1.5">
            {summaryCount.emergency > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-[11px] font-bold">
                {summaryCount.emergency}
              </span>
            )}
            {summaryCount.urgent > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-orange-500 text-white text-[11px] font-bold">
                {summaryCount.urgent}
              </span>
            )}
            {summaryCount.total > 0 && (
              <span className="text-xs text-gray-400">{summaryCount.total} active</span>
            )}
          </div>
        </div>

        {/* Search */}
        {threads.length > 3 && (
          <div className="relative">
            <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search patients..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        )}
      </div>

      {/* ── Thread list ── */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center mx-auto mb-3">
            <svg className="w-7 h-7 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-sm text-gray-500 font-medium">All caught up</p>
          <p className="text-xs text-gray-400 mt-1">No active care episodes</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100 bg-white rounded-xl border border-gray-100 overflow-hidden">
          {filtered.map((thread) => (
            <button
              key={thread.childId}
              onClick={() => setSelectedThread(thread)}
              className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors text-left"
            >
              {/* Avatar with urgency indicator */}
              <div className="relative flex-shrink-0">
                <div className="w-11 h-11 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-semibold text-sm">
                  {thread.childName[0].toUpperCase()}
                </div>
                {/* Urgency dot */}
                <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${
                  ALERT_DOT_COLORS[thread.latestAlertLevel] || 'bg-gray-300'
                }`} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`text-sm truncate ${
                    !thread.latestHasResponse ? 'font-bold text-gray-900' : 'font-medium text-gray-700'
                  }`}>
                    {thread.childName}
                  </span>
                  <span className="text-[11px] text-gray-400">{ageFromDob(thread.childDob)}</span>
                </div>
                <p className={`text-xs truncate leading-relaxed ${
                  !thread.latestHasResponse ? 'text-gray-700' : 'text-gray-400'
                }`}>
                  {thread.latestObservation}
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {thread.parentName}
                </p>
              </div>

              {/* Right side: time + count */}
              <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                <span className={`text-[11px] ${
                  !thread.latestHasResponse ? 'text-green-600 font-medium' : 'text-gray-400'
                }`}>
                  {timeAgo(thread.latestCreatedAt)}
                </span>
                {thread.unresolvedCount > 0 && (
                  <span className={`min-w-[20px] h-5 flex items-center justify-center rounded-full text-[10px] font-bold px-1.5 ${
                    ALERT_BADGE_STYLES[thread.latestAlertLevel] || 'bg-gray-100 text-gray-600'
                  }`}>
                    {thread.unresolvedCount}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
