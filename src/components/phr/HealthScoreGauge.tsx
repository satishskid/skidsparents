import { useState, useEffect } from 'react'
import { getScoreColor } from '@/lib/phr/health-score'

interface Props {
  childId: string
  token: string
}

interface HealthScoreData {
  score: number
  trend: 'up' | 'down' | 'flat'
  components: Record<string, number>
}

const RADIUS = 40
const STROKE_WIDTH = 8
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

const COLOR_MAP = {
  red: 'stroke-red-500',
  amber: 'stroke-amber-400',
  green: 'stroke-green-500',
}

const TREND_ICON = {
  up: { symbol: '↑', className: 'text-green-600' },
  down: { symbol: '↓', className: 'text-red-500' },
  flat: { symbol: '→', className: 'text-gray-400' },
}

export default function HealthScoreGauge({ childId, token }: Props) {
  const [data, setData] = useState<HealthScoreData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetch(`/api/children/${childId}/health-score`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => { if (!cancelled) setData(d as HealthScoreData) })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [childId, token])

  if (loading) {
    return (
      <div className="flex items-center gap-3 mt-3">
        <div className="w-16 h-16 rounded-full bg-gray-100 animate-pulse" />
        <div className="space-y-1.5">
          <div className="h-3 w-20 bg-gray-100 rounded animate-pulse" />
          <div className="h-2 w-14 bg-gray-100 rounded animate-pulse" />
        </div>
      </div>
    )
  }

  if (!data) return null

  const color = getScoreColor(data.score)
  const strokeClass = COLOR_MAP[color]
  const dashOffset = CIRCUMFERENCE * (1 - data.score / 100)
  const trend = TREND_ICON[data.trend]

  return (
    <div className="flex items-center gap-3 mt-3">
      <div className="relative w-16 h-16 flex-shrink-0">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          {/* Track */}
          <circle
            cx="50" cy="50" r={RADIUS}
            fill="none"
            stroke="currentColor"
            strokeWidth={STROKE_WIDTH}
            className="text-gray-100"
          />
          {/* Progress */}
          <circle
            cx="50" cy="50" r={RADIUS}
            fill="none"
            strokeWidth={STROKE_WIDTH}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            className={strokeClass}
            style={{ transition: 'stroke-dashoffset 0.6s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold text-gray-800">{data.score}</span>
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Health Score</p>
        <p className={`text-lg font-bold ${trend.className}`}>
          {trend.symbol} {data.trend === 'up' ? 'Improving' : data.trend === 'down' ? 'Declining' : 'Stable'}
        </p>
      </div>
    </div>
  )
}
