import { useState, useEffect, useRef } from 'react'

const QUICK_QUESTIONS = [
  'My child isn\'t talking yet',
  'Best foods for brain growth',
  'Is this height normal?',
  'Screen time guidelines',
  'Sleep routine help',
]

const CANNED_RESPONSES: Record<string, string> = {
  default: 'I\'m Dr. SKIDS, your child\'s health companion! Every question you ask here becomes part of your child\'s health timeline — milestones, habits, observations, all in one place. What would you like to know?',

  // ─── Original topic responses ───
  talk: 'Speech development varies widely. Most children say their first words around 12 months and have 50+ words by 24 months. If your child isn\'t talking by 18 months, a speech screening can help identify if support would be beneficial. I\'ll note this concern in your child\'s timeline. Would you like to explore our Language Development module?',
  food: 'Great question! For brain development, focus on: omega-3 rich foods (fish, walnuts), iron (spinach, lentils), and colorful vegetables. The Rainbow Plate challenge — 6 different colors in one meal — is a fun way to ensure variety. I\'m adding this nutrition interest to your child\'s timeline.',
  height: 'Growth patterns are unique to each child. We track height, weight, and head circumference against WHO z-scores. Consistency matters more than percentile. Would you like to start tracking your child\'s growth in their health timeline?',
  screen: 'The AAP recommends: No screens under 18 months (except video calls). Ages 2-5: max 1 hour of quality content. Ages 6+: consistent limits. The key is co-viewing — watch together and discuss what you see. Shall I add screen time goals to your child\'s timeline?',
  sleep: 'A consistent bedtime routine is the #1 sleep superpower. Try the Power-Down Hour: dim lights, no screens, calm activities. Age guidelines: 1-2 years need 11-14 hours, 3-5 need 10-13 hours, 6-12 need 9-12 hours. I can help you track sleep patterns in your child\'s timeline.',

  // ─── Organ/development responses ───
  organ: 'Every organ system in your child\'s body is developing at its own pace. Understanding how they connect — brain to gut, heart to lungs, eyes to motor skills — gives you a complete picture of your child\'s health. What specific area would you like to explore? I\'ll add it to their development timeline.',
  brain: 'Your child\'s brain forms 1 million new neural connections every second in the first 5 years! This is the most critical window for cognitive development. Activities like reading, play, and conversation physically shape brain architecture. What aspect of brain development concerns you? I\'ll track it.',
  development: 'Child development follows predictable milestones across motor, language, cognitive, and social-emotional domains. Each child has their own timeline, but knowing the general patterns helps you spot opportunities for support early. Tell me your child\'s age and I\'ll share key milestones to watch for.',

  // ─── Habit responses ───
  habit: 'The 6 HABITS — Healthy eating, Active movement, Balanced stress, Inner coaching, Timekeepers, and Sufficient sleep — are the foundation of lifelong health. Building even one habit at a time creates lasting change. Which habit resonates most with your family right now?',
  coaching: 'Growth mindset isn\'t just positive thinking — it physically rewires neural pathways. The words we use with children become their inner voice. Try replacing "You\'re so smart" with "You worked so hard on that!" This small shift builds resilience. Want me to add inner coaching goals to your child\'s timeline?',
  movement: 'Children need at least 60 minutes of physical activity daily. But it\'s not just about exercise — movement is the brain\'s "Miracle-Gro." Climbing, jumping, and balancing build both motor skills and cognitive connections. Shall I help you track your child\'s activity patterns?',

  // ─── Milestone check responses ───
  milestone: 'Great question! Developmental milestones are guideposts, not deadlines. Every child develops at their own pace. The key is tracking patterns over time — which is exactly what your child\'s health timeline does. Tell me your child\'s age and what area you\'re curious about, and I\'ll share what to expect.',
  ontrack: 'To give you the best guidance on whether your child is on track, I\'d love to know their age and what you\'re observing. The IAP and AAP milestone guidelines cover motor, language, cognitive, and social-emotional development. Every observation you share here builds their health record — visible to you and your pediatrician.',

  // ─── Health note / PHR responses ───
  healthnote: 'I\'ve noted this in your child\'s health timeline. These everyday observations — fevers, sleep changes, appetite shifts, behavioral notes — are exactly what pediatricians wish they had access to. Over time, these notes reveal patterns that help your doctor give better, faster care. What else have you noticed?',
  note: 'Got it — I\'m adding this to your child\'s health timeline. Every note you add here builds a complete picture of your child\'s health journey. When you visit your pediatrician, this timeline becomes the most valuable history they\'ve ever seen. Would you like to add any details?',
  trouble: 'I hear you — let me note this in your child\'s timeline. Can you tell me: when did this start? How often does it happen? Any other changes you\'ve noticed? These details help build a complete picture that your pediatrician will find invaluable.',
  worry: 'Your concern is valid and worth noting. I\'m adding this to your child\'s health timeline. As a general guideline: if something persists for more than 48 hours, worsens suddenly, or affects your child\'s daily activities, it\'s worth a pediatric consultation. Would you like to describe what you\'re seeing in more detail?',
  fever: 'I\'m noting this fever episode in your child\'s timeline. Key things to track: temperature reading, time of day, any accompanying symptoms (cough, rash, appetite change), and how your child is behaving overall. For children under 3 months, any fever (100.4\u00b0F/38\u00b0C+) warrants immediate medical attention. How is your child feeling otherwise?',
  log: 'Health note logged! I\'m adding this to your child\'s timeline. Every observation matters — appetite changes, mood shifts, physical symptoms, developmental leaps. Over months and years, these notes create the most comprehensive health record possible. What would you like to note?',
}

