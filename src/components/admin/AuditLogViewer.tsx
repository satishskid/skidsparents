import { useState, useEffect } from 'react'

interface AuditEntry {
  id: string
  actor_id: string
  action_type: string
  target_type: string
  target_id: string
  previous_value_json: string | null
  new_value_json: string | null
  reason: string | null
  created_at: string
}

const ACTION_TYPES = [
  'provider_approved', 'provider_suspended', 'commission_updated',
  'order_reassigned', 'order_status_updated', 'order_cancelled',
  'refund_issued', 'phr_access_denied',
]

export default function AuditLogViewer() {
  const [entries, setEntries] = useState<AuditEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [filters, setFilters] = useState({ actionType: '', targetType: '', from: '', to: '' })

  const adminKey = window.__ADMIN_KEY || ''
  const headers = { Authorization: `Bearer ${adminKey}` }

  function load() {
    setLoading(true)
    const params = new URLSearchParams()
    if (filters.actionType) params.set('actionType', filters.actionType)
    if (filters.targetType) params.set('targetType', filters.targetType)
    if (filters.from) params.set('from', filters.from)
    if (filters.to) params.set('to', filters.to)
    fetch(`/api/admin/audit-log?${params}`, { headers })
      .then(r => r.json())
      .then((d: any) => setEntries(d.entries || []))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const actionColor: Record<string, string> = {
    provider_approved: 'bg-green-100 text-green-800',
    provider_suspended: 'bg-red-100 text-red-800',
    commission_updated: 'bg-blue-100 text-blue-800',
    order_reassigned: 'bg-purple-100 text-purple-800',
    order_status_updated: 'bg-yellow-100 text-yellow-800',
    order_cancelled: 'bg-red-100 text-red-800',
    refund_issued: 'bg-orange-100 text-orange-800',
    phr_access_denied: 'bg-gray-100 text-gray-700',
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Audit Log</h2>

      {/* Filters */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <select
          value={filters.actionType}
          onChange={e => setFilters(p => ({ ...p, actionType: e.target.value }))}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option value="">All actions</option>
          {ACTION_TYPES.map(a => <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>)}
        </select>
        <select
          value={filters.targetType}
          onChange={e => setFilters(p => ({ ...p, targetType: e.target.value }))}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option value="">All targets</option>
          <option value="provider">Provider</option>
          <option value="order">Order</option>
          <option value="phr">PHR</option>
        </select>
        <input
          type="date"
          value={filters.from}
          onChange={e => setFilters(p => ({ ...p, from: e.target.value }))}
          className="border rounded-lg px-3 py-2 text-sm"
        />
        <input
          type="date"
          value={filters.to}
          onChange={e => setFilters(p => ({ ...p, to: e.target.value }))}
          className="border rounded-lg px-3 py-2 text-sm"
        />
        <button
          onClick={load}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Filter
        </button>
      </div>

      {loading ? (
        <div className="text-gray-500 py-8 text-center">Loading audit log…</div>
      ) : (
        <div className="space-y-2">
          {entries.map(e => (
            <div key={e.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <button
                onClick={() => setExpanded(expanded === e.id ? null : e.id)}
                className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-gray-50"
              >
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${actionColor[e.action_type] || 'bg-gray-100 text-gray-700'}`}>
                  {e.action_type.replace(/_/g, ' ')}
                </span>
                <span className="text-sm text-gray-600 capitalize">{e.target_type}</span>
                <span className="text-xs font-mono text-gray-400">{e.target_id.slice(0, 8)}</span>
                <span className="ml-auto text-xs text-gray-400">
                  {new Date(e.created_at).toLocaleString('en-IN')}
                </span>
                <span className="text-gray-400 text-xs">{expanded === e.id ? '▲' : '▼'}</span>
              </button>

              {expanded === e.id && (
                <div className="px-4 pb-4 border-t border-gray-100 text-xs space-y-2 pt-3">
                  <div><span className="text-gray-500">Actor:</span> <span className="font-mono">{e.actor_id}</span></div>
                  {e.reason && <div><span className="text-gray-500">Reason:</span> {e.reason}</div>}
                  {e.previous_value_json && (
                    <div>
                      <span className="text-gray-500">Before:</span>
                      <pre className="mt-1 bg-gray-50 rounded p-2 overflow-x-auto">
                        {JSON.stringify(JSON.parse(e.previous_value_json), null, 2)}
                      </pre>
                    </div>
                  )}
                  {e.new_value_json && (
                    <div>
                      <span className="text-gray-500">After:</span>
                      <pre className="mt-1 bg-gray-50 rounded p-2 overflow-x-auto">
                        {JSON.stringify(JSON.parse(e.new_value_json), null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          {entries.length === 0 && (
            <div className="text-center text-gray-400 py-8">No audit entries found</div>
          )}
        </div>
      )}
    </div>
  )
}
