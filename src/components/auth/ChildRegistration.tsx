import { useState } from 'react'

interface Props {
  token: string
  onComplete: () => void
  onClose: () => void
}

export default function ChildRegistration({ token, onComplete, onClose }: Props) {
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [dob, setDob] = useState('')
  const [gender, setGender] = useState('')
  const [allergies, setAllergies] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const today = new Date().toISOString().split('T')[0]

  async function handleSave() {
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/children', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          dob,
          gender: gender || undefined,
          allergies: allergies
            ? allergies.split(',').map((a) => a.trim()).filter(Boolean)
            : undefined,
        }),
      })
      if (res.ok) {
        onComplete()
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to save. Please try again.')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const steps = [
    // Step 0: Name
    <div key="name" className="space-y-4">
      <div className="text-center">
        <div className="text-3xl mb-2">👶</div>
        <h3 className="text-lg font-bold text-gray-900">What's your child's name?</h3>
      </div>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Child's name"
        autoFocus
        className="w-full px-4 py-3 rounded-xl border border-gray-300 text-center text-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
      />
      <button
        onClick={() => setStep(1)}
        disabled={!name.trim()}
        className="w-full py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
      >
        Next
      </button>
    </div>,

    // Step 1: DOB
    <div key="dob" className="space-y-4">
      <div className="text-center">
        <div className="text-3xl mb-2">🎂</div>
        <h3 className="text-lg font-bold text-gray-900">When was {name} born?</h3>
      </div>
      <input
        type="date"
        value={dob}
        onChange={(e) => setDob(e.target.value)}
        max={today}
        className="w-full px-4 py-3 rounded-xl border border-gray-300 text-center text-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
      />
      <div className="flex gap-3">
        <button onClick={() => setStep(0)} className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-600 font-medium hover:bg-gray-50">
          Back
        </button>
        <button
          onClick={() => setStep(2)}
          disabled={!dob}
          className="flex-1 py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>,

    // Step 2: Gender
    <div key="gender" className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-bold text-gray-900">Gender</h3>
        <p className="text-sm text-gray-500 mt-1">Optional — helps personalize milestones</p>
      </div>
      <div className="flex gap-3">
        {[
          { value: 'male', label: 'Boy', emoji: '👦' },
          { value: 'female', label: 'Girl', emoji: '👧' },
          { value: 'other', label: 'Other', emoji: '🧒' },
        ].map((g) => (
          <button
            key={g.value}
            onClick={() => setGender(g.value)}
            className={`flex-1 py-4 rounded-xl border-2 text-center transition-colors ${
              gender === g.value
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-2xl">{g.emoji}</div>
            <div className="text-sm font-medium mt-1">{g.label}</div>
          </button>
        ))}
      </div>
      <div className="flex gap-3">
        <button onClick={() => setStep(1)} className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-600 font-medium hover:bg-gray-50">
          Back
        </button>
        <button
          onClick={() => setStep(3)}
          className="flex-1 py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors"
        >
          {gender ? 'Next' : 'Skip'}
        </button>
      </div>
    </div>,

    // Step 3: Allergies + Save
    <div key="allergies" className="space-y-4">
      <div className="text-center">
        <div className="text-3xl mb-2">📋</div>
        <h3 className="text-lg font-bold text-gray-900">Any known conditions?</h3>
        <p className="text-sm text-gray-500 mt-1">Allergies, medical conditions (optional)</p>
      </div>
      <textarea
        value={allergies}
        onChange={(e) => setAllergies(e.target.value)}
        placeholder="e.g. peanut allergy, asthma (comma-separated)"
        rows={3}
        className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
      />
      {/* Summary */}
      <div className="bg-green-50 rounded-xl p-4 border border-green-100">
        <div className="text-xs font-semibold text-green-700 uppercase tracking-wider mb-2">Summary</div>
        <div className="text-sm text-gray-700 space-y-1">
          <div><span className="font-medium">Name:</span> {name}</div>
          <div><span className="font-medium">Born:</span> {dob ? new Date(dob).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}</div>
          {gender && <div><span className="font-medium">Gender:</span> {gender === 'male' ? 'Boy' : gender === 'female' ? 'Girl' : 'Other'}</div>}
          {allergies && <div><span className="font-medium">Notes:</span> {allergies}</div>}
        </div>
      </div>
      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-700">{error}</div>
      )}
      <div className="flex gap-3">
        <button onClick={() => setStep(2)} className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-600 font-medium hover:bg-gray-50">
          Back
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Child'}
        </button>
      </div>
    </div>,
  ]

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div
        className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md max-h-[90vh] overflow-y-auto p-6 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress */}
        <div className="flex gap-1.5 mb-6">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={`flex-1 h-1.5 rounded-full transition-colors ${i <= step ? 'bg-green-500' : 'bg-gray-200'}`} />
          ))}
        </div>

        {steps[step]}
      </div>
    </div>
  )
}
