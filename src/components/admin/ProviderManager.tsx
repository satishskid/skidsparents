import { useState, useEffect } from 'react'

interface Provider {
  id: string
  name: string
  type: string
  city: string
  status: string
  is_verified: number
  commission_pct: number
  contact_email: string
  contact_phone: string
  medical_reg_number: string
  order_count: number
  created_at: string
}

export default function ProviderManager() {
  const [providers, setProviders] = useState<Provider[]>([])
  const [loading, setLoading] = useState(true)
  const [editCommission, setEditCommission] = useState<{ id: string; value: string } | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [error, setError] = useState('')

  const adminKey = window.__ADMIN_KEY || ''

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${adminKey}`,
  }

  useEffect(() => {
    fetch('/api/admin/providers', { headers })
      .then(r => r.json())
      .then((d: any) => setProviders(d.providers || []))
      .catch(() => setError('Failed to load providers'))
      .finally(() => setLoading(false))
  }, [])

  async function doAction(id: string, action: 'approve' | 'suspend') {
    setActionLoading(`${id}-${action}`)
    try {
      const res = await fetch(`/api/admin/providers/${id}/${action}`, { method: 'POST', headers })
      if (!res.ok) throw new Error()
      setProviders(prev =>
        prev.map(p =>
          p.id === id
            ? { ...p, status: action === 'approve' ? 'active' : 'suspended', is_verified: action === 'approve' ? 1 : 0 }
            : p
        )
      )
    } catch {
      setError(`Failed to ${action} provider`)
    } finally {
      setActionLoading(null)
    }
  }

  async function saveCommission(id: string) {
    if (!editCommission) return
    const val = parseFloat(editCommission.value)
    if (isNaN(val) || val < 0 || val > 50) {
      setError('Commission must be 0–50')
      return
    }
    setActionLoading(`${id}-commission`)
    try {
      const res = await fetch(`/api/admin/providers/${id}/commission`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ commissionPct: val }),
      })
      if (!res.ok) throw new Error()
      setProviders(prev => prev.map(p => (p.id === id ? { ...p, commission_pct: val } : p)))
      setEditCommission(null)
    } catch {
      setError('Failed to update commission')
    } finally {
      setActionLoading(null)
    }
  }

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      pending_review: 'bg-yellow-100 text-yellow-800',
      suspended: 'bg-red-100 text-red-800',
    }
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-700'}`}>
        {status.replace('_', ' ')}
      </span>
    )
  }

  if (loading) return <div className="p-6 text-gray-500">Loading providers…</div>

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Provider Management</h2>
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>
      )}
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">City</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Commission %</th>
              <th className="px-4 py-3 text-left">Orders</th>
              <th className="px-4 py-3 text-left">Reg No.</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {providers.map(p => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">{p.name}</div>
                  <div className="text-xs text-gray-500">{p.contact_email}</div>
                </td>
                <td className="px-4 py-3 text-gray-600">{p.city || '—'}</td>
                <td className="px-4 py-3">{statusBadge(p.status)}</td>
                <td className="px-4 py-3">
                  {editCommission?.id === p.id ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min={0}
                        max={50}
                        value={editCommission.value}
                        onChange={e => setEditCommission({ id: p.id, value: e.target.value })}
                        className="w-16 border rounded px-1 py-0.5 text-sm"
                      />
                      <button
                        onClick={() => saveCommission(p.id)}
                        disabled={actionLoading === `${p.id}-commission`}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditCommission(null)}
                        className="text-xs text-gray-400 hover:underline"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setEditCommission({ id: p.id, value: String(p.commission_pct) })}
                      className="text-gray-700 hover:text-blue-600"
                    >
                      {p.commission_pct}%
                    </button>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-600">{p.order_count}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{p.medical_reg_number || '—'}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {p.status !== 'active' && (
                      <button
                        onClick={() => doAction(p.id, 'approve')}
                        disabled={!!actionLoading}
                        className="text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                      >
                        Approve
                      </button>
                    )}
                    {p.status !== 'suspended' && (
                      <button
                        onClick={() => doAction(p.id, 'suspend')}
                        disabled={!!actionLoading}
                        className="text-xs px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                      >
                        Suspend
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {providers.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                  No providers yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
