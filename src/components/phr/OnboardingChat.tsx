/**
 * OnboardingChat — WhatsApp-style conversational onboarding
 *
 * Full-screen chat interface that walks parents through
 * the life record onboarding from birth to present age.
 *
 * Features:
 * - Chat bubbles (not forms)
 * - 3 quick-reply chips per question
 * - "I'll type..." chip opens text field
 * - Phase progress bar
 * - Skip always available
 * - AI responds warmly, extracts data behind the scenes
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'

interface Message {
  role: 'bot' | 'user'
  text: string
  chips?: string[]
}

interface Props {
  childId: string
  childName: string
  onComplete?: () => void
}

export default function OnboardingChat({ childId, childName, onComplete }: Props) {
  const { token } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [showInput, setShowInput] = useState(false)
  const [loading, setLoading] = useState(false)
  const [phase, setPhase] = useState('')
  const [progress, setProgress] = useState(0)
  const [totalPhases, setTotalPhases] = useState(0)
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [started, setStarted] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Start onboarding
  const startOnboarding = useCallback(async () => {
    if (!token || started) return
    setStarted(true)
    setLoading(true)

    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'start', childId }),
      })

      if (res.ok) {
        const data = await res.json()
        setMessages([{
          role: 'bot',
          text: data.greeting || `Hi! I'm going to help you set up ${childName}'s health life record. This will take about 8 minutes. Ready?`,
          chips: data.chips || ["Let's go!", 'Tell me more'],
        }])
        if (data.phase) setPhase(data.phase)
        if (data.totalPhases) setTotalPhases(data.totalPhases)
        if (data.currentPhaseIndex !== undefined) setCurrentPhaseIndex(data.currentPhaseIndex)
      }
    } catch {
      setMessages([{
        role: 'bot',
        text: `Hi! Let's set up ${childName}'s health record. I'll ask some simple questions about their journey from birth to now. Ready?`,
        chips: ["Let's go!", 'Tell me more'],
      }])
    } finally {
      setLoading(false)
    }
  }, [token, childId, childName, started])

  useEffect(() => {
    startOnboarding()
  }, [startOnboarding])

  // Send answer
  async function sendAnswer(text: string) {
    if (!text.trim() || loading || !token) return
    setShowInput(false)

    const userMsg: Message = { role: 'user', text: text.trim() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'answer',
          childId,
          answer: text.trim(),
        }),
      })

      if (res.ok) {
        const data = await res.json()

        if (data.complete) {
          setIsComplete(true)
          setProgress(100)
          setMessages(prev => [...prev, {
            role: 'bot',
            text: data.message || `That's everything! ${childName}'s life record is now set up. You can always add more details later.`,
          }])
        } else {
          const botMsg: Message = {
            role: 'bot',
            text: data.message || data.question || 'Tell me more...',
            chips: data.chips || undefined,
          }
          setMessages(prev => [...prev, botMsg])

          if (data.phase) setPhase(data.phase)
          if (data.currentPhaseIndex !== undefined) {
            setCurrentPhaseIndex(data.currentPhaseIndex)
            if (data.totalPhases) {
              setProgress(Math.round((data.currentPhaseIndex / data.totalPhases) * 100))
            }
          }
        }
      }
    } catch {
      setMessages(prev => [...prev, {
        role: 'bot',
        text: "I'm having trouble right now. Let me try the next question...",
        chips: ['Continue', 'Skip'],
      }])
    } finally {
      setLoading(false)
    }
  }

  // Skip question
  async function handleSkip() {
    if (!token) return
    setLoading(true)

    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'skip', childId }),
      })

      if (res.ok) {
        const data = await res.json()
        if (data.complete) {
          setIsComplete(true)
          setProgress(100)
          setMessages(prev => [...prev, {
            role: 'bot',
            text: `No worries! ${childName}'s life record is set up with what we have. You can always come back to fill in more.`,
          }])
        } else {
          setMessages(prev => [...prev, {
            role: 'bot',
            text: data.message || data.question || "That's fine! Let's move on.",
            chips: data.chips || undefined,
          }])
          if (data.phase) setPhase(data.phase)
          if (data.currentPhaseIndex !== undefined) {
            setCurrentPhaseIndex(data.currentPhaseIndex)
            if (data.totalPhases) {
              setProgress(Math.round((data.currentPhaseIndex / data.totalPhases) * 100))
            }
          }
        }
      }
    } catch {} finally {
      setLoading(false)
    }
  }

  // Chip tap handler
  function handleChipTap(chip: string) {
    if (chip === "I'll type...") {
      setShowInput(true)
      return
    }
    sendAnswer(chip)
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header with progress */}
      <div className="bg-white border-b border-gray-100 px-4 py-3">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            S
          </div>
          <div className="flex-1">
            <h2 className="text-sm font-bold text-gray-900">Setting up {childName}'s record</h2>
            {phase && <p className="text-[10px] text-gray-500">{phase}</p>}
          </div>
          {!isComplete && (
            <button
              onClick={handleSkip}
              disabled={loading}
              className="text-xs text-gray-400 hover:text-gray-600 font-medium"
            >
              Skip →
            </button>
          )}
        </div>

        {/* Progress bar */}
        <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => (
          <div key={i}>
            <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'bot' && (
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-xs mr-2 mt-1 flex-shrink-0">
                  S
                </div>
              )}
              <div
                className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed animate-fade-in ${
                  msg.role === 'user'
                    ? 'bg-green-600 text-white rounded-br-md'
                    : 'bg-white text-gray-700 rounded-bl-md border border-gray-100 shadow-sm'
                }`}
              >
                {msg.text}
              </div>
            </div>

            {/* Quick-reply chips */}
            {msg.role === 'bot' && msg.chips && i === messages.length - 1 && !loading && !isComplete && (
              <div className="flex flex-wrap gap-2 mt-2 ml-9">
                {msg.chips.map((chip) => (
                  <button
                    key={chip}
                    onClick={() => handleChipTap(chip)}
                    className="px-3.5 py-2 rounded-full bg-white border border-green-200 text-sm font-medium text-green-700 hover:bg-green-50 transition-all active:scale-95 shadow-sm"
                  >
                    {chip}
                  </button>
                ))}
                {!msg.chips.includes("I'll type...") && (
                  <button
                    onClick={() => setShowInput(true)}
                    className="px-3.5 py-2 rounded-full bg-white border border-gray-200 text-sm font-medium text-gray-500 hover:bg-gray-50 transition-all"
                  >
                    I'll type...
                  </button>
                )}
              </div>
            )}
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div className="flex justify-start">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-xs mr-2 mt-1 flex-shrink-0">
              S
            </div>
            <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-white border border-gray-100 shadow-sm">
              <span className="inline-flex gap-1">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Complete state */}
      {isComplete && (
        <div className="p-4 border-t border-gray-100 bg-white">
          <button
            onClick={() => onComplete ? onComplete() : (window.location.href = `/child/${childId}`)}
            className="w-full py-3 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors"
          >
            View {childName}'s Dashboard →
          </button>
        </div>
      )}

      {/* Text input (shown when "I'll type..." is tapped) */}
      {showInput && !isComplete && (
        <div className="p-3 border-t border-gray-100 bg-white">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendAnswer(input)}
              placeholder="Type your answer..."
              autoFocus
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 disabled:opacity-50"
            />
            <button
              onClick={() => sendAnswer(input)}
              disabled={loading || !input.trim()}
              className="px-4 py-2.5 rounded-xl bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
