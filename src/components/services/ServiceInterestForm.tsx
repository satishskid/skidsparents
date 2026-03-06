import { useState } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'

interface Props {
  interventionSlug: string
  status: 'available' | 'building'
  ctaLabel: string
  brand: string
}

const AGE_RANGES = [
  { value: '0-6', label: '0–6 months' },
  { value: '6-12', label: '6–12 months' },
  { value: '1-2', label: '1–2 years' },
  { value: '2-3', label: '2–3 years' },
  { value: '3-5', label: '3–5 years' },
  { value: '5-8', label: '5–8 years' },
  { value: '8-12', label: '8–12 years' },
  { value: '12+', label: '12+ years' },
]

export default function ServiceInterestForm({ interventionSlug, status, ctaLabel, brand }: Props) {
  const { user } = useAuth()
  const [name, setName] = useState(user?.displayName || '')
  const [phone, setPhone] = useState(user?.phoneNumber || '')
  const [ageRange, setAgeRange] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !phone.trim()) {
      setError('Please fill in your name and phone number')
      return
    }
    setSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand: 'skids',
          name: name.trim(),
          phone: phone.trim(),
          source: 'intervention_page',
          funnel_stage: status === 'available' ? 'intent' : 'interest',
          asset_code: interventionSlug,
          notes: `Interested in ${brand}. Child age: ${ageRange || 'not specified'}`,
          medium: 'organic',
          campaign: `skids_${interventionSlug}`,
        }),
      })
      if (res.ok) {
        setSubmitted(true)
      } else {
        setError('Something went wrong. Please try again.')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-200 text-center">
        <div className="text-4xl mb-3">🎉</div>
        <h3 className="text-lg font-bold text-gray-900">
          {status === 'available' ? 'We\'ll reach out shortly!' : 'You\'re on the list!'}
        </h3>
        <p className="mt-2 text-sm text-gray-600">
          {status === 'available'
            ? 'Our team will contact you on WhatsApp within 24 hours to schedule your appointment.'
            : `We'll notify you as soon as ${brand} is available. You'll be among the first to know!`}
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
      <h3 className="text-lg font-bold text-gray-900 mb-1">
        {status === 'available' ? ctaLabel : `Join the ${brand} Waitlist`}
      </h3>
      <p className="text-sm text-gray-500 mb-4">
        {status === 'available'
          ? 'Fill in your details and we\'ll reach out on WhatsApp.'
          : 'Be the first to know when this service launches.'}
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          required
        />
        <input
          type="tel"
          placeholder="Phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          required
        />
        <select
          value={ageRange}
          onChange={(e) => setAgeRange(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-700"
        >
          <option value="">Child's age (optional)</option>
          {AGE_RANGES.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          {submitting ? 'Submitting...' : status === 'available' ? ctaLabel : 'Join Waitlist'}
        </button>
      </form>
    </div>
  )
}
