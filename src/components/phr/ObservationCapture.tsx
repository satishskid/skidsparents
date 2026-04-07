/**
 * ObservationCapture — Progressive disclosure observation input
 *
 * The parent's primary interaction with SKIDS.
 *
 * Flow:
 * 1. INVITE: "How is [child] today?" — warm, open textarea
 * 2. GUIDED: After text, system may ask 1-2 clarifying questions
 * 3. PROCESSING: Empathetic "thinking" state (never "analyzing")
 * 4. RESULT: Warm summary + care pathway + next steps
 *
 * Design rules (from Interaction Design Policy):
 * - Observation-first: never ask "what diagnosis?" — ask "what did you notice?"
 * - Condition-agnostic: system educates about signs, never names conditions
 * - Progressive disclosure: simple first, detail on request
 * - Safety structural: red-flag gates are hard stops, not suggestions
 * - Always end with an action: activities, watch-for, or care pathway
 */

import { useState, useRef, useEffect, useCallback } from 'react'

interface Props {
  childId: string
  childName: string
  token: string
  onComplete?: () => void
}

interface CareResult {
  episodeId: string
  parentSummary: string
  parentGuidance: {
    activities?: string[]
    watchFor?: string[]
    escalateIf?: string[]
  }
  pathway: string
  pedAlertLevel: string
}

type Phase = 'invite' | 'writing' | 'guided' | 'submitting' | 'result'

const SAMPLE_PROMPTS = [
  "noticed something about sleep",
  "eating less than usual",
  "not babbling yet",
  "seems fussy today",
  "had a rash this morning",
  "walking seems unsteady",
]

const PATHWAY_MESSAGES: Record<string, { icon: string; text: string; detail: string }> = {
  '1_observe': {
    icon: '\uD83C\uDFE0',
    text: 'Keep watching at home',
    detail: 'This looks like something to monitor. We\'ll check in with you.',
  },
  '3_econsult': {
    icon: '\uD83D\uDC68\u200D\u2695\uFE0F',
    text: 'Your doctor will review this',
    detail: 'We\'ve shared this with your pediatrician. They\'ll get back to you.',
  },
  '4_tele': {
    icon: '\uD83D\uDCF1',
    text: 'A video consultation is recommended',
    detail: 'Your pediatrician should see this soon. We\'ll help you connect.',
  },
  '5_inperson': {
    icon: '\uD83C\uDFE5',
    text: 'Please visit your pediatrician',
    detail: 'This needs an in-person evaluation. Please schedule a visit.',
  },
}

