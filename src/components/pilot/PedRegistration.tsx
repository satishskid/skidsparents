/**
 * PedRegistration — Pediatrician self-registration for SKIDS Intelligence
 */
import { useState } from 'react'

type Step = 'info' | 'form' | 'submitted'

export default function PedRegistration() {
  const [step, setStep] = useState<Step>('info')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '', phone: '', email: '', clinic_name: '', clinic_address: '',
    city: 'Bangalore', specialty: 'pediatrician', license_number: '',
    experience_years: '', motivation: '',
  })

  async function handleSubmit() {
    if (!form.name.trim() || !form.phone.trim()) { setError('Name and phone number are required'); return }
    setLoading(true); setError(null)
    try {
      const res = await fetch('/api/ped/apply', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, experience_years: form.experience_years ? parseInt(form.experience_years) : null }),
      })
      const data = await res.json()
      if (res.ok) setStep('submitted')
      else setError(data.error || 'Failed to submit application')
    } catch { setError('Connection failed. Please try again.') }
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
          <span className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium">For Pediatricians</span>
        </div>
      </header>

      {step === 'info' && (
        <div className="max-w-3xl mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight mb-4">
              Intelligence that<br /><span className="text-green-600">augments your practice.</span>
            </h1>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">
              SKIDS Intelligence gives you AI-powered projections, evidence-based intervention protocols, and a connected care platform.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 mb-12">
            {[
              { icon: '🧠', title: 'Bayesian Condition Projections', desc: '150+ pediatric conditions with probability-adjusted projections from parent observations and screening data.' },
              { icon: '📋', title: 'Evidence-Based Protocols', desc: '52 intervention pathways across 3 tiers — from parent coaching to specialist referral to clinic investment.' },
              { icon: '👨‍👩‍👧', title: 'Connected Parents', desc: 'Parents arrive with structured data — observations, growth records, milestones — all in a Life Record.' },
              { icon: '📊', title: 'Between-Visit Surveillance', desc: 'Smart nudges prompt parents to observe. You get alerts when patterns emerge or escalation criteria are met.' },
              { icon: '🏥', title: 'Screening Integration', desc: 'SKIDS screening devices in your clinic flow directly into the intelligence engine.' },
              { icon: '💊', title: 'Protocol-Defined Products', desc: 'Evidence-graded recommendations integrated into intervention protocols. No ads — only science.' },
            ].map((item, i) => (
              <div key={i} className="flex gap-4 p-4 bg-gray-50 rounded-xl">
                <span className="text-2xl flex-shrink-0">{item.icon}</span>
                <div><h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3><p className="text-sm text-gray-500">{item.desc}</p></div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-6 text-center mb-12 bg-green-50 rounded-2xl p-8">
            <div><div className="text-3xl font-bold text-green-700">15,000+</div><div className="text-sm text-green-600 mt-1">Children Screened</div></div>
            <div><div className="text-3xl font-bold text-green-700">150+</div><div className="text-sm text-green-600 mt-1">Conditions Covered</div></div>
            <div><div className="text-3xl font-bold text-green-700">52</div><div className="text-sm text-green-600 mt-1">Intervention Pathways</div></div>
          </div>

          <div className="text-center">
            <button onClick={() => setStep('form')}
              className="px-8 py-4 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors text-lg shadow-lg shadow-green-200">
              Apply to Join — Free
            </button>
            <p className="text-xs text-gray-400 mt-3">Free during pilot. No commitments.</p>
          </div>
        </div>
      )}

      {step === 'form' && (
        <div className="max-w-lg mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Join SKIDS Intelligence</h2>
          <p className="text-gray-500 mb-8">Tell us about your practice. We'll review and onboard you within 48 hours.</p>
          <div className="space-y-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Dr. Priya Sharma" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 outline-none" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
              <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765 43210" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 outline-none" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="doctor@clinic.com" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 outline-none" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Clinic Name</label>
                <input type="text" value={form.clinic_name} onChange={e => setForm({ ...form, clinic_name: e.target.value })} placeholder="Happy Kids Clinic" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 outline-none" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input type="text" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 outline-none" /></div>
            </div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Clinic Address</label>
              <input type="text" value={form.clinic_address} onChange={e => setForm({ ...form, clinic_address: e.target.value })} placeholder="Full address" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 outline-none" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Specialty</label>
                <select value={form.specialty} onChange={e => setForm({ ...form, specialty: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 outline-none">
                  <option value="pediatrician">Pediatrician</option><option value="neonatologist">Neonatologist</option>
                  <option value="developmental_pediatrician">Developmental Pediatrician</option><option value="pediatric_neurologist">Pediatric Neurologist</option>
                  <option value="other">Other</option>
                </select></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Years Experience</label>
                <input type="number" value={form.experience_years} onChange={e => setForm({ ...form, experience_years: e.target.value })} placeholder="10" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 outline-none" /></div>
            </div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">License / Registration Number</label>
              <input type="text" value={form.license_number} onChange={e => setForm({ ...form, license_number: e.target.value })} placeholder="KMC/MCI number" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 outline-none" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Why do you want to join SKIDS?</label>
              <textarea value={form.motivation} onChange={e => setForm({ ...form, motivation: e.target.value })} placeholder="What excites you about AI-augmented pediatric care?" rows={3} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 outline-none resize-none" /></div>
          </div>
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          <div className="flex gap-3 mt-6">
            <button onClick={() => setStep('info')} className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200">Back</button>
            <button onClick={handleSubmit} disabled={loading} className="flex-1 px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 disabled:opacity-50">
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </div>
      )}

      {step === 'submitted' && (
        <div className="max-w-md mx-auto px-4 py-24 text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Application Received!</h1>
          <p className="text-gray-500 mb-8">Thank you, Dr. {form.name.split(' ').pop()}. We'll review your application and contact you within 48 hours.</p>
          <div className="bg-gray-50 rounded-2xl p-6 text-left">
            <h3 className="font-semibold text-gray-900 mb-3">What to expect:</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2"><span className="text-green-600 mt-0.5">✓</span> Verification call from SKIDS team</li>
              <li className="flex items-start gap-2"><span className="text-green-600 mt-0.5">✓</span> Demo of the intelligence engine</li>
              <li className="flex items-start gap-2"><span className="text-green-600 mt-0.5">✓</span> Access to your doctor dashboard</li>
              <li className="flex items-start gap-2"><span className="text-green-600 mt-0.5">✓</span> First pilot patients assigned from your area</li>
            </ul>
          </div>
          <a href="/" className="inline-block mt-8 text-sm text-green-600 hover:text-green-800 font-medium">Back to SKIDS</a>
        </div>
      )}

      <footer className="text-center py-8 text-xs text-gray-400">SKIDS Clinic Pvt. Ltd. · Bangalore, India</footer>
    </div>
  )
}
