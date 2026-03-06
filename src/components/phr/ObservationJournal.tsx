import { useState, useEffect, useCallback } from 'react'

interface Observation {
  id: string
  date: string
  category?: string
  observation_text: string
  concern_level: string
}

interface Props {
  childId: string
  token: string
}

const CONCERN_LEVELS = [
  { value: 'none', label: 'Just noting', color: 'bg-gray-100 text-gray-600' },
  { value: 'mild', label: 'Mild concern', color: 'bg-amber-50 text-amber-700' },
  { value: 'moderate', label: 'Moderate', color: 'bg-orange-50 text-orange-700' },
  { value: 'serious', label: 'Serious', color: 'bg-red-50 text-red-700' },
]

const CATEGORIES = ['General', 'Behavior', 'Health', 'Sleep', 'Eating', 'Development', 'School']

export default function ObservationJournal({ childId, token }: Props) {
  const [observations, setObservations] = useState<Observation[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    text: '',
    category: 'General',
    concernLevel: 'none',
  })

  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }

  const fetchObservations = useCallback(async () => {
    try {
      const res = await fetch(`/api/observations?childId=${childId}`, { headers: { Authorization: `Bearer ${token}` } })
      if (res.ok) {
        const data = await res.json()
        setObservations(data.observations || [])
      }
    } catch {} finally {
      setLoading(false)
    }
  }, [childId, token])

  useEffect(() => { fetchObservations() }, [fetchObservations])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.text.trim()) return
    setSaving(true)
    try {
      await fetch('/api/observations', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          childId,
          observationText: form.text.trim(),
          category: form.category,
          concernLevel: form.concernLevel,
        }),
      })
      setForm({ text: '', category: 'General', concernLevel: 'none' })
      setShowForm(false)
      await fetchObservations()
    } catch {} finally {
      setSaving(false)
    }
  }

  function formatDate(d: string): string {
    return new Date(d + 'T12:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
  }

  function getConcernBadge(level: string) {
    const l = CONCERN_LEVELS.find((c) => c.value === level)
    if (!l || l.value === 'none') return null
    return <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${l.color}`}>{l.label}</span>
  }

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="bg-white rounded-xl p-4 animate-pulse h-16" />
        <div className="bg-white rounded-xl p-4 animate-pulse h-16" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Add Note Button */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full py-3 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors"
        >
          + Add Observation
        </button>
      )}

      {/* Add Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700">New Observation</h3>
            <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">What did you observe?</label>
            <textarea
              value={form.text}
              onChange={(e) => setForm({ ...form, text: e.target.value })}
              placeholder="E.g., Started saying two-word phrases today! Said 'more milk' at breakfast."
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-green-400 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Category</label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setForm({ ...form, category: cat })}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    form.category === cat
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : 'bg-gray-50 text-gray-600 border border-gray-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Concern Level</label>
            <div className="flex gap-1.5">
              {CONCERN_LEVELS.map((level) => (
                <button
                  key={level.value}
                  type="button"
                  onClick={() => setForm({ ...form, concernLevel: level.value })}
                  className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                    form.concernLevel === level.value
                      ? `${level.color} border-current`
                      : 'bg-gray-50 text-gray-500 border-gray-100'
                  }`}
                >
                  {level.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={saving || !form.text.trim()}
            className="w-full py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Observation'}
          </button>
        </form>
      )}

      {/* Observations List */}
      {observations.length > 0 ? (
        <div className="space-y-2">
          {observations.map((obs) => (
            <div key={obs.id} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-gray-400">{formatDate(obs.date)}</span>
                {obs.category && <span className="text-[10px] font-medium text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded">{obs.category}</span>}
                {getConcernBadge(obs.concern_level)}
              </div>
              <p className="text-sm text-gray-800">{obs.observation_text}</p>
            </div>
          ))}
        </div>
      ) : !showForm && (
        <div className="bg-white rounded-xl p-6 border border-gray-100 text-center">
          <div className="text-2xl mb-2">📝</div>
          <p className="text-sm text-gray-500">No observations yet. Start documenting your child's journey!</p>
        </div>
      )}
    </div>
  )
}
