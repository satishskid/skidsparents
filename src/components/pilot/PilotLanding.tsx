/**
 * PilotLanding — Multi-step pilot experience flow
 * Step 1: Hero + invite code → Step 2: Screening bridge → Step 3: Intelligence preview → Step 4: Register
 */
import { useState, useEffect } from 'react'
import IntelligencePreview from './IntelligencePreview'

type Step = 'invite' | 'screening' | 'intelligence' | 'register'

interface InviteData {
  valid: boolean
  invite_code: string
  parent_name?: string
  child_qr_code?: string
  source?: string
  doctor?: { name: string; clinic?: string; specialty?: string } | null
  group?: { name: string; description?: string } | null
}

interface IntelligenceData {
  child: { name: string; age_months: number; gender: string; age_period: string; school?: string; class?: string }
  screening_summary: Record<string, { status: string; detail: string; urgency: string }>
  vitals: Record<string, { value: string; risk: string }>
  flagged_observations: string[]
  counts: { total_modules: number; normal: number; monitor: number; attention_needed: number }
  growth_tracks: Array<{ domain: string; title: string; active: boolean }>
  intelligence_message: string
}

export default function PilotLanding({ initialCode }: { initialCode?: string }) {
  const [step, setStep] = useState<Step>('invite')
  const [inviteCode, setInviteCode] = useState(initialCode || '')
  const [inviteData, setInviteData] = useState<InviteData | null>(null)
  const [qrCode, setQrCode] = useState('')
  const [dob, setDob] = useState('')
  const [intelligenceData, setIntelligenceData] = useState<IntelligenceData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => { if (initialCode) validateInvite(initialCode) }, [])

  async function validateInvite(code?: string) {
    const c = code || inviteCode.trim()
    if (!c) { setError('Please enter your invite code'); return }
    setLoading(true); setError(null)
    try {
      const res = await fetch('/api/pilot/validate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ invite_code: c }) })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Invalid invite code'); setLoading(false); return }
      setInviteData(data); setInviteCode(c)
      if (data.child_qr_code) setQrCode(data.child_qr_code)
      setStep('screening')
    } catch { setError('Could not validate code. Please try again.') }
    setLoading(false)
  }

  async function fetchIntelligence() {
    if (!qrCode || !dob) { setError('Please enter both the screening code and date of birth'); return }
    setLoading(true); setError(null)
    try {
      const res = await fetch('/api/pilot/intelligence-preview', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ qr_code: qrCode, dob, invite_code: inviteCode }) })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Could not fetch screening data'); setLoading(false); return }
      setIntelligenceData(data); setStep('intelligence')
    } catch { setError('Could not connect. Please try again.') }
    setLoading(false)
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="font-bold text-gray-900">SKIDS Intelligence</span>
          </div>
          <span className="text-xs bg-green-50 text-green-700 px-3 py-1 rounded-full font-medium">Pilot Program</span>
        </div>
      </header>

      {/* Step: Invite Code */}
      {step === 'invite' && (
        <div className="max-w-2xl mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 text-sm font-medium px-4 py-2 rounded-full mb-6">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              Invite-Only Preview
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight mb-4">
              Your child's screening report<br />
              <span className="text-green-600">is just the beginning.</span>
            </h1>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">
              SKIDS Intelligence transforms a one-time screening into ongoing, personalized health insights for your child — powered by AI, guided by evidence.
            </p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-8 max-w-md mx-auto">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Enter your invite code</label>
            <input type="text" value={inviteCode} onChange={e => setInviteCode(e.target.value.toUpperCase())} placeholder="e.g. SKDS4X7P" maxLength={8}
              className="w-full px-4 py-3 text-center text-2xl font-mono tracking-[0.3em] bg-white border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none transition-all"
              onKeyDown={e => e.key === 'Enter' && validateInvite()} />
            {error && <p className="mt-3 text-sm text-red-600 text-center">{error}</p>}
            <button onClick={() => validateInvite()} disabled={loading || !inviteCode.trim()}
              className="w-full mt-4 px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              {loading ? 'Validating...' : 'Continue'}
            </button>
          </div>

          <div className="grid grid-cols-3 gap-6 mt-16 text-center">
            <div><div className="text-3xl font-bold text-gray-900">15,000+</div><div className="text-sm text-gray-500 mt-1">Children Screened</div></div>
            <div><div className="text-3xl font-bold text-gray-900">95%</div><div className="text-sm text-gray-500 mt-1">Parent Satisfaction</div></div>
            <div><div className="text-3xl font-bold text-gray-900">150+</div><div className="text-sm text-gray-500 mt-1">Conditions Tracked</div></div>
          </div>

          <div className="mt-16">
            <h2 className="text-xl font-bold text-gray-900 text-center mb-8">How SKIDS Intelligence Works</h2>
            <div className="grid sm:grid-cols-3 gap-6">
              {[
                { n: '1', title: 'Screening Data', desc: "Your child's health screening becomes the foundation of their Life Record." },
                { n: '2', title: 'AI Intelligence', desc: 'Our engine analyzes 150+ conditions, generates personalized projections.' },
                { n: '3', title: 'Guided Care', desc: 'You and your pediatrician get evidence-based guidance, not guesswork.' },
              ].map((item, i) => (
                <div key={i} className="text-center p-6">
                  <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 font-bold flex items-center justify-center mx-auto mb-3">{item.n}</div>
                  <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step: Screening Bridge */}
      {step === 'screening' && inviteData && (
        <div className="max-w-2xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome{inviteData.parent_name ? `, ${inviteData.parent_name}` : ''}!</h2>
            {inviteData.doctor && (
              <p className="text-gray-500">Your pediatrician: <strong className="text-gray-900">Dr. {inviteData.doctor.name}</strong>
                {inviteData.doctor.clinic && <span> at {inviteData.doctor.clinic}</span>}
              </p>
            )}
          </div>

          <div className="bg-gray-50 rounded-2xl p-8 max-w-md mx-auto">
            <h3 className="font-semibold text-gray-900 mb-1">Connect your screening report</h3>
            <p className="text-sm text-gray-500 mb-6">Enter the code from your child's health card and their date of birth.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Health Card Code</label>
                <input type="text" value={qrCode} onChange={e => setQrCode(e.target.value.toUpperCase())} placeholder="8-character code" maxLength={8}
                  className="w-full px-4 py-3 text-center font-mono tracking-wider bg-white border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Child's Date of Birth</label>
                <input type="date" value={dob} onChange={e => setDob(e.target.value)}
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none" />
              </div>
            </div>
            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
            <button onClick={fetchIntelligence} disabled={loading || !qrCode || !dob}
              className="w-full mt-6 px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              {loading ? <span className="flex items-center justify-center gap-2"><svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>Analyzing...</span> : 'See Intelligence Preview'}
            </button>
          </div>
          <button onClick={() => setStep('invite')} className="block mx-auto mt-6 text-sm text-gray-400 hover:text-gray-600">Back</button>
        </div>
      )}

      {/* Step: Intelligence Preview */}
      {step === 'intelligence' && intelligenceData && (
        <IntelligencePreview
          data={intelligenceData}
          doctor={inviteData?.doctor || null}
          onRegister={() => {
            window.location.href = `/pilot/register?code=${inviteCode}&qr=${qrCode}&dob=${dob}&name=${encodeURIComponent(intelligenceData.child.name)}`
          }}
        />
      )}
    </div>
  )
}
