import { useState, useEffect } from 'react'

interface RevenueData {
  period: string
  gmv: number
  commission: number
  providerPayouts: number
  orderCount: number
  byCategory: { category: string; gmv: number; order_count: number }[]
}

interface SupplyItem {
  category: string
  providerCount: number
  alert: boolean
}

export default function RevenueDashboard() {
  const [revenue, setRevenue] = useState<RevenueData | null>(null)
  const [supply, setSupply] = useState<SupplyItem[]>([])
  const [period, setPeriod] = useState('30d')
  const [loading, setLoading] = useState(true)

  const adminKey = window.__ADMIN_KEY || ''
  const headers = { Authorization: `Bearer ${adminKey}` }

  useEffect(() => {
    setLoading(true)
    Promise.all([
      fetch(`/api/admin/revenue?period=${period}`, { headers }).then(r => r.json() as Promise<RevenueData>),
      fetch('/api/admin/supply', { headers }).then(r => r.json() as Promise<{ supply: SupplyItem[] }>),
    ])
      .then(([rev, sup]) => {
        setRevenue(rev)
        setSupply(sup.supply || [])
      })
      .finally(() => setLoading(false))
  }, [period])

  const fmt = (cents: number) =>
    `₹${(cents / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`

  if (loading) return <div className="p-6 text-gray-500">Loading revenue data…</div>

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Revenue Dashboard</h2>
        <select
          value={period}
          onChange={e => setPeriod(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'GMV', value: fmt(revenue?.gmv || 0), color: 'text-blue-700' },
          { label: 'Commission', value: fmt(revenue?.commission || 0), color: 'text-green-700' },
          { label: 'Provider Payouts', value: fmt(revenue?.providerPayouts || 0), color: 'text-purple-700' },
          { label: 'Orders', value: String(revenue?.orderCount || 0), color: 'text-gray-700' },
        ].map(card => (
          <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-xs text-gray-500 mb-1">{card.label}</div>
            <div className={`text-2xl font-bold ${card.color}`}>{card.value}</div>
          </div>
        ))}
      </div>

      {/* By category */}
      {(revenue?.byCategory?.length || 0) > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 text-sm font-medium text-gray-700">
            Revenue by Category
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-4 py-2 text-left">Category</th>
                <th className="px-4 py-2 text-right">GMV</th>
                <th className="px-4 py-2 text-right">Orders</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {revenue?.byCategory.map(row => (
                <tr key={row.category} className="hover:bg-gray-50">
                  <td className="px-4 py-2 capitalize text-gray-700">{row.category.replace('_', ' ')}</td>
                  <td className="px-4 py-2 text-right text-gray-800">{fmt(row.gmv)}</td>
                  <td className="px-4 py-2 text-right text-gray-600">{row.order_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Supply alerts */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">Provider Supply (next 7 days)</h3>
        {supply.length === 0 ? (
          <div className="text-sm text-gray-400">No supply data available</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {supply.map(s => (
              <div
                key={s.category}
                className={`rounded-xl border p-3 ${s.alert ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'}`}
              >
                <div className="text-xs text-gray-500 capitalize mb-1">{s.category.replace('_', ' ')}</div>
                <div className={`text-xl font-bold ${s.alert ? 'text-red-600' : 'text-gray-800'}`}>
                  {s.providerCount}
                </div>
                {s.alert && (
                  <div className="text-xs text-red-600 mt-1">⚠ Under-served</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
