import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import {
  groupAndSortRecords,
  resolveInitialChild,
  SCREENING_TYPE_CONFIG,
  type ScreeningImportRecord,
  type ScreeningGroup,
} from '@/lib/phr/screening-utils'
import ScreeningCard from './ScreeningCard'

interface Child {
  id: string
  name: string
}

interface ScreeningResultsViewProps {
  initialChildId?: string
  initialScreeningId?: string
}

export default function ScreeningResultsView({ initialChildId, initialScreeningId }: ScreeningResultsViewProps) {
  const { token } = useAuth()
  const [children, setChildren] = useState<Child[]>([])
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null)
  const [groups, setGroups] = useState<ScreeningGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryKey, setRetryKey] = useState(0)
  const scrollTargetRef = useRef<HTMLDivElement | null>(null)

  // Load children list
  useEffect(() => {
    if (!token) return
    fetch('/api/children', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json() as Promise<{ children?: Child[] }>)
      .then((data) => {
        const list = data.children ?? []
        setChildren(list)
        if (list.length > 0) {
          const initial = resolveInitialChild(list, initialChildId ?? null)
          setSelectedChildId(initial.id)
        }
      })
      .catch(() => setError('Failed to load children'))
  }, [token, initialChildId])

  // Load screening results for selected child
  useEffect(() => {
    if (!token || !selectedChildId) return
    setLoading(true)
    setError(null)
    fetch(`/api/screening-results?childId=${selectedChildId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json() as Promise<{ records: ScreeningImportRecord[] }>
      })
      .then((data) => {
        setGroups(groupAndSortRecords(data.records ?? []))
      })
      .catch(() => setError('Failed to load screening results'))
      .finally(() => setLoading(false))
  }, [token, selectedChildId, retryKey])

  // Deep-link scroll
  useEffect(() => {
    if (!initialScreeningId || loading) return
    const el = document.getElementById(`screening-${initialScreeningId}`)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [initialScreeningId, loading])

  const selectedChild = children.find((c) => c.id === selectedChildId)

  return (
    <div className="space-y-6">
      {/* Child selector — hidden for single child */}
      {children.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {children.map((child) => (
            <button
              key={child.id}
              onClick={() => setSelectedChildId(child.id)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                child.id === selectedChildId
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {child.name}
            </button>
          ))}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-100 rounded-xl h-32 animate-pulse" />
          ))}
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-sm mb-4">{error}</p>
          <button
            onClick={() => setRetryKey((k) => k + 1)}
            className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && groups.length === 0 && (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">📋</div>
          <h3 className="text-base font-semibold text-gray-900">No screening results yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            {selectedChild ? `${selectedChild.name}'s` : 'Your child\'s'} screening results will appear here after a SKIDS clinic visit.
          </p>
        </div>
      )}

      {/* Results grouped by type */}
      {!loading && !error && groups.map((group) => {
        const cfg = SCREENING_TYPE_CONFIG[group.type]
        return (
          <section key={group.type}>
            <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <span>{cfg.emoji}</span>
              <span>{cfg.label}</span>
            </h2>
            <div className="space-y-3">
              {group.records.map((record) => (
                <div key={record.id} id={`screening-${record.id}`}>
                  <ScreeningCard record={record} childName={selectedChild?.name ?? ''} />
                </div>
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
