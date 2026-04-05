/**
 * DailyInsightCard — Instagram-story-style insight card
 *
 * Each card is a personalized insight generated from the child's life record.
 * Gradient background by type, warm text, "Ask SKIDS Guide" button that
 * opens chat pre-seeded with the deepQueryPrompt.
 */

import type { DailyInsight } from '@/lib/ai/daily-insights/types'

const TYPE_STYLES: Record<string, { bg: string; border: string; text: string }> = {
  milestone_watch: { bg: 'bg-gradient-to-br from-amber-50 to-orange-50', border: 'border-amber-200', text: 'text-amber-800' },
  observation_gap: { bg: 'bg-gradient-to-br from-purple-50 to-indigo-50', border: 'border-purple-200', text: 'text-purple-800' },
  pattern_alert: { bg: 'bg-gradient-to-br from-orange-50 to-red-50', border: 'border-orange-200', text: 'text-orange-800' },
  celebration: { bg: 'bg-gradient-to-br from-green-50 to-emerald-50', border: 'border-green-200', text: 'text-green-800' },
  age_insight: { bg: 'bg-gradient-to-br from-blue-50 to-cyan-50', border: 'border-blue-200', text: 'text-blue-800' },
  screening_due: { bg: 'bg-gradient-to-br from-teal-50 to-cyan-50', border: 'border-teal-200', text: 'text-teal-800' },
  growth_update: { bg: 'bg-gradient-to-br from-indigo-50 to-blue-50', border: 'border-indigo-200', text: 'text-indigo-800' },
}

interface Props {
  insight: DailyInsight
  onAskDrSkids?: (question: string, context: string) => void
}

export default function DailyInsightCard({ insight, onAskDrSkids }: Props) {
  const style = TYPE_STYLES[insight.type] || TYPE_STYLES.age_insight

  function handleAsk() {
    if (onAskDrSkids) {
      onAskDrSkids(insight.deepQueryPrompt, insight.body)
    } else {
      // Fallback: dispatch custom event to open ChatWidget
      window.dispatchEvent(new CustomEvent('open-dr-skids', {
        detail: { question: insight.deepQueryPrompt },
      }))
    }
  }

  return (
    <div className={`${style.bg} rounded-2xl p-5 border ${style.border} shadow-sm min-w-[280px] max-w-[320px] snap-center flex flex-col`}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl">{insight.emoji}</span>
        <span className={`text-xs font-semibold uppercase tracking-wider ${style.text} opacity-70`}>
          {insight.type.replace(/_/g, ' ')}
        </span>
      </div>

      {/* Title */}
      <h3 className={`text-base font-bold ${style.text} mb-2 leading-tight`}>
        {insight.title}
      </h3>

      {/* Body */}
      <p className="text-sm text-gray-700 leading-relaxed flex-1 mb-4">
        {insight.body}
      </p>

      {/* Ask SKIDS Guide button */}
      <button
        onClick={handleAsk}
        className="w-full py-2.5 px-4 rounded-xl bg-white/80 hover:bg-white border border-gray-200 text-sm font-semibold text-green-700 transition-all hover:shadow-sm active:scale-[0.98]"
      >
        Ask SKIDS Guide →
      </button>
    </div>
  )
}
