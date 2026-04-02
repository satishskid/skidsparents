/**
 * GrowthTrackCard — Shows active developmental guidance for child's age.
 *
 * Always visible in ChildDashboard (every child gets growth tracks).
 * Shows current domain focus with "what to expect" + key tips.
 * Tap to expand guidance. "Ask Growth Coach" for deeper questions.
 */

import { useState, useEffect, useCallback } from 'react'

interface GrowthTrack {
  id: string
  domain: string
  title: string
  what_to_expect: string
  parent_guidance_json: any
  coaching_playbook_json: any
  parental_coping_json: any
}

const DOMAIN_EMOJI: Record<string, string> = {
  emotional: '💛',
  behavioral: '🧠',
  nutrition_habits: '🥗',
  physical_activity: '🏃',
  sleep_hygiene: '😴',
  social: '🤝',
  digital_wellness: '📱',
  parental_coping: '🫂',
}

const DOMAIN_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  emotional: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700' },
  behavioral: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700' },
  nutrition_habits: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700' },
  physical_activity: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
  sleep_hygiene: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700' },
  social: { bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-700' },
  digital_wellness: { bg: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-700' },
  parental_coping: { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700' },
}

const DOMAIN_LABELS: Record<string, string> = {
  emotional: 'Emotional Growth',
  behavioral: 'Behavioral Development',
  nutrition_habits: 'Healthy Eating',
  physical_activity: 'Physical Activity',
  sleep_hygiene: 'Sleep & Rest',
  social: 'Social Skills',
  digital_wellness: 'Digital Wellness',
  parental_coping: 'Parent Wellbeing',
}

export default function GrowthTrackCard({
  childId,
  token,
}: {
  childId: string
  token: string
}) {
  const [tracks, setTracks] = useState<GrowthTrack[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTrackIndex, setActiveTrackIndex] = useState(0)
  const [expanded, setExpanded] = useState(false)

  const fetchTracks = useCallback(async () => {
    try {
      const res = await fetch(`/api/growth-tracks/active?childId=${childId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setTracks(data.tracks || [])
      }
    } catch {} finally {
      setLoading(false)
    }
  }, [childId, token])

  useEffect(() => { fetchTracks() }, [fetchTracks])

  if (loading) {
    return <div className="bg-gradient-to-br from-amber-50 to-purple-50 rounded-2xl p-4 animate-pulse h-28" />
  }

  if (tracks.length === 0) return null

  const track = tracks[activeTrackIndex]
  if (!track) return null

  const colors = DOMAIN_COLORS[track.domain] || DOMAIN_COLORS.emotional
  const guidance = track.parent_guidance_json || {}
  const coping = track.parental_coping_json || {}

  function openGrowthCoach(question?: string) {
    window.dispatchEvent(new CustomEvent('open-growth-coach', {
      detail: { childId, trackDomain: track.domain, question },
    }))
  }

  return (
    <div className={`${colors.bg} rounded-2xl border ${colors.border} overflow-hidden`}>
      {/* Domain tabs */}
      <div className="flex overflow-x-auto gap-1 px-3 pt-3 pb-1 no-scrollbar">
        {tracks.map((t, i) => (
          <button
            key={t.id}
            onClick={() => { setActiveTrackIndex(i); setExpanded(false) }}
            className={`flex-none px-2.5 py-1 rounded-full text-[10px] font-medium transition-all ${
              i === activeTrackIndex
                ? `${colors.text} bg-white shadow-sm`
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {DOMAIN_EMOJI[t.domain]} {DOMAIN_LABELS[t.domain] || t.domain}
          </button>
        ))}
      </div>

      {/* Track content */}
      <div className="px-4 pb-3 pt-2">
        <h3 className={`text-sm font-bold ${colors.text}`}>{track.title}</h3>
        <p className="text-xs text-gray-600 mt-1 leading-relaxed">{track.what_to_expect}</p>

        {/* Key message */}
        {guidance.keyMessage && (
          <div className="mt-2 px-3 py-2 bg-white/60 rounded-xl">
            <p className="text-xs font-medium text-gray-700 italic">
              "{guidance.keyMessage}"
            </p>
          </div>
        )}

        {/* Expanded content */}
        {expanded && (
          <div className="mt-3 space-y-3">
            {/* Daily tips */}
            {guidance.dailyTips?.length > 0 && (
              <div>
                <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Daily Tips</h4>
                <ul className="space-y-1">
                  {guidance.dailyTips.map((tip: string, i: number) => (
                    <li key={i} className="text-xs text-gray-600 flex gap-1.5">
                      <span className="text-green-500 mt-0.5">+</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Do / Don't */}
            <div className="grid grid-cols-2 gap-2">
              {guidance.doList?.length > 0 && (
                <div className="bg-green-50/50 rounded-lg p-2">
                  <h4 className="text-[10px] font-semibold text-green-600 mb-1">Do</h4>
                  {guidance.doList.map((item: string, i: number) => (
                    <p key={i} className="text-[10px] text-gray-600">+ {item}</p>
                  ))}
                </div>
              )}
              {guidance.dontList?.length > 0 && (
                <div className="bg-red-50/50 rounded-lg p-2">
                  <h4 className="text-[10px] font-semibold text-red-500 mb-1">Don't</h4>
                  {guidance.dontList.map((item: string, i: number) => (
                    <p key={i} className="text-[10px] text-gray-600">- {item}</p>
                  ))}
                </div>
              )}
            </div>

            {/* Parental coping */}
            {coping.normalizations?.length > 0 && (
              <div className="bg-rose-50/50 rounded-lg p-2">
                <h4 className="text-[10px] font-semibold text-rose-600 mb-1">For You, Parent</h4>
                {coping.normalizations.slice(0, 2).map((norm: string, i: number) => (
                  <p key={i} className="text-[10px] text-gray-600 italic">{norm}</p>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 mt-3">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-[10px] font-medium text-gray-500 hover:text-gray-700"
          >
            {expanded ? 'Show less' : 'Show more'}
          </button>
          <div className="flex-1" />
          <button
            onClick={() => openGrowthCoach()}
            className={`px-3 py-1.5 rounded-full text-[10px] font-semibold ${colors.text} bg-white shadow-sm hover:shadow transition-shadow`}
          >
            Ask Growth Coach
          </button>
        </div>
      </div>
    </div>
  )
}
