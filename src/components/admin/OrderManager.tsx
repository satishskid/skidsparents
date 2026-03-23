import { useState, useEffect } from 'react'

interface Order {
  id: string
  status: string
  service_name: string
  provider_name: string
  child_name: string
  parent_name: string
  parent_phone: string
  amount_cents: number
  created_at: string
  scheduled_at: string
}

const STATUS_OPTIONS = ['pending', 'confirmed', 'scheduled', 'in_progress', 'completed', 'cancelled']

export default function OrderManager() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('')
  const [error, setError] = useState('')
  const [modal, setModal] = useState<{
    type: 'reassign' | 'status' | 'cancel'
    orderId: string
    currentStatus?: string
  } | null>(null)
  const [modalInput, setModalInput] = useState({ value: '', reason: '' })
  const [actionLoading, setActionLoading] = useState(false)

  const adminKey = window.__ADMIN_KEY || ''
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${adminKey}` }

  function loadOrders(status?: string) {
    setLoading(true)
    const params = new URLSearchParams()
    if (status) params.set('status', status)
    fetch(`/api/admin/orders?${params}`, { headers })
      .then(r => r.json())
      .then((d: any) => setOrders(d.orders || []))
      .catch(() => setError('Failed to load orders'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadOrders() }, [])

  async function submitModal() {
    if (!modal) return
    setActionLoading(true)
    try {
      let body: any = {}
      if (modal.type === 'reassign') body = { providerId: modalInput.value, reason: modalInput.reason }
      if (modal.type === 'status') body = { status: modalInput.value, reason: modalInput.reason }
      if (modal.type === 'cancel') body = { reason: modalInput.reason }

      const res = await fetch(`/api/admin/orders/${modal.orderId}/${modal.type}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const d = await res.json() as any
        throw new Error(d.error || 'Failed')
      }
      setModal(null)
      setModalInput({ value: '', reason: '' })
      loadOrders(filterStatus)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'An error occurred')
    } finally {
      setActionLoading(false)
    }
  }

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      scheduled: 'bg-purple-100 text-purple-800',
      in_progress: 'bg-orange-100 text-orange-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    }
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100'}`}>
        {status.replace('_', ' ')}
      </span>
    )
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Order Management</h2>
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm flex justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-red-400">✕</button>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <select
          value={filterStatus}
          onChange={e => { setFilterStatus(e.target.value); loadOrders(e.target.value) }}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="text-gray-500 py-8 text-center">Loading orders…</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Order</th>
                <th className="px-4 py-3 text-left">Service</th>
                <th className="px-4 py-3 text-left">Parent / Child</th>
                <th className="px-4 py-3 text-left">Provider</th>
                <th className="px-4 py-3 text-left">Amount</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map(o => (
                <tr key={o.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-mono text-xs text-gray-500">{o.id.slice(0, 8)}</div>
                    <div className="text-xs text-gray-400">{new Date(o.created_at).toLocaleDateString('en-IN')}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{o.service_name}</td>
                  <td className="px-4 py-3">
                    <div className="text-gray-800">{o.parent_name}</div>
                    <div className="text-xs text-gray-500">{o.child_name}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{o.provider_name || '—'}</td>
                  <td className="px-4 py-3 text-gray-700">
                    {o.amount_cents ? `₹${(o.amount_cents / 100).toLocaleString('en-IN')}` : '—'}
                  </td>
                  <td className="px-4 py-3">{statusBadge(o.status)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {['confirmed', 'scheduled'].includes(o.status) && (
                        <button
                          onClick={() => { setModal({ type: 'reassign', orderId: o.id }); setModalInput({ value: '', reason: '' }) }}
                          className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded hover:bg-blue-100"
                        >
                          Reassign
                        </button>
                      )}
                      {!['completed', 'cancelled'].includes(o.status) && (
                        <button
                          onClick={() => { setModal({ type: 'status', orderId: o.id, currentStatus: o.status }); setModalInput({ value: '', reason: '' }) }}
                          className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                        >
                          Status
                        </button>
                      )}
                      {['pending', 'confirmed', 'scheduled'].includes(o.status) && (
                        <button
                          onClick={() => { setModal({ type: 'cancel', orderId: o.id }); setModalInput({ value: '', reason: '' }) }}
                          className="text-xs px-2 py-1 bg-red-50 text-red-700 rounded hover:bg-red-100"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-400">No orders found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h3 className="font-semibold text-lg mb-4 capitalize">{modal.type} Order</h3>

            {modal.type === 'reassign' && (
              <div className="mb-3">
                <label className="block text-sm text-gray-600 mb-1">New Provider ID</label>
                <input
                  value={modalInput.value}
                  onChange={e => setModalInput(p => ({ ...p, value: e.target.value }))}
                  placeholder="Provider UUID"
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>
            )}

            {modal.type === 'status' && (
              <div className="mb-3">
                <label className="block text-sm text-gray-600 mb-1">New Status</label>
                <select
                  value={modalInput.value}
                  onChange={e => setModalInput(p => ({ ...p, value: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">Select status</option>
                  {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm text-gray-600 mb-1">
                Reason {modal.type === 'status' ? '(required)' : '(optional)'}
              </label>
              <textarea
                value={modalInput.reason}
                onChange={e => setModalInput(p => ({ ...p, reason: e.target.value }))}
                rows={2}
                className="w-full border rounded-lg px-3 py-2 text-sm resize-none"
              />
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setModal(null)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={submitModal}
                disabled={actionLoading}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {actionLoading ? 'Processing…' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