function getResponse(input: string): string {
  const lower = input.toLowerCase()

  // ─── Original topic matching ───
  if (lower.includes('talk') || lower.includes('speak') || lower.includes('word') || lower.includes('speech')) return CANNED_RESPONSES.talk
  if (lower.includes('food') || lower.includes('eat') || lower.includes('nutrition')) return CANNED_RESPONSES.food
  if (lower.includes('height') || lower.includes('weight') || lower.includes('grow')) return CANNED_RESPONSES.height
  if (lower.includes('screen') || lower.includes('phone') || lower.includes('tablet') || lower.includes('tv')) return CANNED_RESPONSES.screen
  if (lower.includes('sleep') || lower.includes('bed')) return CANNED_RESPONSES.sleep

  // ─── Milestone matching (check before PHR so "on track" isn't caught by "track") ───
  if (lower.includes('milestone') || lower.includes('on track') || lower.includes('development on') || lower.includes('for their age') || lower.includes('for my age')) return CANNED_RESPONSES.milestone
  if (lower.includes('is my child') && !lower.includes('note')) return CANNED_RESPONSES.ontrack

  // ─── Health note / PHR matching ───
  if (lower.includes('fever') || lower.includes('temperature')) return CANNED_RESPONSES.fever
  if (lower.includes('i want to note') || lower.includes('note something')) return CANNED_RESPONSES.note
  if (lower.includes('log') || lower.includes('track')) return CANNED_RESPONSES.log
  if (lower.includes('trouble') || lower.includes('issue') || lower.includes('problem')) return CANNED_RESPONSES.trouble
  if (lower.includes('worry') || lower.includes('concern') || lower.includes('should i')) return CANNED_RESPONSES.worry

  // ─── Organ/development matching ───
  if (lower.includes('brain') || lower.includes('mind') || lower.includes('neural') || lower.includes('cognitive')) return CANNED_RESPONSES.brain
  if (lower.includes('organ') || lower.includes('body system')) return CANNED_RESPONSES.organ
  if (lower.includes('develop') || lower.includes('age')) return CANNED_RESPONSES.development

  // ─── Habit matching ───
  if (lower.includes('coaching') || lower.includes('mindset') || lower.includes('inner')) return CANNED_RESPONSES.coaching
  if (lower.includes('movement') || lower.includes('exercise') || lower.includes('active') || lower.includes('physical')) return CANNED_RESPONSES.movement
  if (lower.includes('habit') || lower.includes('routine')) return CANNED_RESPONSES.habit

  return CANNED_RESPONSES.default
}

interface Message {
  role: 'user' | 'bot'
  text: string
}

interface ChatWidgetProps {
  fullScreen?: boolean
}

export default function ChatWidget({ fullScreen = false }: ChatWidgetProps) {
  const [open, setOpen] = useState(fullScreen)
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', text: CANNED_RESPONSES.default },
  ])
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Listen for external open events (from contextual prompt cards and "Start Timeline" button)
  useEffect(() => {
    if (fullScreen) return // Full-screen mode doesn't need external open events
    const handler = (e: Event) => {
      setOpen(true)
      const detail = (e as CustomEvent).detail
      if (detail?.question) {
        // Auto-send the question after a short delay (so the chat panel renders first)
        setTimeout(() => {
          const q = detail.question as string
          const userMsg: Message = { role: 'user', text: q }
          const botMsg: Message = { role: 'bot', text: getResponse(q) }
          setMessages((prev) => [...prev, userMsg, botMsg])
        }, 300)
      }
    }
    window.addEventListener('open-dr-skids', handler)
    return () => window.removeEventListener('open-dr-skids', handler)
  }, [fullScreen])

  const send = (text: string) => {
    if (!text.trim()) return
    const userMsg: Message = { role: 'user', text: text.trim() }
    const botMsg: Message = { role: 'bot', text: getResponse(text) }
    setMessages((prev) => [...prev, userMsg, botMsg])
    setInput('')
  }

  // ─── Full-screen mode (for /timeline page) ───
  if (fullScreen) {
    return (
      <div className="flex flex-col h-full bg-white">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'bot' && (
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-xs mr-2 mt-1 flex-shrink-0">
                  S
                </div>
              )}
              <div
                className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-green-600 text-white rounded-br-md'
                    : 'bg-gray-50 text-gray-700 rounded-bl-md border border-gray-100'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick questions */}
        {messages.length <= 2 && (
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
        <div className="p-3 border-t border-gray-100 bg-white">
          <div className="flex gap-2 max-w-2xl mx-auto">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send(input)}
              placeholder="Ask anything about your child..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
            />
            <button
              onClick={() => send(input)}
              className="px-4 py-2.5 rounded-xl bg-green-600 text-white hover:bg-green-700 transition-colors"
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

  // ─── Floating widget mode (for homepage / other pages) ───
  return (
    <>
      {/* Floating button — hidden on mobile (prominent section exists), shown on desktop */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 transition-all items-center justify-center hidden md:flex"
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

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-4 right-4 md:bottom-24 md:right-6 z-50 w-[calc(100vw-2rem)] max-w-[380px] h-[70vh] max-h-[480px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-slide-up">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">S</div>
            <div className="flex-1">
              <div className="text-sm font-bold">Dr. SKIDS</div>
              <div className="text-[10px] text-white/70">Building your child's health timeline</div>
            </div>
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
                  className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-green-600 text-white rounded-br-md'
                      : 'bg-gray-100 text-gray-700 rounded-bl-md'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick questions */}
          {messages.length <= 2 && (
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
                placeholder="Ask anything about your child..."
                className="flex-1 px-3.5 py-2 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
              />
              <button
                onClick={() => send(input)}
                className="px-3 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
