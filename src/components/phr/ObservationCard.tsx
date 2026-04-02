/**
 * ObservationCard — Individual timeline card
 *
 * Instagram-like card for a single observation. Shows:
 * - Domain icon + timestamp
 * - Observation text
 * - Media thumbnail (photo/video)
 * - AI projection summary (tap to expand)
 * - Concern level indicator
 * - Source badge (active vs passive)
 */

import { useState } from 'react'

interface Projection {
  conditionName: string
  probability: number
  urgency: string
  mustNotMiss: boolean
  explanation: string
}

interface Props {
  id: string
  text: string
  category?: string
  concernLevel?: string
  mediaUrl?: string
  mediaType?: 'photo' | 'video'
  source?: 'active' | 'passive' | 'chat'
  timestamp: string
  projections?: Projection[]
  clarifyingQuestions?: string[]
}

const DOMAIN_EMOJI: Record<string, string> = {
  Development: '🎯', Health: '🌡', Behavior: '😊', Eating: '🍽',
  General: '✨', Sleep: '😴', motor: '🏃', language: '🗣',
  vision: '👁', skin: '🩹', behavioral: '😊', emotional: '💙',
}

const DOMAIN_COLORS: Record<string, string> = {
  Development: 'border-l-blue-400', Health: 'border-l-red-400',
  Behavior: 'border-l-pink-400', Eating: 'border-l-orange-400',
  General: 'border-l-gray-400', Sleep: 'border-l-indigo-400',
}

const CONCERN_BADGES: Record<string, { bg: string; text: string; label: string }> = {
  none: { bg: 'bg-green-50', text: 'text-green-700', label: 'Normal' },
  mild: { bg: 'bg-yellow-50', text: 'text-yellow-700', label: 'Mild' },
  moderate: { bg: 'bg-orange-50', text: 'text-orange-700', label: 'Moderate' },
  serious: { bg: 'bg-red-50', text: 'text-red-700', label: 'Serious' },
}

export default function ObservationCard({
  text, category, concernLevel, mediaUrl, mediaType,
  source, timestamp, projections, clarifyingQuestions,
}: Props) {
  const [expanded, setExpanded] = useState(false)

  const emoji = DOMAIN_EMOJI[category || ''] || '📝'
  const borderColor = DOMAIN_COLORS[category || ''] || 'border-l-gray-300'
  const concern = CONCERN_BADGES[concernLevel || 'none'] || CONCERN_BADGES.none
  const hasMustNotMiss = projections?.some(p => p.mustNotMiss)

  function formatTime(ts: string): string {
    const date = new Date(ts)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffHours < 1) return 'Just now'
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
  }

  return (
    <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden border-l-4 ${borderColor} ${
      hasMustNotMiss ? 'ring-2 ring-amber-200' : ''
    }`}>
      {/* Header */}
      <div className="px-4 pt-3 pb-1 flex items-center gap-2">
        <span className="text-lg">{emoji}</span>
        <span className="text-xs font-semibold text-gray-500">{category || 'Observation'}</span>
        {source === 'passive' && (
          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-purple-50 text-purple-600 font-medium">from chat</span>
        )}
        <span className="flex-1" />
        <span className="text-xs text-gray-400">{formatTime(timestamp)}</span>
      </div>

      {/* Observation text */}
      <div className="px-4 py-2">
        <p className="text-sm text-gray-800 leading-relaxed">{text}</p>
      </div>

      {/* Media */}
      {mediaUrl && (
        <div className="px-4 pb-2">
          {mediaType === 'video' ? (
            <video
              src={mediaUrl}
              controls
              className="w-full h-40 object-cover rounded-xl bg-gray-100"
            />
          ) : (
            <img
              src={mediaUrl}
              alt="Observation"
              className="w-full h-40 object-cover rounded-xl bg-gray-100"
            />
          )}
        </div>
      )}

      {/* Concern badge */}
      {concernLevel && concernLevel !== 'none' && (
        <div className="px-4 pb-2">
          <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full ${concern.bg} ${concern.text}`}>
            {concern.label} concern
          </span>
        </div>
      )}

      {/* Must-not-miss indicator */}
      {hasMustNotMiss && (
        <div className="mx-4 mb-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200">
          <p className="text-xs font-semibold text-amber-700">⚠️ Important — discuss with your pediatrician</p>
        </div>
      )}

      {/* AI Projection summary (tap to expand) */}
      {projections && projections.length > 0 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full px-4 py-2.5 bg-green-50/50 border-t border-green-100 text-left hover:bg-green-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-[9px] flex-shrink-0">
              S
            </div>
            <p className="text-xs text-gray-600 leading-relaxed flex-1">
              {expanded
                ? projections[0].explanation
                : `💡 ${projections[0].explanation?.substring(0, 80)}${projections[0].explanation?.length > 80 ? '...' : ''}`
              }
            </p>
            <svg className={`w-3.5 h-3.5 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          {expanded && (
            <div className="mt-2 pl-7 space-y-1.5">
              {projections.slice(0, 3).map((p, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    p.urgency === 'urgent' || p.urgency === 'emergency' ? 'bg-red-500' :
                    p.urgency === 'soon' ? 'bg-amber-500' : 'bg-green-500'
                  }`} />
                  <span className="text-gray-700">{p.conditionName}</span>
                  {p.mustNotMiss && <span className="text-[9px] text-amber-600 font-bold">MUST CHECK</span>}
                </div>
              ))}

              {clarifyingQuestions && clarifyingQuestions.length > 0 && (
                <div className="mt-2 pt-2 border-t border-green-100">
                  <p className="text-[10px] font-semibold text-green-700 mb-1">Dr. SKIDS wants to know:</p>
                  {clarifyingQuestions.slice(0, 2).map((q, i) => (
                    <p key={i} className="text-xs text-gray-600 leading-relaxed">• {q}</p>
                  ))}
                </div>
              )}
            </div>
          )}
        </button>
      )}
    </div>
  )
}
