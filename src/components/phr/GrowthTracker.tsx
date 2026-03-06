import { useState, useEffect, useCallback } from 'react'

interface GrowthRecord {
  id: string
  date: string
  height_cm?: number
  weight_kg?: number
  head_circ_cm?: number
  bmi?: number
}

interface Props {
  childId: string
  token: string
}

export default function GrowthTracker({ childId, token }: Props) {
  const [records, setRecords] = useState<GrowthRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ date: new Date().toISOString().split('T')[0], heightCm: '', weightKg: '', headCircCm: '' })

  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }

  const fetchRecords = useCallback(async () => {
    try {
      const res = await fetch(`/api/growth?childId=${childId}`, { headers: { Authorization: `Bearer ${token}` } })
      if (res.ok) {
        const data = await res.json()
        setRecords(data.records || [])
      }
    } catch {} finally {
      setLoading(false)
    }
  }, [childId, token])

  useEffect(() => { fetchRecords() }, [fetchRecords])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.heightCm && !form.weightKg && !form.headCircCm) return
    setSaving(true)
    try {
      await fetch('/api/growth', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          childId,
          date: form.date,
          heightCm: form.heightCm ? parseFloat(form.heightCm) : undefined,
          weightKg: form.weightKg ? parseFloat(form.weightKg) : undefined,
          headCircCm: form.headCircCm ? parseFloat(form.headCircCm) : undefined,
        }),
      })
      setForm({ date: new Date().toISOString().split('T')[0], heightCm: '', weightKg: '', headCircCm: '' })
      setShowForm(false)
      await fetchRecords()
    } catch {} finally {
      setSaving(false)
    }
  }

  function formatDate(d: string): string {
    return new Date(d + 'T12:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })
  }

  // Simple trend: get latest and previous to show change
  const latest = records[0]
  const previous = records[1]

  function trendIcon(current?: number, prev?: number): string {
    if (!current || !prev) return ''
    if (current > prev) return '↑'
    if (current < prev) return '↓'
    return '→'
  }

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="bg-white rounded-xl p-4 animate-pulse h-24" />
        <div className="bg-white rounded-xl p-4 animate-pulse h-32" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Latest Stats */}
      {latest ? (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm text-center">
            <div className="text-[10px] text-gray-400 uppercase font-medium mb-1">Height</div>
            <div className="text-xl font-bold text-blue-600">
              {latest.height_cm || '—'}
              {latest.height_cm && <span className="text-xs font-normal text-gray-400"> cm</span>}
            </div>
            {previous?.height_cm && latest.height_cm && (
              <div className="text-[10px] text-gray-400 mt-0.5">
                {trendIcon(latest.height_cm, previous.height_cm)} {Math.abs(latest.height_cm - previous.height_cm).toFixed(1)}cm
              </div>
            )}
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm text-center">
            <div className="text-[10px] text-gray-400 uppercase font-medium mb-1">Weight</div>
            <div className="text-xl font-bold text-green-600">
              {latest.weight_kg || '—'}
              {latest.weight_kg && <span className="text-xs font-normal text-gray-400"> kg</span>}
            </div>
            {previous?.weight_kg && latest.weight_kg && (
              <div className="text-[10px] text-gray-400 mt-0.5">
                {trendIcon(latest.weight_kg, previous.weight_kg)} {Math.abs(latest.weight_kg - previous.weight_kg).toFixed(1)}kg
              </div>
            )}
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm text-center">
            <div className="text-[10px] text-gray-400 uppercase font-medium mb-1">BMI</div>
            <div className="text-xl font-bold text-purple-600">
              {latest.bmi || '—'}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl p-6 border border-gray-100 text-center">
          <div className="text-2xl mb-2">📏</div>
          <p className="text-sm text-gray-500">No growth records yet. Add the first measurement!</p>
        </div>
      )}

      {/* Add Measurement Button */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full py-3 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors"
        >
          + Add Measurement
        </button>
      )}

      {/* Add Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700">New Measurement</h3>
            <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Date</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-green-400"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Height (cm)</label>
              <input
                type="number"
                step="0.1"
                placeholder="75.5"
                value={form.heightCm}
                onChange={(e) => setForm({ ...form, heightCm: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-green-400"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                placeholder="9.5"
                value={form.weightKg}
                onChange={(e) => setForm({ ...form, weightKg: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-green-400"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Head (cm)</label>
              <input
                type="number"
                step="0.1"
                placeholder="44.0"
                value={form.headCircCm}
                onChange={(e) => setForm({ ...form, headCircCm: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-green-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving || (!form.heightCm && !form.weightKg && !form.headCircCm)}
            className="w-full py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Measurement'}
          </button>
        </form>
      )}

      {/* History */}
      {records.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-5 pt-4 pb-2">History</h3>
          <div className="divide-y divide-gray-50">
            {records.map((r) => (
              <div key={r.id} className="px-5 py-3 flex items-center gap-4">
                <span className="text-xs text-gray-400 w-16 shrink-0">{formatDate(r.date)}</span>
                <div className="flex gap-3 text-xs">
                  {r.height_cm && <span className="text-blue-600 font-medium">{r.height_cm} cm</span>}
                  {r.weight_kg && <span className="text-green-600 font-medium">{r.weight_kg} kg</span>}
                  {r.head_circ_cm && <span className="text-amber-600 font-medium">{r.head_circ_cm} cm hc</span>}
                  {r.bmi && <span className="text-purple-600 font-medium">BMI {r.bmi}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
