/**
 * ChildDashboard — Morning-First Layout
 *
 * The parent's entire day IS the product.
 *
 * Layout:
 * 1. Child header (name, age, health score)
 * 2. Daily Insight Carousel (morning briefing)
 * 3. Quick Capture Bar (2-tap observation)
 * 4. Smart Nudge Strip (proactive alerts)
 * 5. Life Record Timeline (Instagram-like feed)
 * 6. More section (existing tabs as tiles)
 */

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import DailyInsightCarousel from './DailyInsightCarousel'
import QuickCaptureBar from './QuickCaptureBar'
import NudgeStrip from './NudgeStrip'
import LifeRecordTimeline from './LifeRecordTimeline'
import MilestoneTracker from './MilestoneTracker'
import HabitsTracker from './HabitsTracker'
import GrowthTracker from './GrowthTracker'
import GrowthChart from './GrowthChart'
import ObservationJournal from './ObservationJournal'
import VaccinationTracker from './VaccinationTracker'
import RecordsTimeline from './RecordsTimeline'
import SmartRecommendations from './SmartRecommendations'
import HealthScoreGauge from './HealthScoreGauge'
import PhrPdfExport from './PhrPdfExport'
import ScreeningTab from '../screening/ScreeningTab'
import LHRSummary from './LHRSummary'

interface Child {
  id: string
  name: string
  dob: string
  gender?: string
  v3_child_id?: string
  v3_campaign_code?: string
}

const MORE_TILES = [
  { key: 'milestones', label: 'Milestones', emoji: '🎯' },
  { key: 'habits', label: 'Habits', emoji: '✅' },
  { key: 'growth', label: 'Growth', emoji: '📏' },
  { key: 'screening', label: 'Screening', emoji: '🩺' },
  { key: 'records', label: 'Records', emoji: '📋' },
] as const

type ExpandedSection = typeof MORE_TILES[number]['key'] | null