export default function ObservationCapture({ childId, childName, token, onComplete }: Props) {
  const [phase, setPhase] = useState<Phase>('invite')
  const [text, setText] = useState('')
  const [result, setResult] = useState<CareResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [sampleIndex, setSampleIndex] = useState(0)

  // Rotate sample prompts
  useEffect(() => {
    const interval = setInterval(() => {
      setSampleIndex(i => (i + 1) % SAMPLE_PROMPTS.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  // Auto-resize textarea
  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value)
    if (phase === 'invite' && e.target.value.length > 0) {
      setPhase('writing')
    }
    if (e.target.value.length === 0) {
      setPhase('invite')
    }
    // Auto-resize
    const ta = e.target
    ta.style.height = 'auto'
    ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`
  }, [phase])

  async function handleSubmit() {
    if (!text.trim()) return
    setPhase('submitting')
    setError(null)

    try {
      const res = await fetch('/api/care/episodes', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          childId,
          observationText: text.trim(),
        }),
      })

      if (res.ok) {
        const data = await res.json() as CareResult
        setResult(data)
        setPhase('result')
        onComplete?.()
      } else {
        const errData = await res.json().catch(() => ({})) as { error?: string }
        setError(errData.error || 'Something went wrong. Please try again.')
        setPhase('writing')
      }
    } catch {
      setError('Unable to connect. Please check your internet and try again.')
      setPhase('writing')
    }
  }

  function handleReset() {
    setPhase('invite')
    setText('')
    setResult(null)
    setError(null)
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  // ── PHASE: INVITE & WRITING ──
  if (phase === 'invite' || phase === 'writing') {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Header prompt */}
        <div className="px-4 pt-4 pb-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              S
            </div>
            <p className="text-sm text-gray-700">
              How is <span className="font-semibold">{childName}</span> today?
            </p>
          </div>
        </div>

        {/* Input area */}
        <div className="px-4 pb-3">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleTextChange}
            placeholder={SAMPLE_PROMPTS[sampleIndex]}
            rows={2}
            className="w-full px-0 py-2 text-sm text-gray-800 placeholder-gray-300 resize-none focus:outline-none leading-relaxed border-none"
            style={{ minHeight: '52px' }}
          />

          {/* Error message */}
          {error && (
            <p className="text-xs text-red-500 mb-2">{error}</p>
          )}
        </div>

        {/* Action row */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-50 bg-gray-50/50">
          <div className="flex items-center gap-1">
            {/* Future: photo, voice, etc. */}
            <button
              className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-white transition-colors"
              title="Add photo"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
              </svg>
            </button>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!text.trim()}
            className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
              text.trim()
                ? 'bg-green-600 text-white hover:bg-green-700 shadow-sm shadow-green-500/20 active:scale-[0.97]'
                : 'bg-gray-100 text-gray-300 cursor-not-allowed'
            }`}
          >
            Share
          </button>
        </div>
      </div>
    )
  }

  // ── PHASE: SUBMITTING ──
  if (phase === 'submitting') {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            S
          </div>
          <div className="flex-1">
            {/* What they said */}
            <p className="text-sm text-gray-600 italic mb-4 line-clamp-2">"{text}"</p>

            {/* Thinking animation */}
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-green-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-green-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <p className="text-sm text-gray-500">
                Looking at {childName}'s record...
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── PHASE: RESULT ──
  if (phase === 'result' && result) {
    const pathwayInfo = PATHWAY_MESSAGES[result.pathway] || PATHWAY_MESSAGES['1_observe']

    return (
      <div className="space-y-3">
        {/* Summary card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              S
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-800 leading-relaxed">
                {result.parentSummary}
              </p>
            </div>
          </div>

          {/* Pathway indicator */}
          <div className={`rounded-xl p-3.5 ${
            result.pedAlertLevel === 'emergency' ? 'bg-red-50 border border-red-200' :
            result.pedAlertLevel === 'urgent' ? 'bg-orange-50 border border-orange-200' :
            result.pathway === '1_observe' ? 'bg-green-50 border border-green-100' :
            'bg-blue-50 border border-blue-100'
          }`}>
            <div className="flex items-center gap-2.5">
              <span className="text-xl">{pathwayInfo.icon}</span>
              <div>
                <p className={`text-sm font-semibold ${
                  result.pedAlertLevel === 'emergency' ? 'text-red-800' :
                  result.pedAlertLevel === 'urgent' ? 'text-orange-800' :
                  'text-gray-800'
                }`}>
                  {pathwayInfo.text}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{pathwayInfo.detail}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action cards — activities, watch-for */}
        {result.parentGuidance?.activities && result.parentGuidance.activities.length > 0 && (
          <div className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-100">
            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-2">
              What you can do
            </p>
            <ul className="space-y-1.5">
              {result.parentGuidance.activities.map((activity, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-emerald-500 mt-0.5 flex-shrink-0">&bull;</span>
                  <span>{activity}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {result.parentGuidance?.watchFor && result.parentGuidance.watchFor.length > 0 && (
          <div className="bg-amber-50/50 rounded-2xl p-4 border border-amber-100">
            <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-2">
              Keep an eye on
            </p>
            <ul className="space-y-1.5">
              {result.parentGuidance.watchFor.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-amber-500 mt-0.5 flex-shrink-0">&bull;</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {result.parentGuidance?.escalateIf && result.parentGuidance.escalateIf.length > 0 && (
          <div className="bg-red-50/50 rounded-2xl p-4 border border-red-200">
            <p className="text-xs font-semibold text-red-600 uppercase tracking-wider mb-2">
              Visit your doctor if
            </p>
            <ul className="space-y-1.5">
              {result.parentGuidance.escalateIf.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-red-500 mt-0.5 flex-shrink-0">&bull;</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* New observation */}
        <button
          onClick={handleReset}
          className="w-full py-3 rounded-xl bg-white border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all"
        >
          Share something else
        </button>
      </div>
    )
  }

  return null
}
