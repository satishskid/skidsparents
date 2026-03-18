import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'

const QUICK_QUESTIONS = [
  'My child isn\'t talking yet',
  'Best foods for brain growth',
  'Is this height normal?',
  'Screen time guidelines',
  'Sleep routine help',
]

const WELCOME_MESSAGE = 'Hi! I\'m Dr. SKIDS, your child\'s health companion. Ask me anything about milestones, nutrition, sleep, habits, or development — I\'ll give you personalized guidance based on your child\'s age and profile.'

const ONBOARDING_WELCOME = `Hi! I'm Dr. SKIDS. To build the best health record for your child, I'd like to ask you a few quick questions. It only takes 2 minutes! 🌟\n\nLet's start: Was the pregnancy and delivery straightforward, or were there any complications I should know about?`

interface Message {
  role: 'user' | 'bot'
  text: string
}

interface ChatWidgetProps {
  fullScreen?: boolean
  token?: string
  childId?: string
  childName?: string
  children?: { id: string; name: string }[]
  mode?: 'standard' | 'onboarding'
  initialMessage?: string
}

export default function ChatWidget({ fullScreen = false, token: tokenProp, childId: initialChildId, childName, children: childrenListProp, mode, initialMessage }: ChatWidgetProps) {
  const { token: authToken } = useAuth()
  const token = tokenProp || authToken
  const [open, setOpen] = useState(fullScreen)
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', text: mode === 'onboarding' ? (initialMessage || ONBOARDING_WELCOME) : WELCOME_MESSAGE },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | undefined>()
  const [selectedChildId, setSelectedChildId] = useState(initialChildId)
  const [childrenList, setChildrenList] = useState(childrenListProp)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const clearChat = useCallback(() => {
    setMessages([{ role: 'bot', text: mode === 'onboarding' ? (initialMessage || ONBOARDING_WELCOME) : WELCOME_MESSAGE }])
    setConversationId(undefined)
    setInput('')
  }, [mode, initialMessage])

  // Auto-fetch children list when authenticated
  useEffect(() => {
    if (!token || childrenListProp) return
    fetch('/api/children', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.children?.length) {
          setChildrenList(data.children.map((c: any) => ({ id: c.id, name: c.name })))
          if (!selectedChildId && data.children.length === 1) {
            setSelectedChildId(data.children[0].id)
          }
        }
      })
      .catch(() => {})
  }, [token])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Listen for external open events
  useEffect(() => {
    if (fullScreen) return
    const handler = (e: Event) => {
      setOpen(true)
      const detail = (e as CustomEvent).detail
      if (detail?.question) {
        setTimeout(() => {
          send(detail.question as string)
        }, 300)
      }
    }
    window.addEventListener('open-dr-skids', handler)
    return () => window.removeEventListener('open-dr-skids', handler)
  }, [fullScreen, token, selectedChildId])

  const send = useCallback(async (text: string) => {
    if (!text.trim() || loading) return
    const userMsg: Message = { role: 'user', text: text.trim() }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    // If no token (unauthenticated), acknowledge the question then prompt sign-in
    if (!token) {
      setMessages((prev) => [
        ...prev,
        { role: 'bot', text: `That's a great question — and I want to give you a proper answer based on your child's age and profile.\n\nTo do that, I need you to sign in first. It only takes a moment, and then I can give you personalised guidance.\n\nTap "Sign In" at the top to get started!` },
      ])
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text.trim(),
          childId: selectedChildId,
          conversationId,
          ...(mode ? { mode } : {}),
        }),
      })

      if (res.status === 429) {
        const data = await res.json()
        const upgradeMsg = data.upgradeAvailable
          ? `${data.error}\n\nUpgrade to SKIDS Premium for higher limits and access to Gemini & Claude AI models.`
          : data.error
        setMessages((prev) => [...prev, { role: 'bot', text: upgradeMsg }])
        setLoading(false)
        return
      }

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`)
      }

      const data = await res.json()
      setMessages((prev) => [
        ...prev,
        { role: 'bot', text: data.response || 'I wasn\'t able to respond. Please try again.' },
      ])
      if (data.conversationId) {
        setConversationId(data.conversationId)
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'bot', text: 'I\'m having trouble connecting right now. Please try again in a moment.' },
      ])
    } finally {
      setLoading(false)
    }
  }, [token, selectedChildId, conversationId, loading])

  // Child selector dropdown
  const childSelector = childrenList && childrenList.length > 1 ? (
    <select
      value={selectedChildId || ''}
      onChange={(e) => {
        setSelectedChildId(e.target.value || undefined)
        setConversationId(undefined) // Reset conversation for new child
      }}
      className="text-[10px] bg-white/20 text-white border-none rounded px-1.5 py-0.5 outline-none"
    >
      <option value="" className="text-gray-800">All children</option>
      {childrenList.map((c) => (
        <option key={c.id} value={c.id} className="text-gray-800">{c.name}</option>
      ))}
    </select>
  ) : null

  // Typing indicator
  const typingIndicator = loading ? (
    <div className="flex justify-start">
      {fullScreen && (
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-xs mr-2 mt-1 flex-shrink-0">
          S
        </div>
      )}
      <div className="px-3.5 py-2.5 rounded-2xl rounded-bl-md bg-gray-100 text-gray-400 text-sm">
        <span className="inline-flex gap-1">
          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </span>
      </div>
    </div>
  ) : null

  // ─── Full-screen mode (for /timeline page) ───
  if (fullScreen) {
    return (
      <div className="flex flex-col h-full bg-white">
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'bot' && (
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-xs mr-2 mt-1 flex-shrink-0">
                  S
                </div>
              )}
              <div
                className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-green-600 text-white rounded-br-md'
                    : 'bg-gray-50 text-gray-700 rounded-bl-md border border-gray-100'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {typingIndicator}
          <div ref={messagesEndRef} />
        </div>

        {messages.length <= 2 && !loading && (
          <div className="px-4 pb-2 flex gap-2 overflow-x-auto no-scrollbar">
            {QUICK_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => send(q)}
                className="flex-shrink-0 px-3 py-1.5 rounded-full bg-green-50 text-green-700 text-xs font-medium border border-green-200 hover:bg-green-100 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        <div className="p-3 border-t border-gray-100 bg-white">
          <div className="flex gap-2 max-w-2xl mx-auto">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send(input)}
              placeholder={loading ? 'Dr. SKIDS is thinking...' : 'Ask anything about your child...'}
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 disabled:opacity-50"
            />
            <button
              onClick={() => send(input)}
              disabled={loading || !input.trim()}
              className="px-4 py-2.5 rounded-xl bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ─── Floating widget mode ───
  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-24 right-4 md:bottom-6 md:right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 transition-all items-center justify-center flex"
        aria-label="Chat with Dr. SKIDS"
      >
        {open ? (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <span className="text-2xl">S</span>
        )}
        {!open && (
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-500 border-2 border-white pulse-dot" />
        )}
      </button>

      {open && (
        <div className="fixed bottom-20 right-4 md:bottom-24 md:right-6 z-50 w-[calc(100vw-2rem)] max-w-[380px] h-[70vh] max-h-[480px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-slide-up">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">S</div>
            <div className="flex-1">
              <div className="text-sm font-bold">Dr. SKIDS</div>
              <div className="text-[10px] text-white/70">
                {selectedChildId && childrenList
                  ? `Helping with ${childrenList.find((c) => c.id === selectedChildId)?.name || 'your child'}`
                  : 'AI-powered child health companion'}
              </div>
            </div>
            {childSelector}
            <button
              onClick={clearChat}
              title="Clear conversation"
              className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
              aria-label="Clear chat"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
            </button>
            <button
              onClick={() => setOpen(false)}
              className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
              aria-label="Close chat"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-green-600 text-white rounded-br-md'
                      : 'bg-gray-100 text-gray-700 rounded-bl-md'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {typingIndicator}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick questions */}
          {messages.length <= 2 && !loading && (
            <div className="px-4 pb-2 flex gap-2 overflow-x-auto no-scrollbar">
              {QUICK_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => send(q)}
                  className="flex-shrink-0 px-3 py-1.5 rounded-full bg-green-50 text-green-700 text-xs font-medium border border-green-200 hover:bg-green-100 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-3 border-t border-gray-100">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && send(input)}
                placeholder={loading ? 'Dr. SKIDS is thinking...' : 'Ask anything about your child...'}
                disabled={loading}
                className="flex-1 px-3.5 py-2 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 disabled:opacity-50"
              />
              <button
                onClick={() => send(input)}
                disabled={loading || !input.trim()}
                className="px-3 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              </button>
            </div>
            <p className="mt-1.5 text-[10px] text-gray-400 text-center leading-tight">
              For guidance only · Not a substitute for medical advice · Always consult your paediatrician
            </p>
          </div>
        </div>
      )}
    </>
  )
}
