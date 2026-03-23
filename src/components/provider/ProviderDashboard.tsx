import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'

interface Order {
  id: string
  service_name: string
  child_name: string
  scheduled_at: string | null
  status: string
  category: string
}

interface Earnings {
  totalSessions: number
  grossEarnings: number
  totalCommission: number
  netPayout: number
}

interface Provider {
  status: string
  name: string
}

const STATUS_GROUPS = ['scheduled', 'in_progress', 'pending', 'completed'] as const
const STATUS_LABELS: Record<string, string> = {
  scheduled: 'Scheduled',
  in_progress: 'In Progress',
  pending: 'Pending',
  completed: 'Completed',
}
const STATUS_COLORS: Record<string, string> = {
  scheduled: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-yellow-100 text-yellow-700',
  pending: 'bg-gray-100 text-gray-600',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-600',
}

function fmt(paise: number) {
  return `₹${(paise / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
}

export default function ProviderDashboard() {
  const { token, loading: authLoading } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [earnings, setEarnings] = useState<Earnings | null>(null)
  const [provider, setProvider] = useState<Provider | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (authLoading || !token) return
    const headers = { Authorization: `Bearer ${token}` }

    Promise.all([
      fetch('/api/provider/orders', { headers }).then(r => r.json()),
      fetch('/api/provider/earnings', { headers }).then(r => r.json()),
      fetch('/api/provider/me', { headers }).then(r => r.json()),
    ])
      .then(([ordersData, earningsData, meData]: any[]) => {
        setOrders(ordersData.orders || [])
        setEarnings(earningsData)
        setProvider(meData.provider || null)
      })
      .catch(() => setError('Failed to load dashboard'))
      .finally(() => setLoading(false))
  }, [token, authLoading])

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <p className="text-red-500 text-sm">{error}</p>
      </div>
    )
  }

  const grouped = STATUS_GROUPS.reduce<Record<string, Order[]>>((acc, s) => {
    acc[s] = orders.filter(o => o.status === s)
    return acc
  }, {} as Record<string, Order[]>)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <h1 className="text-lg font-bold text-gray-900">skids Provider Portal</h1>
        {provider && <p className="text-sm text-gray-500 mt-0.5">{provider.name}</p>}
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Pending review banner */}
        {provider?.status === 'pending_review' && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
            Your account is under review. You'll be notified once approved.
          </div>
        )}

        {/* Earnings summary */}
        {earnings && (
          <div>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Earnings</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Total Sessions', value: String(earnings.totalSessions) },
                { label: 'Gross', value: fmt(earnings.grossEarnings) },
                { label: 'Commission', value: fmt(earnings.totalCommission) },
                { label: 'Net Payout', value: fmt(earnings.netPayout) },
              ].map(stat => (
                <div key={stat.label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                  <p className="text-xs text-gray-500">{stat.label}</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Order sections */}
        {STATUS_GROUPS.map(status => {
          const group = grouped[status]
          if (!group?.length) return null
          return (
            <div key={status}>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                {STATUS_LABELS[status]} ({group.length})
              </h2>
              <div className="space-y-2">
                {group.map(order => (
                  <a
                    key={order.id}
                    href={`/provider/orders/${order.id}`}
                    className="block bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:border-green-300 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 text-sm truncate">{order.service_name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{order.child_name}</p>
                        {order.scheduled_at && (
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(order.scheduled_at).toLocaleString('en-IN', {
                              day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                            })}
                          </p>
                        )}
                      </div>
                      <span className={`shrink-0 text-xs font-semibold px-2 py-1 rounded-full ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
                        {STATUS_LABELS[order.status] || order.status}
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )
        })}

        {orders.length === 0 && (
          <div className="text-center py-16 text-gray-400 text-sm">No orders yet.</div>
        )}
      </div>
    </div>
  )
}
