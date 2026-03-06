import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import MilestoneTracker from './MilestoneTracker'
import HabitsTracker from './HabitsTracker'
import GrowthTracker from './GrowthTracker'
import ObservationJournal from './ObservationJournal'
import RecordsTimeline from './RecordsTimeline'
import VaccinationTracker from './VaccinationTracker'
import SmartRecommendations from './SmartRecommendations'

interface Child {
  id: string
  name: string
  dob: string
  gender?: string
}

const TABS = [
  { key: 'milestones', label: 'Milestones', emoji: '🎯' },
  { key: 'habits', label: 'Habits', emoji: '✅' },
  { key: 'growth', label: 'Growth', emoji: '📏' },
  { key: 'notes', label: 'Notes', emoji: '📝' },
  { key: 'records', label: 'Records', emoji: '📋' },
] as const

type TabKey = typeof TABS[number]['key']

export default function ChildDashboard({ childId }: { childId: string }) {
  const { user, loading, token } = useAuth()
  const [child, setChild] = useState<Child | null>(null)
  const [activeTab, setActiveTab] = useState<TabKey>('milestones')
  const [loadingChild, setLoadingChild] = useState(true)

  const fetchChild = useCallback(async () => {
    if (!token) return
    try {
      const res = await fetch('/api/children', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        const found = (data.children || []).find((c: Child) => c.id === childId)
        setChild(found || null)
      }
    } catch {} finally {
      setLoadingChild(false)
    }
  }, [token, childId])

  useEffect(() => {
    if (token) fetchChild()
  }, [token, fetchChild])

  function getAgeMonths(dob: string): number {
    const birth = new Date(dob)
    const now = new Date()
    return (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth())
  }

  function getAgeLabel(dob: string): string {
    const months = getAgeMonths(dob)
    if (months < 1) return 'Newborn'
    if (months < 12) return `${months} months`
    const years = Math.floor(months / 12)
    const rem = months % 12
    return rem > 0 ? `${years}y ${rem}mo` : `${years} years`
  }

  if (loading || loadingChild) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        <div className="bg-white rounded-2xl p-6 animate-pulse h-24" />
        <div className="bg-white rounded-2xl p-6 animate-pulse h-12" />
        <div className="bg-white rounded-2xl p-6 animate-pulse h-64" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-500">Please sign in to view this dashboard.</p>
        <a href="/login?redirect=/me" className="mt-4 inline-block px-6 py-2 rounded-xl bg-green-600 text-white text-sm font-semibold">
          Sign In
        </a>
      </div>
    )
  }

  if (!child) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-500">Child not found.</p>
        <a href="/me" className="mt-4 inline-block text-green-600 text-sm font-semibold">
          ← Back to Profile
        </a>
      </div>
    )
  }

  const ageMonths = getAgeMonths(child.dob)

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-12 space-y-4">
      {/* Child Header */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <a href="/me" className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </a>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center text-2xl">
            {child.gender === 'male' ? '👦' : child.gender === 'female' ? '👧' : '🧒'}
          </div>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-gray-900">{child.name}</h1>
            <p className="text-sm text-gray-500">{getAgeLabel(child.dob)}</p>
          </div>
        </div>
      </div>

      {/* Smart Recommendations */}
      <SmartRecommendations child={child} />

      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-xl p-1 border border-gray-100 shadow-sm">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-2 px-2 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === tab.key
                ? 'bg-green-50 text-green-700'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span className="block text-base">{tab.emoji}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'milestones' && token && (
        <MilestoneTracker childId={childId} ageMonths={ageMonths} token={token} />
      )}
      {activeTab === 'habits' && token && (
        <HabitsTracker childId={childId} token={token} />
      )}
      {activeTab === 'growth' && token && (
        <GrowthTracker childId={childId} token={token} />
      )}
      {activeTab === 'notes' && token && (
        <ObservationJournal childId={childId} token={token} />
      )}
      {activeTab === 'records' && token && (
        <>
          <VaccinationTracker childId={childId} token={token} />
          <RecordsTimeline childId={childId} token={token} />
        </>
      )}
    </div>
  )
}
