/**
 * DailyInsightCarousel — Horizontal swipeable carousel of insight cards
 *
 * The parent's morning briefing. Shows 1-3 personalized insight cards
 * that can be swiped horizontally. Dot indicators show position.
 */

import { useState, useEffect, useCallback } from 'react'
import DailyInsightCard from './DailyInsightCard'
import type { DailyInsight } from '@/lib/ai/daily-insights/types'

interface Props {
  childId: string
  token: string
  onAskDrSkids?: (question: string, context: string) => void
}

export default function DailyInsightCarousel({ childId, token, onAskDrSkids }: Props) {
  const [insights, setInsights] = useState<DailyInsight[]>([])
  const [loading, setLoading] = useState(true)
  const [activeIndex, setActiveIndex] = useState(0)

  const fetchInsights = useCallback(async () => {
    try {
      const res = await fetch(`/api/daily-insights?childId=${childId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setInsights(data.insights || [])
      }
    } catch {
      // Silent fail — insights are a nice-to-have
    } finally {
      setLoading(false)
    }
  }, [childId, token])

  useEffect(() => {
    fetchInsights()
  }, [fetchInsights])

  function handleScroll(e: React.UIEvent<HTMLDivElement>) {
    const el = e.currentTarget
    const scrollLeft = el.scrollLeft
    const cardWidth = 300 // min-w-[280px] + gap
    const index = Math.round(scrollLeft / cardWidth)
    setActiveIndex(Math.min(index, insights.length - 1))
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-5 border border-blue-100 animate-pulse">
        <div className="h-4 bg-blue-100 rounded w-32 mb-3" />
        <div className="h-3 bg-blue-100 rounded w-48 mb-2" />
        <div className="h-3 bg-blue-100 rounded w-40" />
      </div>
    )
  }

  if (insights.length === 0) return null

  // Single insight — no carousel needed
  if (insights.length === 1) {
    return (
      <div className="w-full">
        <div className="flex items-center gap-2 mb-2 px-1">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Today's Insight</span>
        </div>
        <DailyInsightCard insight={insights[0]} onAskDrSkids={onAskDrSkids} />
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2 px-1">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Today's Insights</span>
        <span className="text-xs text-gray-400">{insights.length} cards</span>
      </div>

      {/* Horizontal scroll container */}
      <div
        className="flex gap-3 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-2"
        onScroll={handleScroll}
      >
        {insights.map((insight) => (
          <DailyInsightCard
            key={insight.id}
            insight={insight}
            onAskDrSkids={onAskDrSkids}
          />
        ))}
      </div>

      {/* Dot indicators */}
      {insights.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-2">
          {insights.map((_, idx) => (
            <div
              key={idx}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                idx === activeIndex ? 'bg-green-600 w-4' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
