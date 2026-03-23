import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'

interface Order {
  id: string
  service_name: string
  child_name: string
  child_id: string
  scheduled_at: string | null
  status: string
  category: string
}

interface PhrData {
  child: { name: string; dob: string; gender: string; blood_group: string; allergies_json: string | null }
  latestGrowth: { height_cm: number; weight_kg: number; date: string } | null
  milestones: { title: string; status: string }[]
  vaccinations: { vaccine_name: string; next_due: string | null }[]
  flaggedObservations: { observation_text: string; concern_level: string; date: string }[]
}

interface Note {
  id: string
  note_text: string
  created_at: string
}

interface Props {
  orderId: string
}

const STATUS_COLORS: Record<string, string> = {
  scheduled: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-yellow-100 text-yellow-700',
  pending: 'bg-gray-100 text-gray-600',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-600',
}

export default function OrderDetail({ orderId }: Props) {
  const { token, loading: authLoading } = useAuth()
  const [order, setOrder] = useState<Order | null>(null)
  const [phr, setPhr] = useState<PhrData | null>(null)
  const [notes, setNotes] = useState<Note[]>([])
  const [noteText, setNoteText] = useState('')
  const [noteSubmitting, setNoteSubmitting] = useState(false)
  const [completing, setCompleting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const headers = () => ({ Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' })

  useEffect(() => {
    if (authLoading || !token) return

    const authH = { Authorization: `Bearer ${token}` }

    fetch('/api/provider/orders', { headers: authH })
      .then(r => r.json() as Promise<{ orders: Order[] }>)
      .then(data => {
        const found = data.orders?.find(o => o.id === orderId) || null
        setOrder(found)
        if (found?.child_id) {
          return fetch(`/api/provider/phr/${found.child_id}`, { headers: authH })
            .then(r => r.ok ? r.json() as Promise<PhrData> : null)
            .then(phrData => { if (phrData) setPhr(phrData) })
        }
      })
      .catch(() => setError('Failed to load order'))
      .finally(() => setLoading(false))
  }, [token, authLoading, orderId])

  const addNote = async () => {
    if (!noteText.trim() || noteSubmitting) return
    setNoteSubmitting(true)
    try {
      const res = await fetch(`/api/provider/orders/${orderId}/note`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ noteText: noteText.trim() }),
      })
      if (!res.ok) {
        const d = await res.json() as { error?: string }
        throw new Error(d.error || 'Failed to add note')
      }
      const newNote: Note = {
        id: crypto.randomUUID(),
        note_text: noteText.trim(),
        created_at: new Date().toISOString(),
      }
      setNotes(prev => [newNote, ...prev])
      setNoteText('')
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Failed to add note')
    } finally {
      setNoteSubmitting(false)
    }
  }

  const completeOrder = async () => {
    if (completing) return
    if (!confirm('Mark this order as completed?')) return
    setCompleting(true)
    try {
      const res = await fetch(`/api/provider/orders/${orderId}/complete`, {
        method: 'POST',
        headers: headers(),
      })
      const d = await res.json() as { error?: string }
      if (!res.ok) throw new Error(d.error || 'Failed to complete order')
      setOrder(prev => prev ? { ...prev, status: 'completed' } : prev)
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Failed to complete order')
    } finally {
      setCompleting(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-red-500 text-sm">{error || 'Order not found'}</p>
        <a href="/provider" className="text-sm text-green-600 underline">Back to dashboard</a>
      </div>
    )
  }

  const canComplete = order.status === 'in_progress' && notes.length > 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 flex items-center gap-3">
        <a href="/provider" className="text-gray-400 hover:text-gray-600 text-lg">←</a>
        <div className="min-w-0">
          <h1 className="text-base font-bold text-gray-900 truncate">{order.service_name}</h1>
          <p className="text-xs text-gray-500">{order.child_name}</p>
        </div>
        <span className={`ml-auto shrink-0 text-xs font-semibold px-2 py-1 rounded-full ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
          {order.status.replace('_', ' ')}
        </span>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {/* Patient context */}
        {phr && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3">
            <h2 className="text-sm font-semibold text-gray-700">Patient Context</h2>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
              <div><span className="text-gray-400">DOB</span><br />{phr.child?.dob}</div>
              <div><span className="text-gray-400">Blood Group</span><br />{phr.child?.blood_group || '—'}</div>
              {phr.latestGrowth && (
                <>
                  <div><span className="text-gray-400">Weight</span><br />{phr.latestGrowth.weight_kg} kg</div>
                  <div><span className="text-gray-400">Height</span><br />{phr.latestGrowth.height_cm} cm</div>
                </>
              )}
            </div>
            {phr.flaggedObservations.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-red-600 mb-1">Flagged Observations</p>
                <ul className="space-y-1">
                  {phr.flaggedObservations.map((obs, i) => (
                    <li key={i} className="text-xs text-gray-700 bg-red-50 rounded-lg px-3 py-2">
                      <span className="font-medium capitalize">{obs.concern_level}</span> — {obs.observation_text}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {phr.milestones.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-amber-600 mb-1">Milestone Concerns</p>
                <ul className="space-y-1">
                  {phr.milestones.map((m, i) => (
                    <li key={i} className="text-xs text-gray-700 flex gap-2">
                      <span className={m.status === 'delayed' ? 'text-red-500' : 'text-amber-500'}>●</span>
                      {m.title}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3">
          {order.status === 'scheduled' && (
            <a
              href={`/provider/orders/${orderId}/session`}
              className="flex-1 py-3 rounded-xl bg-green-600 text-white text-sm font-semibold text-center hover:bg-green-700 transition-colors"
            >
              Start Session
            </a>
          )}
          {canComplete && (
            <button
              onClick={completeOrder}
              disabled={completing}
              className="flex-1 py-3 rounded-xl bg-gray-800 text-white text-sm font-semibold hover:bg-gray-900 disabled:opacity-50 transition-colors"
            >
              {completing ? 'Completing...' : 'Complete Order'}
            </button>
          )}
        </div>

        {/* Session note form */}
        {(order.status === 'in_progress' || order.status === 'completed') && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3">
            <h2 className="text-sm font-semibold text-gray-700">Session Notes</h2>
            <textarea
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
              placeholder="Add a clinical note..."
              rows={3}
              className="w-full px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              onClick={addNote}
              disabled={noteSubmitting || !noteText.trim()}
              className="w-full py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {noteSubmitting ? 'Adding...' : 'Add Note'}
            </button>

            {notes.length > 0 && (
              <ul className="space-y-2 pt-1">
                {notes.map(note => (
                  <li key={note.id} className="bg-gray-50 rounded-xl px-3 py-2.5">
                    <p className="text-sm text-gray-700">{note.note_text}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(note.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
