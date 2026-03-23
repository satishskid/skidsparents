import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'

interface Slot {
  id: string
  slot_type: 'recurring' | 'one_off' | 'blocked'
  day_of_week: number | null
  date: string | null
  start_time: string
  end_time: string
  service_id: string | null
  is_booked: number | boolean
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

interface AddSlotForm {
  slotType: 'recurring' | 'one_off' | 'blocked'
  dayOfWeek: number
  date: string
  startTime: string
  endTime: string
  serviceId: string
}

const DEFAULT_FORM: AddSlotForm = {
  slotType: 'recurring',
  dayOfWeek: 1,
  date: '',
  startTime: '09:00',
  endTime: '09:30',
  serviceId: '',
}

export default function AvailabilityManager() {
  const { token, loading: authLoading } = useAuth()
  const [slots, setSlots] = useState<Slot[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState<AddSlotForm>(DEFAULT_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const authH = () => ({ Authorization: `Bearer ${token}` })

  useEffect(() => {
    if (authLoading || !token) return
    fetch('/api/provider/slots', { headers: authH() })
      .then(r => r.json() as Promise<{ slots: Slot[] }>)
      .then(d => setSlots(d.slots || []))
      .catch(() => setError('Failed to load slots'))
      .finally(() => setLoading(false))
  }, [token, authLoading])

  const addSlot = async () => {
    if (submitting) return
    setSubmitting(true)
    try {
      const body: Record<string, any> = {
        slotType: form.slotType,
        startTime: form.startTime,
        endTime: form.endTime,
      }
      if (form.slotType === 'recurring') body.dayOfWeek = form.dayOfWeek
      if (form.slotType === 'one_off') body.date = form.date
      if (form.serviceId) body.serviceId = form.serviceId

      const res = await fetch('/api/provider/slots', {
        method: 'POST',
        headers: { ...authH(), 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const d = await res.json() as { slotId?: string; error?: string }
      if (!res.ok) throw new Error(d.error || 'Failed to create slot')

      const newSlot: Slot = {
        id: d.slotId!,
        slot_type: form.slotType,
        day_of_week: form.slotType === 'recurring' ? form.dayOfWeek : null,
        date: form.slotType === 'one_off' ? form.date : null,
        start_time: form.startTime,
        end_time: form.endTime,
        service_id: form.serviceId || null,
        is_booked: false,
      }
      setSlots(prev => [newSlot, ...prev])
      setShowModal(false)
      setForm(DEFAULT_FORM)
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'An error occurred')
    } finally {
      setSubmitting(false)
    }
  }

  const deleteSlot = async (slotId: string) => {
    if (!confirm('Delete this slot?')) return
    try {
      const res = await fetch(`/api/provider/slots/${slotId}`, {
        method: 'DELETE',
        headers: authH(),
      })
      const d = await res.json() as { error?: string }
      if (!res.ok) throw new Error(d.error || 'Failed to delete slot')
      setSlots(prev => prev.filter(s => s.id !== slotId))
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'An error occurred')
    }
  }

  const slotColor = (slot: Slot) => {
    if (slot.slot_type === 'blocked') return 'bg-gray-100 border-gray-200 text-gray-500'
    if (slot.is_booked) return 'bg-blue-50 border-blue-200 text-blue-700'
    return 'bg-green-50 border-green-200 text-green-700'
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Group recurring slots by day
  const byDay = DAYS.map((day, idx) => ({
    day,
    idx,
    slots: slots.filter(s => s.slot_type === 'recurring' && s.day_of_week === idx),
  }))

  const oneOffSlots = slots.filter(s => s.slot_type !== 'recurring')

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold text-gray-900">Availability</h1>
          <p className="text-xs text-gray-500 mt-0.5">Manage your weekly slots</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors"
        >
          + Add Slot
        </button>
      </div>

      {error && <p className="text-red-500 text-sm px-4 py-3">{error}</p>}

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Weekly grid */}
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Weekly Schedule</h2>
          <div className="grid grid-cols-7 gap-1">
            {byDay.map(({ day, idx, slots: daySlots }) => (
              <div key={idx} className="min-h-20">
                <p className="text-xs font-semibold text-gray-500 text-center mb-1">{day}</p>
                <div className="space-y-1">
                  {daySlots.map(slot => (
                    <div
                      key={slot.id}
                      className={`rounded-lg border px-1 py-1.5 text-center relative group ${slotColor(slot)}`}
                    >
                      <p className="text-[10px] font-semibold leading-tight">{slot.start_time}</p>
                      <p className="text-[9px] opacity-70">{slot.end_time}</p>
                      {!slot.is_booked && slot.slot_type !== 'blocked' && (
                        <button
                          onClick={() => deleteSlot(slot.id)}
                          className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[9px] hidden group-hover:flex items-center justify-center"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                  {daySlots.length === 0 && (
                    <button
                      onClick={() => { setForm({ ...DEFAULT_FORM, dayOfWeek: idx }); setShowModal(true) }}
                      className="w-full h-10 rounded-lg border border-dashed border-gray-200 text-gray-300 text-lg hover:border-green-400 hover:text-green-400 transition-colors"
                    >
                      +
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* One-off / blocked slots */}
        {oneOffSlots.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">One-off & Blocked</h2>
            <div className="space-y-2">
              {oneOffSlots.map(slot => (
                <div key={slot.id} className={`flex items-center justify-between rounded-xl border px-4 py-3 ${slotColor(slot)}`}>
                  <div>
                    <p className="text-sm font-semibold">{slot.date} · {slot.start_time}–{slot.end_time}</p>
                    <p className="text-xs opacity-70 capitalize">{slot.slot_type.replace('_', ' ')}</p>
                  </div>
                  {!slot.is_booked && (
                    <button
                      onClick={() => deleteSlot(slot.id)}
                      className="text-xs text-red-500 hover:text-red-700 font-semibold"
                    >
                      Delete
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {slots.length === 0 && (
          <div className="text-center py-16 text-gray-400 text-sm">No slots yet. Add your first slot.</div>
        )}
      </div>

      {/* Add slot modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-5 space-y-4">
            <h3 className="text-base font-bold text-gray-900">Add Slot</h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">Type</label>
                <select
                  value={form.slotType}
                  onChange={e => setForm(f => ({ ...f, slotType: e.target.value as AddSlotForm['slotType'] }))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="recurring">Recurring (weekly)</option>
                  <option value="one_off">One-off</option>
                  <option value="blocked">Blocked</option>
                </select>
              </div>

              {form.slotType === 'recurring' && (
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1">Day of Week</label>
                  <select
                    value={form.dayOfWeek}
                    onChange={e => setForm(f => ({ ...f, dayOfWeek: Number(e.target.value) }))}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    {DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
                  </select>
                </div>
              )}

              {form.slotType !== 'recurring' && (
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1">Date</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1">Start Time</label>
                  <input
                    type="time"
                    value={form.startTime}
                    onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1">End Time</label>
                  <input
                    type="time"
                    value={form.endTime}
                    onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button
                onClick={() => { setShowModal(false); setForm(DEFAULT_FORM) }}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={addSlot}
                disabled={submitting}
                className="flex-1 py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {submitting ? 'Adding...' : 'Add Slot'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
