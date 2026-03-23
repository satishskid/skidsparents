import { useState } from 'react'
import { analytics } from '@/lib/analytics/manager'

interface Step1Props {
  token: string
  onSuccess: (childId: string, name: string, ageMonths: number) => void
}

type Gender = 'Boy' | 'Girl' | 'Other' | null

function toDateString(d: Date): string {
  return d.toISOString().split('T')[0]
}

function getMinDate(): string {
  const d = new Date()
  d.setFullYear(d.getFullYear() - 16)
  return toDateString(d)
}

export default function Step1ChildForm({ token, onSuccess }: Step1Props) {
  const [name, setName] = useState('')
  const [dob, setDob] = useState('')
  const [gender, setGender] = useState<Gender>(null)
  const [nameError, setNameError] = useState('')
  const [dobError, setDobError] = useState('')
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)

  const today = toDateString(new Date())
  const minDate = getMinDate()
  const canSubmit = name.trim().length > 0 && dob !== ''

  const handleSubmit = async () => {
    setNameError('')
    setDobError('')
    setApiError('')

    if (!name.trim()) {
      setNameError("Please enter your child's name")
      return
    }
    if (!dob) {
      setDobError("Please enter your child's date of birth")
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/children', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          dob,
          ...(gender ? { gender } : {}),
        }),
      })

      if (!res.ok) {
        setApiError('Something went wrong. Please try again.')
        return
      }

      const data = (await res.json()) as { id: string }
      const dobDate = new Date(dob)
      const now = new Date()
      const ageMonths =
        (now.getFullYear() - dobDate.getFullYear()) * 12 +
        (now.getMonth() - dobDate.getMonth())

      analytics.trackEvent('onboarding_step_completed', { step: 1, childId: data.id })
      onSuccess(data.id, name.trim(), ageMonths)
    } catch {
      setApiError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const genderOptions: { label: NonNullable<Gender>; emoji: string }[] = [
    { label: 'Boy', emoji: '👦' },
    { label: 'Girl', emoji: '👧' },
    { label: 'Other', emoji: '🧒' },
  ]

  return (
    <div className="flex flex-col gap-4 p-6 overflow-y-auto h-full">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Add your child</h2>
        <p className="text-sm text-gray-500 mt-1">
          Let&apos;s personalise health tracking for your little one.
        </p>
      </div>

      {/* Name */}
      <div className="flex flex-col gap-1">
        <label htmlFor="child-name" className="text-sm font-medium text-gray-700">
          Child&apos;s name
        </label>
        <input
          id="child-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={50}
          placeholder="e.g. Arjun, Priya"
          aria-describedby={nameError ? 'name-error' : undefined}
          className="text-base border border-gray-200 rounded-xl px-4 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
        />
        {nameError && (
          <span id="name-error" role="alert" className="text-sm text-red-500">
            {nameError}
          </span>
        )}
      </div>

      {/* DOB */}
      <div className="flex flex-col gap-1">
        <label htmlFor="child-dob" className="text-sm font-medium text-gray-700">
          Date of birth
        </label>
        <input
          id="child-dob"
          type="date"
          value={dob}
          onChange={(e) => setDob(e.target.value)}
          min={minDate}
          max={today}
          aria-describedby={dobError ? 'dob-error' : undefined}
          className="text-base border border-gray-200 rounded-xl px-4 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
        />
        {dobError && (
          <span id="dob-error" role="alert" className="text-sm text-red-500">
            {dobError}
          </span>
        )}
      </div>

      {/* Gender */}
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-gray-700">Gender (optional)</span>
        <div className="flex gap-3">
          {genderOptions.map(({ label, emoji }) => (
            <button
              key={label}
              type="button"
              aria-label={label}
              aria-pressed={gender === label}
              onClick={() => setGender(gender === label ? null : label)}
              className={`flex-1 flex flex-col items-center justify-center gap-1 min-h-[44px] rounded-xl border-2 py-3 text-sm font-medium transition-colors ${
                gender === label
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
              }`}
            >
              <span className="text-xl">{emoji}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* API error */}
      {apiError && (
        <span role="alert" className="text-sm text-red-500">
          {apiError}
        </span>
      )}

      {/* CTA */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={!canSubmit || loading}
        className="bg-green-500 text-white rounded-xl py-3 px-6 font-semibold text-base w-full hover:bg-green-600 active:bg-green-700 transition-colors disabled:opacity-40 min-h-[44px] flex items-center justify-center gap-2 mt-auto"
      >
        {loading ? (
          <>
            <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
            <span>Saving&hellip;</span>
          </>
        ) : (
          'Continue'
        )}
      </button>
    </div>
  )
}
