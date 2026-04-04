/**
 * PilotRegistration — Registration flow for pilot participants
 * Login → Seed Life Record → Welcome
 */
import { useState } from 'react'

type Step = 'login' | 'creating' | 'welcome'

export default function PilotRegistration({ inviteCode, qrCode, dob, childName }: { inviteCode: string; qrCode: string; dob: string; childName: string }) {
  const [step, setStep] = useState<Step>('login')
  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [childId, setChildId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleRegistration() {
    if (!name.trim() || !phone.trim()) { setError('Please enter your name and phone number'); return }
    setLoading(true); setError(null); setStep('creating')
    try {
      // Lead capture (non-fatal)
      await fetch('/api/lead', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), phone: phone.trim(), source: 'pilot', medium: 'invite', campaign: inviteCode, funnel_stage: 'pilot_registration' }),
      }).catch(() => {})

      const parentId = `pilot_${phone.replace(/\D/g, '').slice(-10)}`
      const seedRes = await fetch('/api/pilot/seed-life-record', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parent_id: parentId, child_name: childName || 'My Child', dob, gender: null, qr_code: qrCode, campaign_code: qrCode, invite_code: inviteCode }),
      })
      const seedData = await seedRes.json()

      if (seedRes.ok && seedData.child_id) {
        setChildId(seedData.child_id)
        await fetch('/api/pilot/accept', { method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ invite_code: inviteCode, parent_id: parentId, child_id: seedData.child_id }),
        }).catch(() => {})
        setStep('welcome')
      } else {
        setError(seedData.error || 'Could not create life record. Please try again.'); setStep('login')
      }
    } catch { setError('Something went wrong. Please try again.'); setStep('login') }
    setLoading(false)
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center"><span className="text-white font-bold text-sm">S</span></div>
            <span className="font-bold text-gray-900">SKIDS Intelligence</span>
          </div>
          <span className="text-xs bg-green-50 text-green-700 px-3 py-1 rounded-full font-medium">Pilot Program</span>
        </div>
      </header>

      {step === 'login' && (
        <div className="max-w-md mx-auto px-4 py-16">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Create {childName ? `${childName}'s` : "your child's"} Life Record</h1>
            <p className="text-gray-500">Enter your details to join the SKIDS pilot program</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Full name"
                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-green-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 98765 43210"
                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-green-500 outline-none" />
            </div>
          </div>
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          <button onClick={handleRegistration} disabled={loading}
            className="w-full mt-6 px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 disabled:opacity-50 transition-colors">
            Create Life Record
          </button>
          <p className="text-xs text-gray-400 text-center mt-4">By registering, you agree to receive health insights for your child.</p>
        </div>
      )}

      {step === 'creating' && (
        <div className="max-w-md mx-auto px-4 py-24 text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <svg className="animate-spin h-8 w-8 text-green-600" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Creating Life Record...</h2>
          <p className="text-gray-500">Importing screening data and setting up intelligence engine</p>
        </div>
      )}

      {step === 'welcome' && (
        <div className="max-w-md mx-auto px-4 py-16 text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Welcome to SKIDS!</h1>
          <p className="text-gray-500 mb-8">{childName ? `${childName}'s` : "Your child's"} Life Record has been created and seeded with screening data.</p>
          <div className="bg-gray-50 rounded-2xl p-6 text-left mb-8">
            <h3 className="font-semibold text-gray-900 mb-4">What happens next:</h3>
            <div className="space-y-3">
              {[
                { icon: '📱', text: 'Download the SKIDS Parent app to access the full Life Record' },
                { icon: '👨‍⚕️', text: 'Your pediatrician will be notified and can view the intelligence dashboard' },
                { icon: '📊', text: "You'll receive personalized daily insights and growth guidance" },
                { icon: '🔔', text: 'Smart nudges will remind you about milestones and observations' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3"><span className="text-lg flex-shrink-0">{item.icon}</span><p className="text-sm text-gray-600">{item.text}</p></div>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <a href="/me" className="block w-full px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors text-center">Open SKIDS Parent App</a>
            <a href="/" className="block w-full px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors text-center">Back to Home</a>
          </div>
        </div>
      )}
    </div>
  )
}