export default function ChildDashboard({ childId }: { childId: string }) {
  const { user, loading, token } = useAuth()
  const [child, setChild] = useState<Child | null>(null)
  const [loadingChild, setLoadingChild] = useState(true)
  const [features, setFeatures] = useState<string[]>([])
  const [expandedSection, setExpandedSection] = useState<ExpandedSection>(null)
  const [timelineKey, setTimelineKey] = useState(0)

  const fetchChild = useCallback(async () => {
    if (!token) return
    try {
      const res = await fetch(`/api/children/${childId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json() as { child?: Child; children?: Child[] }
        const found = data.child || (data.children || []).find((c) => c.id === childId) || null
        setChild(found)
      }
    } catch {} finally {
      setLoadingChild(false)
    }
  }, [token, childId])

  useEffect(() => {
    setChild(null)
    setLoadingChild(true)
    if (token) fetchChild()
  }, [token, fetchChild])

  useEffect(() => {
    if (!token) return
    fetch('/api/subscriptions/me', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d) setFeatures((d as { features: string[] }).features ?? []) })
      .catch(() => {})
  }, [token])

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

  function handleObservationSaved() {
    setTimelineKey(prev => prev + 1)
  }

  function handleNudgeAction(actionType: string, actionData?: string) {
    if (actionType === 'view_milestone') {
      setExpandedSection('milestones')
    } else if (actionType === 'view_vaccination') {
      setExpandedSection('records')
    } else if (actionType === 'open_chat' && actionData) {
      window.dispatchEvent(new CustomEvent('open-dr-skids', {
        detail: { question: actionData },
      }))
    }
  }

  if (loading || loadingChild) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        <div className="bg-white rounded-2xl p-6 animate-pulse h-24" />
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-5 animate-pulse h-32" />
        <div className="bg-white rounded-2xl p-6 animate-pulse h-36" />
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
      {/* ─── Child Header ─── */}
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
          <a
            href="/settings"
            className="p-2 rounded-lg hover:bg-gray-50 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </a>
        </div>
        {token && <HealthScoreGauge childId={childId} token={token} features={features} />}
        {token && (
          <div className="mt-3">
            <PhrPdfExport child={child} token={token} features={features} />
          </div>
        )}
      </div>

      {/* ─── 1. Daily Insight Carousel (Morning Briefing) ─── */}
      {token && (
        <DailyInsightCarousel
          childId={childId}
          token={token}
        />
      )}

      {/* ─── 2. Quick Capture Bar (2-tap observation) ─── */}
      {token && (
        <QuickCaptureBar
          childId={childId}
          childName={child.name}
          token={token}
          onObservationSaved={handleObservationSaved}
        />
      )}

      {/* ─── 3. Smart Nudge Strip ─── */}
      {token && (
        <NudgeStrip
          childId={childId}
          token={token}
          onAction={handleNudgeAction}
        />
      )}

      {/* ─── 4. Life Record Timeline ─── */}
      {token && (
        <div>
          <div className="flex items-center gap-2 mb-2 px-1">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              📱 {child.name}'s Story
            </span>
          </div>
          <LifeRecordTimeline
            key={timelineKey}
            childId={childId}
            token={token}
          />
        </div>
      )}

      {/* ─── 5. More Section (existing tabs as tiles) ─── */}
      <div>
        <div className="flex items-center gap-2 mb-2 px-1">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">More</span>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {MORE_TILES.map((tile) => (
            <button
              key={tile.key}
              onClick={() => setExpandedSection(expandedSection === tile.key ? null : tile.key)}
              className={`flex flex-col items-center gap-1 py-3 rounded-xl border transition-all ${
                expandedSection === tile.key
                  ? 'bg-green-50 border-green-200 text-green-700'
                  : 'bg-white border-gray-100 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="text-xl">{tile.emoji}</span>
              <span className="text-[10px] font-medium">{tile.label}</span>
            </button>
          ))}
        </div>

        {/* Expanded section */}
        {expandedSection && token && (
          <div className="mt-3">
            {expandedSection === 'milestones' && (
              <MilestoneTracker childId={childId} ageMonths={ageMonths} token={token} />
            )}
            {expandedSection === 'habits' && (
              <HabitsTracker childId={childId} token={token} />
            )}
            {expandedSection === 'growth' && (
              <>
                <GrowthChart
                  childId={childId}
                  childName={child.name}
                  dob={child.dob}
                  sex={child.gender === 'male' || child.gender === 'female' ? child.gender : null}
                  token={token}
                />
                <div className="mt-3">
                  <GrowthTracker childId={childId} token={token} />
                </div>
              </>
            )}
            {expandedSection === 'screening' && (
              <ScreeningTab childId={childId} token={token} v3ChildId={child.v3_child_id} />
            )}
            {expandedSection === 'records' && (
              <>
                <VaccinationTracker childId={childId} token={token} />
                <div className="mt-3">
                  <RecordsTimeline childId={childId} token={token} />
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* ─── LHR Summary (collapsed at bottom) ─── */}
      {token && (
        <details className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <summary className="px-4 py-3 cursor-pointer text-sm font-semibold text-gray-600 hover:text-gray-800">
            📊 Life Record Summary
          </summary>
          <div className="px-4 pb-4">
            <LHRSummary
              childId={childId}
              childName={child.name}
              childDob={child.dob}
              token={token}
              v3ChildId={child.v3_child_id}
            />
          </div>
        </details>
      )}

      {/* Dr. SKIDS FAB — mobile only */}
      <button
        onClick={() => window.dispatchEvent(new CustomEvent('open-dr-skids', { detail: { childId } }))}
        className="fixed bottom-20 right-4 z-40 md:hidden flex items-center gap-2 px-4 py-2.5 rounded-full bg-green-600 text-white text-sm font-semibold shadow-lg shadow-green-500/30 hover:bg-green-700 transition-colors"
        aria-label="Ask Dr. SKIDS"
      >
        <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">S</span>
        Ask Dr. SKIDS
      </button>
    </div>
  )
}
