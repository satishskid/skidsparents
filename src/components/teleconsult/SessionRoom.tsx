import { useState, useEffect, useCallback } from 'react'
import { LiveKitRoom, VideoConference } from '@livekit/components-react'
import '@livekit/components-styles'
import { useAuth } from '@/lib/hooks/useAuth'

interface Props {
  orderId: string
}

interface SessionData {
  token: string | null
  roomName: string
  livekitUrl: string
  fallback?: boolean
}

interface AiBrief {
  childSummary: string
  aiSuggestions: {
    ddx: string[]
    redFlags: string[]
    vaccinationGaps: string[]
    nutritionNote: string
    suggestedQuestions: string[]
  }
}

interface PrescriptionForm {
  medications: string
  education: string
  nutrition: string
  behavioural: string
  followUp: string
}

type Tab = 'phr' | 'ai' | 'rx'

export default function SessionRoom({ orderId }: Props) {
  const { token: authToken, loading: authLoading } = useAuth()

  const [sessionData, setSessionData] = useState<SessionData | null>(null)
  const [aiBrief, setAiBrief] = useState<AiBrief | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('phr')
  const [prescription, setPrescription] = useState<PrescriptionForm>({
    medications: '',
    education: '',
    nutrition: '',
    behavioural: '',
    followUp: '',
  })
  const [aiQuery, setAiQuery] = useState('')
  const [aiResponse, setAiResponse] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [rxSubmitting, setRxSubmitting] = useState(false)
  const [rxDone, setRxDone] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [expandedSection, setExpandedSection] = useState<string | null>('medications')

  const authHeader = useCallback(
    () => ({ Authorization: `Bearer ${authToken}` }),
    [authToken]
  )

  useEffect(() => {
    if (authLoading || !authToken) return

    const init = async () => {
      try {
        // Start session
        const sessionRes = await fetch(`/api/provider/orders/${orderId}/session/start`, {
          method: 'POST',
          headers: authHeader(),
        })
        if (!sessionRes.ok) {
          const d = await sessionRes.json() as { error?: string }
          throw new Error(d.error || 'Failed to start session')
        }
        const session = await sessionRes.json() as SessionData
        setSessionData(session)

        // Fetch AI brief in parallel
        fetch(`/api/provider/orders/${orderId}/ai-brief`, { headers: authHeader() })
          .then(r => r.ok ? r.json() as Promise<AiBrief> : null)
          .then(brief => { if (brief) setAiBrief(brief) })
          .catch(() => {})
      } catch (e: unknown) {
        setError(e instanceof Error ? (e.message || 'Failed to start session') : 'Failed to start session')
      } finally {
        setLoading(false)
      }
    }

    init()
  }, [authToken, authLoading, orderId, authHeader])

  const handleAiQuery = async () => {
    if (!aiQuery.trim() || aiLoading) return
    setAiLoading(true)
    setAiResponse('')
    try {
      const res = await fetch(`/api/provider/orders/${orderId}/ai-assist`, {
        method: 'POST',
        headers: { ...authHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: aiQuery }),
      })
      const data = await res.json() as { response?: string }
      setAiResponse(data.response || '')
    } catch {
      setAiResponse('AI assist unavailable. Please try again.')
    } finally {
      setAiLoading(false)
    }
  }

  const handleSendPrescription = async () => {
    const { medications, education, nutrition, behavioural, followUp } = prescription
    if (!medications.trim() || !education.trim() || !nutrition.trim() || !behavioural.trim() || !followUp.trim()) {
      alert('Please fill in all 5 prescription sections before sending.')
      return
    }
    setRxSubmitting(true)
    try {
      const res = await fetch(`/api/provider/orders/${orderId}/prescription`, {
        method: 'POST',
        headers: { ...authHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          medications: medications.trim(),
          education: education.trim(),
          nutrition: nutrition.trim(),
          behavioural: behavioural.trim(),
          followUp: followUp.trim(),
        }),
      })
      if (!res.ok) {
        const d = await res.json() as { error?: string }
        throw new Error(d.error || 'Failed to send prescription')
      }
      setRxDone(true)
    } catch (e: unknown) {
      alert(e instanceof Error ? (e.message || 'Failed to send prescription') : 'Failed to send prescription')
    } finally {
      setRxSubmitting(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-red-400">{error}</p>
        <a href="/provider" className="px-5 py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold">
          Back to Dashboard
        </a>
      </div>
    )
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'phr', label: 'PHR Summary' },
    { key: 'ai', label: 'AI Assist' },
    { key: 'rx', label: 'Prescription' },
  ]

  const rxSections = [
    { key: 'medications' as const, label: 'Medications', placeholder: 'e.g. Amoxicillin 250mg/5ml — 5ml three times a day for 5 days, after food' },
    { key: 'education' as const, label: 'Patient Education', placeholder: 'e.g. Fever above 102°F — visit ER. Keep child hydrated.' },
    { key: 'nutrition' as const, label: 'Nutrition', placeholder: 'e.g. Iron-rich foods: dal, spinach, ragi. Avoid cow\'s milk before 1 year.' },
    { key: 'behavioural' as const, label: 'Behavioural Guidance', placeholder: 'e.g. Read aloud 15 min/day. Limit screen time.' },
    { key: 'followUp' as const, label: 'Follow-up & Referrals', placeholder: 'e.g. Review in 5 days if fever persists. Refer to SKIDS Chatter for speech therapy.' },
  ]

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-900 overflow-hidden">
      {/* Video panel */}
      <div className="h-[40vh] md:h-full md:flex-1 bg-black relative">
        {sessionData?.token && sessionData.livekitUrl ? (
          <LiveKitRoom
            token={sessionData.token}
            serverUrl={sessionData.livekitUrl}
            connect={true}
            style={{ height: '100%' }}
          >
            <VideoConference />
          </LiveKitRoom>
        ) : (
          <div className="h-full flex flex-col items-center justify-center gap-3 text-center px-6">
            <p className="text-gray-400 text-sm">Video unavailable</p>
            {sessionData?.fallback && (
              <p className="text-gray-500 text-xs">Paste a Google Meet link to continue the session</p>
            )}
          </div>
        )}
      </div>

      {/* Clinical panel */}
      <div className="w-full md:w-96 shrink-0 bg-white flex flex-col h-[60vh] md:h-full">
        {/* Tab bar */}
        <div className="flex border-b border-gray-200 sticky top-0 bg-white z-10">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex-1 py-3 text-xs font-semibold transition-colors ${
                activeTab === t.key
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto">
          {/* PHR Summary tab */}
          {activeTab === 'phr' && (
            <div className="p-4 space-y-4">
              {aiBrief ? (
                <>
                  <div className="bg-green-50 rounded-xl p-3">
                    <p className="text-xs font-semibold text-green-700 mb-1">Clinical Summary</p>
                    <p className="text-sm text-gray-700">{aiBrief.childSummary}</p>
                  </div>

                  {aiBrief.aiSuggestions.ddx.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Differential Diagnoses</p>
                      <ol className="space-y-1">
                        {aiBrief.aiSuggestions.ddx.map((d, i) => (
                          <li key={i} className="flex gap-2 text-sm text-gray-700">
                            <span className="text-green-600 font-bold shrink-0">{i + 1}.</span>
                            {d}
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {aiBrief.aiSuggestions.redFlags.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Red Flags</p>
                      <div className="flex flex-wrap gap-1.5">
                        {aiBrief.aiSuggestions.redFlags.map((f, i) => (
                          <span key={i} className="px-2 py-1 bg-red-50 text-red-700 text-xs rounded-lg">⚠️ {f}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {aiBrief.aiSuggestions.vaccinationGaps.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Vaccination Gaps</p>
                      <ul className="space-y-1">
                        {aiBrief.aiSuggestions.vaccinationGaps.map((v, i) => (
                          <li key={i} className="text-sm text-amber-700 flex gap-1.5">
                            <span>💉</span>{v}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {aiBrief.aiSuggestions.nutritionNote && (
                    <div className="bg-amber-50 rounded-xl p-3">
                      <p className="text-xs font-semibold text-amber-700 mb-1">Nutrition Note</p>
                      <p className="text-sm text-gray-700">{aiBrief.aiSuggestions.nutritionNote}</p>
                    </div>
                  )}

                  {aiBrief.aiSuggestions.suggestedQuestions.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Suggested Questions</p>
                      <ul className="space-y-1.5">
                        {aiBrief.aiSuggestions.suggestedQuestions.map((q, i) => (
                          <li key={i} className="text-sm text-gray-600 flex gap-1.5">
                            <span className="text-green-500 shrink-0">→</span>{q}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 gap-2">
                  <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs text-gray-400">Generating AI brief...</p>
                </div>
              )}
            </div>
          )}

          {/* AI Assist tab */}
          {activeTab === 'ai' && (
            <div className="p-4 space-y-4">
              {aiBrief && (
                <div className="bg-blue-50 rounded-xl p-3 space-y-2">
                  <p className="text-xs font-semibold text-blue-700">Pre-session AI Brief</p>
                  {aiBrief.aiSuggestions.ddx.length > 0 && (
                    <p className="text-xs text-gray-600">
                      <span className="font-medium">DDx:</span> {aiBrief.aiSuggestions.ddx.join(' · ')}
                    </p>
                  )}
                  {aiBrief.aiSuggestions.redFlags.length > 0 && (
                    <p className="text-xs text-red-600">
                      ⚠️ {aiBrief.aiSuggestions.redFlags.join(' · ')}
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <textarea
                  value={aiQuery}
                  onChange={e => setAiQuery(e.target.value)}
                  placeholder="Ask anything — drug dose by weight, IAP guidelines, DDx for symptoms..."
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                  onClick={handleAiQuery}
                  disabled={aiLoading || !aiQuery.trim()}
                  className="w-full py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  {aiLoading ? 'Thinking...' : 'Ask AI'}
                </button>
              </div>

              {aiResponse && (
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 mb-1.5">AI Response</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{aiResponse}</p>
                </div>
              )}
            </div>
          )}

          {/* Prescription Builder tab */}
          {activeTab === 'rx' && (
            <div className="p-4 space-y-3 pb-24 md:pb-4">
              {rxDone ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-2xl">✓</div>
                  <p className="text-sm font-semibold text-gray-900">Prescription sent to parent via WhatsApp ✓</p>
                  <p className="text-xs text-gray-400">Session completed. You can close this window.</p>
                </div>
              ) : (
                <>
                  {rxSections.map(section => (
                    <div key={section.key} className="border border-gray-200 rounded-xl overflow-hidden">
                      <button
                        onClick={() => setExpandedSection(expandedSection === section.key ? null : section.key)}
                        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 text-left"
                      >
                        <span className="text-sm font-semibold text-gray-700">{section.label}</span>
                        <div className="flex items-center gap-2">
                          {(section.key === 'nutrition' || section.key === 'behavioural') && aiBrief && (
                            <button
                              onClick={e => {
                                e.stopPropagation()
                                const val = section.key === 'nutrition'
                                  ? aiBrief.aiSuggestions.nutritionNote
                                  : aiBrief.aiSuggestions.ddx.join('\n')
                                setPrescription(p => ({ ...p, [section.key]: val }))
                                setExpandedSection(section.key)
                              }}
                              className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-semibold rounded-full hover:bg-green-200"
                            >
                              AI Suggest
                            </button>
                          )}
                          <span className="text-gray-400 text-xs">{expandedSection === section.key ? '▲' : '▼'}</span>
                        </div>
                      </button>
                      {expandedSection === section.key && (
                        <div className="p-3">
                          <textarea
                            value={prescription[section.key]}
                            onChange={e => setPrescription(p => ({ ...p, [section.key]: e.target.value }))}
                            placeholder={section.placeholder}
                            rows={4}
                            className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>

        {/* End & Send button — sticky on mobile, fixed at bottom of panel */}
        {activeTab === 'rx' && !rxDone && (
          <div className="sticky bottom-0 p-4 bg-white border-t border-gray-100 md:static">
            <button
              onClick={handleSendPrescription}
              disabled={rxSubmitting}
              className="w-full py-3.5 rounded-xl bg-green-600 text-white font-bold text-sm hover:bg-green-700 disabled:opacity-50 transition-colors shadow-lg shadow-green-500/20"
            >
              {rxSubmitting ? 'Sending...' : 'End & Send Prescription'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
