/**
 * LifeRecordTimeline — Instagram-like feed of the child's story
 *
 * Infinite scroll card feed combining observations, milestones,
 * daily insights, and doctor notes. The visual "story" of the child.
 *
 * Features:
 * - Filter chips (All, Flagged, Photos)
 * - Pull-to-refresh pattern
 * - Skeleton loading
 * - Each card type has distinct styling
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import ObservationCard from './ObservationCard'

interface TimelineEntry {
  id: string
  type: 'observation' | 'milestone' | 'insight' | 'doctor_note'
  timestamp: string
  data: Record<string, any>
}

interface Props {
  childId: string
  token: string
  limit?: number
}

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'flagged', label: '⚠ Flagged' },
  { key: 'photos', label: '📷 Photos' },
]

export default function LifeRecordTimeline({ childId, token, limit = 20 }: Props) {
  const [entries, setEntries] = useState<TimelineEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [filter, setFilter] = useState('all')
  const bottomRef = useRef<HTMLDivElement>(null)

  const fetchTimeline = useCallback(async (pageNum: number, reset = false) => {
    if (reset) setLoading(true)
    else setLoadingMore(true)

    try {
      const params = new URLSearchParams({
        childId,
        page: String(pageNum),
        limit: String(limit),
      })
      if (filter !== 'all') params.set('filter', filter)

      const res = await fetch(`/api/timeline?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.ok) {
        const data = await res.json()
        const newEntries = data.entries || []
        setHasMore(data.hasMore)

        if (reset) {
          setEntries(newEntries)
        } else {
          setEntries(prev => [...prev, ...newEntries])
        }
      }
    } catch {} finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [childId, token, limit, filter])

  // Initial load + filter change
  useEffect(() => {
    setPage(1)
    fetchTimeline(1, true)
  }, [fetchTimeline])

  // Intersection observer for infinite scroll
  useEffect(() => {
    if (!bottomRef.current || !hasMore || loadingMore) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !loadingMore) {
          const nextPage = page + 1
          setPage(nextPage)
          fetchTimeline(nextPage)
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(bottomRef.current)
    return () => observer.disconnect()
  }, [hasMore, loadingMore, page, fetchTimeline])

  function handleFilterChange(newFilter: string) {
    setFilter(newFilter)
  }

  // Skeleton loading
  if (loading) {
    return (
      <div className="space-y-3">
        <div className="flex gap-2">
          {FILTERS.map(f => (
            <div key={f.key} className="h-8 w-16 bg-gray-100 rounded-full animate-pulse" />
          ))}
        </div>
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 animate-pulse space-y-2">
            <div className="flex gap-2">
              <div className="w-8 h-8 bg-gray-100 rounded-full" />
              <div className="h-4 bg-gray-100 rounded w-32" />
            </div>
            <div className="h-3 bg-gray-100 rounded w-full" />
            <div className="h-3 bg-gray-100 rounded w-2/3" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Filter chips */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => handleFilterChange(f.key)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
              filter === f.key
                ? 'bg-green-50 border-green-200 text-green-700'
                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Timeline entries */}
      {entries.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center">
          <p className="text-3xl mb-2">📱</p>
          <p className="text-sm text-gray-500">No entries yet. Start by adding an observation!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => {
            if (entry.type === 'observation') {
              return (
                <ObservationCard
                  key={entry.id}
                  id={entry.id}
                  text={entry.data.text}
                  category={entry.data.category}
                  concernLevel={entry.data.concernLevel}
                  mediaUrl={entry.data.mediaUrl}
                  mediaType={entry.data.mediaType}
                  source={entry.data.source}
                  timestamp={entry.timestamp}
                  projections={entry.data.projections}
                  clarifyingQuestions={entry.data.clarifyingQuestions}
                />
              )
            }

            if (entry.type === 'milestone') {
              return (
                <div key={entry.id} className="bg-white rounded-2xl p-4 border border-green-200 border-l-4 border-l-green-400 shadow-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">🎉</span>
                    <span className="text-sm font-bold text-green-700">Milestone Achieved!</span>
                    <span className="flex-1" />
                    <span className="text-xs text-gray-400">{formatTime(entry.timestamp)}</span>
                  </div>
                  <p className="text-sm text-gray-800 font-medium">{entry.data.title}</p>
                  {entry.data.notes && (
                    <p className="text-xs text-gray-500 mt-1">{entry.data.notes}</p>
                  )}
                </div>
              )
            }

            if (entry.type === 'insight') {
              const insights = entry.data.insights || []
              const firstInsight = insights[0]
              if (!firstInsight) return null

              return (
                <div key={entry.id} className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-4 border border-blue-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{firstInsight.emoji || '💡'}</span>
                    <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Daily Insight</span>
                    <span className="flex-1" />
                    <span className="text-xs text-blue-400">{entry.data.date}</span>
                  </div>
                  <p className="text-sm font-semibold text-blue-800 mb-1">{firstInsight.title}</p>
                  <p className="text-xs text-gray-700 leading-relaxed">{firstInsight.body}</p>
                </div>
              )
            }

            if (entry.type === 'doctor_note') {
              return (
                <div key={entry.id} className="bg-white rounded-2xl p-4 border border-indigo-200 border-l-4 border-l-indigo-400 shadow-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">👨‍⚕️</span>
                    <span className="text-xs font-semibold text-indigo-600">Doctor's Note</span>
                    <span className="flex-1" />
                    <span className="text-xs text-gray-400">{formatTime(entry.timestamp)}</span>
                  </div>
                  <p className="text-sm text-gray-800 font-medium">{entry.data.conditionName}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Action: <span className="font-semibold capitalize">{entry.data.action?.replace(/_/g, ' ')}</span>
                  </p>
                  {entry.data.notes && (
                    <p className="text-xs text-gray-500 mt-1 italic">{entry.data.notes}</p>
                  )}
                </div>
              )
            }

            return null
          })}
        </div>
      )}

      {/* Loading more indicator */}
      {loadingMore && (
        <div className="flex justify-center py-4">
          <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Infinite scroll trigger */}
      <div ref={bottomRef} className="h-1" />

      {/* End of timeline */}
      {!hasMore && entries.length > 0 && (
        <div className="text-center py-4">
          <p className="text-xs text-gray-400">That's the full story so far</p>
        </div>
      )}
    </div>
  )
}

function formatTime(ts: string): string {
  if (!ts) return ''
  const date = new Date(ts)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays < 1) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}
