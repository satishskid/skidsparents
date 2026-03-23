import { useState } from 'react'

interface Props {
  variant?: 'parent' | 'provider'
  heading?: string
  subheading?: string
}

export default function LeadCaptureForm({
  variant = 'parent',
  heading,
  subheading,
}: Props) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  function getUtmParams(): Record<string, string> {
    const params: Record<string, string> = {}
    if (typeof window === 'undefined') return params
    const search = new URLSearchParams(window.location.search)
    for (const [k, v] of search.entries()) {
      if (k.startsWith('utm_')) params[k] = v
    }
    // Ensure brand UTM defaults
    if (!params.utm_source) params.utm_source = 'skids_clinic'
    if (!params.utm_campaign) {
      params.utm_campaign = variant === 'provider' ? 'skids_provider_cta' : 'skids_parent_cta'
    }
    return params
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const digits = phone.replace(/\D/g, '').replace(/^91/, '')
    if (digits.length !== 10) {
      setError('Please enter a valid 10-digit mobile number')
      return
    }

    setLoading(true)
    try {
      const utms = getUtmParams()
      const res = await fetch('https://parent.skids.clinic/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: digits,
          brand: 'skids',
          source: 'skids_clinic',
          ...utms,
        }),
      })

      if (!res.ok) throw new Error('Failed to submit')

      setDone(true)

      // Redirect with UTM params preserved
      const utmStr = new URLSearchParams(utms).toString()
      const dest =
        variant === 'provider'
          ? `https://parent.skids.clinic/provider/signup?${utmStr}`
          : `https://parent.skids.clinic?${utmStr}`

      setTimeout(() => { window.location.href = dest }, 1500)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const defaultHeading =
    variant === 'provider' ? 'Join as a SKIDS Provider' : 'Start your child\'s health journey'
  const defaultSub =
    variant === 'provider'
      ? 'Reach verified patients. Set your own schedule.'
      : 'Free PHR + AI health companion for your child.'

  if (done) {
    return (
      <div className="text-center py-6">
        <div className="text-4xl mb-3">🎉</div>
        <p className="font-semibold text-gray-800">You're in!</p>
        <p className="text-sm text-gray-500 mt-1">Taking you to SKIDS…</p>
      </div>
    )
  }

  return (
    <div>
      {(heading || defaultHeading) && (
        <h3 className="text-xl font-bold text-gray-900 mb-1">{heading || defaultHeading}</h3>
      )}
      {(subheading || defaultSub) && (
        <p className="text-sm text-gray-500 mb-4">{subheading || defaultSub}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
          <span className="px-3 py-3 bg-gray-50 text-sm text-gray-500 border-r border-gray-300">+91</span>
          <input
            type="tel"
            placeholder="10-digit mobile number"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            required
            maxLength={10}
            inputMode="numeric"
            className="flex-1 px-3 py-3 text-sm focus:outline-none"
          />
        </div>

        {error && <p className="text-xs text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl font-semibold text-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 transition-colors"
        >
          {loading ? 'Submitting…' : variant === 'provider' ? 'Apply to Join' : 'Get Started Free'}
        </button>

        <p className="text-xs text-center text-gray-400">
          No spam. No app download needed.
        </p>
      </form>
    </div>
  )
}
