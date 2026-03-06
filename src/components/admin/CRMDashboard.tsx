import { useState, useEffect, useCallback } from 'react'

// ─── Types ───

interface Lead {
  id: string
  brand: string
  name: string
  phone: string
  email?: string
  source?: string
  medium?: string
  campaign?: string
  funnel_stage?: string
  asset_code?: string
  center?: string
  child_age_months?: number
  notes?: string
  status?: string
  assigned_to?: string
  created_at?: string
  updated_at?: string
}

interface Stats {
  totalLeads: number
  todayLeads: number
  weekLeads: number
  monthLeads: number
  byStatus: Record<string, number>
  bySource: Record<string, number>
  byFunnel: Record<string, number>
  recentLeads: Lead[]
  _note?: string
}

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-100 text-blue-800',
  contacted: 'bg-yellow-100 text-yellow-800',
  qualified: 'bg-green-100 text-green-800',
  converted: 'bg-emerald-100 text-emerald-800',
  lost: 'bg-red-100 text-red-800',
  follow_up: 'bg-purple-100 text-purple-800',
}

const FUNNEL_COLORS: Record<string, string> = {
  awareness: 'bg-sky-400',
  interest: 'bg-blue-500',
  consideration: 'bg-indigo-500',
  intent: 'bg-purple-500',
  conversion: 'bg-green-500',
  retention: 'bg-emerald-600',
}

// ─── Component ───

export default function CRMDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [leads, setLeads] = useState<Lead[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [statusFilter, setStatusFilter] = useState('')
  const [sourceFilter, setSourceFilter] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const pageSize = 20

  // Edit modal
  const [editing, setEditing] = useState<Lead | null>(null)
  const [editStatus, setEditStatus] = useState('')
  const [editNotes, setEditNotes] = useState('')
  const [editAssigned, setEditAssigned] = useState('')
  const [saving, setSaving] = useState(false)

  // Active tab
  const [tab, setTab] = useState<'overview' | 'leads' | 'products'>('overview')

  // DB init
  const [dbReady, setDbReady] = useState<boolean | null>(null)

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/stats')
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch {}
  }, [])

  const fetchLeads = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.set('status', statusFilter)
      if (sourceFilter) params.set('source', sourceFilter)
      if (search) params.set('search', search)
      params.set('limit', String(pageSize))
      params.set('offset', String(page * pageSize))

      const res = await fetch(`/api/admin/leads?${params}`)
      if (res.ok) {
        const data = await res.json()
        setLeads(data.leads || [])
        setTotal(data.total || 0)
      }
    } catch {}
  }, [statusFilter, sourceFilter, search, page])

  const initDB = async () => {
    try {
      const res = await fetch('/api/admin/init-db', { method: 'POST' })
      if (res.ok) {
        setDbReady(true)
        fetchStats()
        fetchLeads()
      } else {
        setDbReady(false)
      }
    } catch {
      setDbReady(false)
    }
  }

  useEffect(() => {
    setLoading(true)
    Promise.all([fetchStats(), fetchLeads()])
      .catch(() => setError('Failed to load data'))
      .finally(() => setLoading(false))
  }, [fetchStats, fetchLeads])

  const updateLead = async () => {
    if (!editing) return
    setSaving(true)
    try {
      const res = await fetch('/api/admin/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editing.id,
          status: editStatus || undefined,
          notes: editNotes,
          assigned_to: editAssigned || undefined,
        }),
      })
      if (res.ok) {
        setEditing(null)
        fetchLeads()
        fetchStats()
      }
    } catch {} finally {
      setSaving(false)
    }
  }

  const openEdit = (lead: Lead) => {
    setEditing(lead)
    setEditStatus(lead.status || 'new')
    setEditNotes(lead.notes || '')
    setEditAssigned(lead.assigned_to || '')
  }

  const callLead = (phone: string) => {
    window.open(`tel:${phone}`, '_self')
  }

  const whatsappLead = (phone: string, name: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '')
    const fullPhone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`
    const msg = encodeURIComponent(`Hi ${name}, this is SKIDS Health. Thank you for your interest! How can we help you today?`)
    window.open(`https://wa.me/${fullPhone}?text=${msg}`, '_blank')
  }

  const formatDate = (d?: string) => {
    if (!d) return '-'
    const date = new Date(d)
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  const timeAgo = (d?: string) => {
    if (!d) return ''
    const diff = Date.now() - new Date(d).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    const days = Math.floor(hrs / 24)
    return `${days}d ago`
  }

  // ─── Render ───

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold text-lg">
              S
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">SKIDS CRM</h1>
              <p className="text-xs text-gray-500">Lead Management Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={initDB}
              className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
            >
              Init DB
            </button>
            <a href="/" className="text-xs px-3 py-1.5 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-colors">
              Back to App
            </a>
          </div>
        </div>
        {/* Tab bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex gap-1">
          <button
            onClick={() => setTab('overview')}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === 'overview' ? 'border-green-600 text-green-700' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setTab('leads')}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === 'leads' ? 'border-green-600 text-green-700' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            All Leads ({total})
          </button>
          <button
            onClick={() => setTab('products')}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === 'products' ? 'border-green-600 text-green-700' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Products
          </button>
        </div>
      </header>

      {/* DB status banner */}
      {dbReady === true && (
        <div className="bg-green-50 border-b border-green-200 py-2 px-4 text-center text-sm text-green-700">
          Database initialized successfully. Leads table is ready.
        </div>
      )}
      {dbReady === false && (
        <div className="bg-red-50 border-b border-red-200 py-2 px-4 text-center text-sm text-red-700">
          Failed to initialize database. Check Cloudflare D1 binding.
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
          </div>
        ) : tab === 'products' ? (
          <ProductsTab />
        ) : tab === 'overview' ? (
          <OverviewTab stats={stats} formatDate={formatDate} timeAgo={timeAgo} onViewLeads={() => setTab('leads')} onCallLead={callLead} onWhatsappLead={whatsappLead} />
        ) : (
          <LeadsTab
            leads={leads}
            total={total}
            page={page}
            pageSize={pageSize}
            statusFilter={statusFilter}
            sourceFilter={sourceFilter}
            search={search}
            onPageChange={setPage}
            onStatusFilter={setStatusFilter}
            onSourceFilter={setSourceFilter}
            onSearch={setSearch}
            onEdit={openEdit}
            onCall={callLead}
            onWhatsapp={whatsappLead}
            formatDate={formatDate}
            timeAgo={timeAgo}
            stats={stats}
          />
        )}
      </main>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setEditing(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Edit Lead</h3>
              <p className="text-sm text-gray-500 mt-1">{editing.name} — {editing.phone}</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="qualified">Qualified</option>
                  <option value="follow_up">Follow Up</option>
                  <option value="converted">Converted</option>
                  <option value="lost">Lost</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
                <input
                  type="text"
                  value={editAssigned}
                  onChange={(e) => setEditAssigned(e.target.value)}
                  placeholder="e.g. Ravi, Priya..."
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  rows={3}
                  placeholder="Follow-up notes, call outcomes..."
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex gap-3 justify-end">
              <button
                onClick={() => setEditing(null)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={updateLead}
                disabled={saving}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Overview Tab ───

function OverviewTab({
  stats,
  formatDate,
  timeAgo,
  onViewLeads,
  onCallLead,
  onWhatsappLead,
}: {
  stats: Stats | null
  formatDate: (d?: string) => string
  timeAgo: (d?: string) => string
  onViewLeads: () => void
  onCallLead: (phone: string) => void
  onWhatsappLead: (phone: string, name: string) => void
}) {
  if (!stats) return null

  const totalFunnel = Object.values(stats.byFunnel).reduce((a, b) => a + b, 0) || 1

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Leads" value={stats.totalLeads} color="green" />
        <StatCard label="Today" value={stats.todayLeads} color="blue" />
        <StatCard label="This Week" value={stats.weekLeads} color="purple" />
        <StatCard label="This Month" value={stats.monthLeads} color="amber" />
      </div>

      {/* Status + Source breakdown */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Status Breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Lead Status</h3>
          {Object.keys(stats.byStatus).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(stats.byStatus)
                .sort((a, b) => b[1] - a[1])
                .map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium capitalize ${STATUS_COLORS[status] || 'bg-gray-100 text-gray-700'}`}>
                        {status.replace('_', ' ')}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{count}</span>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No leads yet</p>
          )}
        </div>

        {/* Source Breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Lead Sources</h3>
          {Object.keys(stats.bySource).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(stats.bySource)
                .sort((a, b) => b[1] - a[1])
                .map(([source, count]) => (
                  <div key={source} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 capitalize">{source || 'unknown'}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 rounded-full"
                          style={{ width: `${(count / stats.totalLeads) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-gray-900 w-8 text-right">{count}</span>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No leads yet</p>
          )}
        </div>
      </div>

      {/* Funnel */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Funnel Breakdown</h3>
        {Object.keys(stats.byFunnel).length > 0 ? (
          <div className="flex gap-1 h-8 rounded-lg overflow-hidden">
            {['awareness', 'interest', 'consideration', 'intent', 'conversion', 'retention']
              .filter((stage) => stats.byFunnel[stage])
              .map((stage) => (
                <div
                  key={stage}
                  className={`${FUNNEL_COLORS[stage] || 'bg-gray-400'} flex items-center justify-center text-white text-[10px] font-medium transition-all`}
                  style={{ width: `${(stats.byFunnel[stage] / totalFunnel) * 100}%`, minWidth: '40px' }}
                  title={`${stage}: ${stats.byFunnel[stage]}`}
                >
                  {stats.byFunnel[stage]}
                </div>
              ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">No funnel data yet</p>
        )}
        <div className="flex flex-wrap gap-3 mt-3">
          {['awareness', 'interest', 'consideration', 'intent', 'conversion', 'retention'].map((stage) => (
            <div key={stage} className="flex items-center gap-1.5">
              <div className={`w-2.5 h-2.5 rounded-sm ${FUNNEL_COLORS[stage]}`} />
              <span className="text-[11px] text-gray-500 capitalize">{stage}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Leads */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-700">Recent Leads</h3>
          <button onClick={onViewLeads} className="text-xs text-green-600 hover:text-green-700 font-medium">
            View All
          </button>
        </div>
        {stats.recentLeads.length > 0 ? (
          <div className="space-y-3">
            {stats.recentLeads.map((lead) => (
              <div key={lead.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900 truncate">{lead.name}</span>
                    <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium capitalize ${STATUS_COLORS[lead.status || 'new'] || 'bg-gray-100 text-gray-700'}`}>
                      {(lead.status || 'new').replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {lead.phone} · {lead.source || 'unknown'} · {timeAgo(lead.created_at)}
                  </div>
                </div>
                <div className="flex gap-1.5 ml-2">
                  <button
                    onClick={() => onCallLead(lead.phone)}
                    className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors"
                    title="Call"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => onWhatsappLead(lead.phone, lead.name)}
                    className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center hover:bg-green-100 transition-colors"
                    title="WhatsApp"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
            </div>
            <p className="text-sm text-gray-500">No leads yet. They'll appear here as users submit forms.</p>
            <p className="text-xs text-gray-400 mt-1">Click "Init DB" if the leads table hasn't been created yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Leads Tab ───

function LeadsTab({
  leads,
  total,
  page,
  pageSize,
  statusFilter,
  sourceFilter,
  search,
  onPageChange,
  onStatusFilter,
  onSourceFilter,
  onSearch,
  onEdit,
  onCall,
  onWhatsapp,
  formatDate,
  timeAgo,
  stats,
}: {
  leads: Lead[]
  total: number
  page: number
  pageSize: number
  statusFilter: string
  sourceFilter: string
  search: string
  onPageChange: (p: number) => void
  onStatusFilter: (s: string) => void
  onSourceFilter: (s: string) => void
  onSearch: (s: string) => void
  onEdit: (lead: Lead) => void
  onCall: (phone: string) => void
  onWhatsapp: (phone: string, name: string) => void
  formatDate: (d?: string) => string
  timeAgo: (d?: string) => string
  stats: Stats | null
}) {
  const totalPages = Math.ceil(total / pageSize)
  const sources = stats ? Object.keys(stats.bySource) : []

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            value={search}
            onChange={(e) => { onSearch(e.target.value); onPageChange(0) }}
            placeholder="Search name, phone, email..."
            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { onStatusFilter(e.target.value); onPageChange(0) }}
          className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-green-500"
        >
          <option value="">All Status</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="qualified">Qualified</option>
          <option value="follow_up">Follow Up</option>
          <option value="converted">Converted</option>
          <option value="lost">Lost</option>
        </select>
        <select
          value={sourceFilter}
          onChange={(e) => { onSourceFilter(e.target.value); onPageChange(0) }}
          className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-green-500"
        >
          <option value="">All Sources</option>
          {sources.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-medium text-gray-500">Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Phone</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Source</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Funnel</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Assigned</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Date</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{lead.name}</div>
                    {lead.email && <div className="text-xs text-gray-500">{lead.email}</div>}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{lead.phone}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded capitalize">{lead.source || '-'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs capitalize text-gray-600">{lead.funnel_stage || '-'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium capitalize ${STATUS_COLORS[lead.status || 'new'] || 'bg-gray-100 text-gray-700'}`}>
                      {(lead.status || 'new').replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{lead.assigned_to || '-'}</td>
                  <td className="px-4 py-3 text-xs text-gray-500" title={formatDate(lead.created_at)}>{timeAgo(lead.created_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 justify-end">
                      <button
                        onClick={() => onCall(lead.phone)}
                        className="w-7 h-7 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100"
                        title="Call"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => onWhatsapp(lead.phone, lead.name)}
                        className="w-7 h-7 rounded-md bg-green-50 text-green-600 flex items-center justify-center hover:bg-green-100"
                        title="WhatsApp"
                      >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => onEdit(lead)}
                        className="w-7 h-7 rounded-md bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-200"
                        title="Edit"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487z" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden divide-y divide-gray-100">
          {leads.map((lead) => (
            <div key={lead.id} className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">{lead.name}</span>
                    <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium capitalize ${STATUS_COLORS[lead.status || 'new']}`}>
                      {(lead.status || 'new').replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{lead.phone}</div>
                  {lead.email && <div className="text-xs text-gray-400">{lead.email}</div>}
                  <div className="flex gap-2 mt-1.5 text-[11px] text-gray-400">
                    <span>{lead.source || 'unknown'}</span>
                    <span>·</span>
                    <span>{lead.funnel_stage || '-'}</span>
                    <span>·</span>
                    <span>{timeAgo(lead.created_at)}</span>
                  </div>
                  {lead.assigned_to && (
                    <div className="text-[11px] text-purple-600 mt-1">Assigned: {lead.assigned_to}</div>
                  )}
                  {lead.notes && (
                    <div className="text-xs text-gray-500 mt-1.5 bg-gray-50 rounded px-2 py-1">{lead.notes}</div>
                  )}
                </div>
                <div className="flex gap-1.5 ml-2 flex-shrink-0">
                  <button onClick={() => onCall(lead.phone)} className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                    </svg>
                  </button>
                  <button onClick={() => onWhatsapp(lead.phone, lead.name)} className="w-9 h-9 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                  </button>
                  <button onClick={() => onEdit(lead)} className="w-9 h-9 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {leads.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-sm text-gray-500">No leads found</p>
            <p className="text-xs text-gray-400 mt-1">Try adjusting your filters or search</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing {page * pageSize + 1}-{Math.min((page + 1) * pageSize, total)} of {total}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(Math.max(0, page - 1))}
              disabled={page === 0}
              className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm disabled:opacity-50 hover:bg-gray-50"
            >
              Prev
            </button>
            <button
              onClick={() => onPageChange(Math.min(totalPages - 1, page + 1))}
              disabled={page >= totalPages - 1}
              className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm disabled:opacity-50 hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Stat Card ───

// ─── Products Tab ───

const GRADIENT_PRESETS = [
  { label: 'Orange', value: 'from-amber-500 to-orange-600' },
  { label: 'Purple', value: 'from-violet-500 to-purple-600' },
  { label: 'Green', value: 'from-green-500 to-emerald-600' },
  { label: 'Blue', value: 'from-indigo-500 to-blue-600' },
  { label: 'Teal', value: 'from-teal-500 to-cyan-600' },
  { label: 'Red', value: 'from-red-500 to-rose-600' },
  { label: 'Pink', value: 'from-pink-500 to-fuchsia-600' },
  { label: 'Gray', value: 'from-gray-500 to-gray-600' },
]

const EMOJI_PRESETS = ['👁️', '🗣️', '🥗', '🎵', '👨‍⚕️', '🦷', '💪', '🧠', '❤️', '🫁', '📦', '🏥']

interface Product {
  slug: string; brand: string; emoji: string; tagline: string; description: string
  status: string; gradient: string; visible: boolean; hasCodeDefaults: boolean
  wonderFact: string; whyItMatters: string; ageRange: string; ctaLabel: string
  howItWorks: { step: number; title: string; description: string; emoji: string }[]
  whatYouGet: string[]; stats: { value: string; label: string }[]
  faqs: { q: string; a: string }[]; sortOrder: number; updatedAt: string | null
}

interface Campaign {
  id: string; product_slug: string; campaign_code: string; whatsapp_template: string
  utm_campaign: string; utm_link: string; is_active: number; leads_count: number
}

function ProductsTab() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Product | null>(null)
  const [saving, setSaving] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [campaignProduct, setCampaignProduct] = useState<string | null>(null)
  const [campaigns, setCampaigns] = useState<Campaign[]>([])

  // Edit form state
  const [form, setForm] = useState<any>({})

  // Campaign form state
  const [campCode, setCampCode] = useState('')
  const [campTemplate, setCampTemplate] = useState('')
  const [campSaving, setCampSaving] = useState(false)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/products')
      if (res.ok) {
        const data = await res.json()
        setProducts(data.products || [])
      }
    } catch {} finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  const fetchCampaigns = async (slug: string) => {
    try {
      const res = await fetch(`/api/admin/campaigns?product_slug=${slug}`)
      if (res.ok) {
        const data = await res.json()
        setCampaigns(data.campaigns || [])
      }
    } catch {}
  }

  const saveProduct = async () => {
    setSaving(true)
    try {
      const payload: any = {
        slug: form.slug || undefined,
        brand: form.brand,
        emoji: form.emoji,
        tagline: form.tagline,
        description: form.description,
        status: form.status,
        gradient: form.gradient,
        age_range: form.ageRange,
        cta_label: form.ctaLabel,
        wonder_fact: form.wonderFact,
        why_it_matters: form.whyItMatters,
        visible: form.visible,
        sort_order: form.sortOrder,
      }
      if (form.howItWorks?.length) payload.how_it_works_json = form.howItWorks
      if (form.whatYouGet?.length) payload.what_you_get_json = form.whatYouGet
      if (form.stats?.length) payload.stats_json = form.stats
      if (form.faqs?.length) payload.faqs_json = form.faqs

      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        setEditing(null)
        setShowAdd(false)
        fetchProducts()
      }
    } catch {} finally { setSaving(false) }
  }

  const toggleVisibility = async (slug: string, visible: boolean) => {
    await fetch('/api/admin/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'toggle_visibility', slug, visible }),
    })
    fetchProducts()
  }

  const saveCampaign = async () => {
    if (!campaignProduct || !campCode) return
    setCampSaving(true)
    try {
      await fetch('/api/admin/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_slug: campaignProduct,
          campaign_code: campCode,
          whatsapp_template: campTemplate,
        }),
      })
      setCampCode('')
      setCampTemplate('')
      fetchCampaigns(campaignProduct)
    } catch {} finally { setCampSaving(false) }
  }

  const openEdit = (p: Product) => {
    setForm({ ...p })
    setEditing(p)
  }

  const openAdd = () => {
    setForm({
      brand: '', emoji: '📦', tagline: '', description: '',
      status: 'building', gradient: 'from-gray-500 to-gray-600',
      visible: true, ageRange: '', ctaLabel: 'Learn More',
      wonderFact: '', whyItMatters: '',
      howItWorks: [], whatYouGet: [], stats: [], faqs: [],
      sortOrder: 99,
    })
    setShowAdd(true)
  }

  const openCampaign = (slug: string) => {
    if (campaignProduct === slug) {
      setCampaignProduct(null)
    } else {
      setCampaignProduct(slug)
      fetchCampaigns(slug)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Products ({products.length})</h2>
        <button onClick={openAdd} className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700">
          + Add Product
        </button>
      </div>

      {/* Product Cards Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((p) => (
          <div key={p.slug} className={`rounded-xl border overflow-hidden transition-all ${p.visible ? 'border-gray-200 bg-white' : 'border-gray-200 bg-gray-50 opacity-60'}`}>
            {/* Gradient header */}
            <div className={`bg-gradient-to-br ${p.gradient} p-4 relative`}>
              <div className="absolute inset-0 bg-black/10" />
              <div className="relative flex items-center justify-between">
                <span className="text-3xl">{p.emoji}</span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  p.status === 'available' ? 'bg-green-400/20 text-green-100 border border-green-400/30' : 'bg-white/20 text-white/80 border border-white/30'
                }`}>
                  {p.status}
                </span>
              </div>
              <h3 className="relative mt-2 text-sm font-bold text-white">{p.brand}</h3>
              <p className="relative mt-0.5 text-xs text-white/70 line-clamp-1">{p.tagline}</p>
            </div>
            {/* Actions */}
            <div className="p-3 flex items-center justify-between">
              <div className="flex gap-1.5">
                <button onClick={() => openEdit(p)} className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 text-xs font-medium hover:bg-gray-200">
                  Edit
                </button>
                <button onClick={() => openCampaign(p.slug)} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${campaignProduct === p.slug ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                  Campaign
                </button>
              </div>
              <button
                onClick={() => toggleVisibility(p.slug, !p.visible)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${p.visible ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}
                title={p.visible ? 'Visible — click to hide' : 'Hidden — click to show'}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  {p.visible ? (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  )}
                  <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
            {/* Campaign panel (expanded) */}
            {campaignProduct === p.slug && (
              <div className="border-t border-gray-100 p-4 bg-purple-50/50 space-y-3">
                <h4 className="text-xs font-bold text-purple-700 uppercase tracking-wider">Campaign</h4>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Campaign Code</label>
                  <input type="text" value={campCode} onChange={(e) => setCampCode(e.target.value.toUpperCase())}
                    placeholder="e.g. VISION2026" className="w-full px-3 py-1.5 rounded-lg border border-gray-300 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">WhatsApp Message <span className="text-gray-400">(use {'{name}'} for parent name)</span></label>
                  <textarea value={campTemplate} onChange={(e) => setCampTemplate(e.target.value)} rows={3}
                    placeholder="Hi {name}, your child's vision matters! Book a free SKIDS screening today..."
                    className="w-full px-3 py-1.5 rounded-lg border border-gray-300 text-sm" />
                </div>
                {campTemplate && (
                  <div>
                    <p className="text-[10px] font-medium text-gray-500 mb-1">PREVIEW</p>
                    <div className="bg-[#e5ddd5] rounded-xl p-3">
                      <div className="bg-white rounded-xl px-3 py-2 max-w-[90%] shadow-sm">
                        <p className="text-xs text-gray-800 whitespace-pre-wrap">{campTemplate.replace(/\{name\}/g, 'Priya')}</p>
                        <span className="text-[9px] text-gray-400 float-right mt-1">10:30 AM ✓✓</span>
                      </div>
                    </div>
                  </div>
                )}
                <button onClick={saveCampaign} disabled={!campCode || campSaving}
                  className="w-full py-2 rounded-lg bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 disabled:opacity-50">
                  {campSaving ? 'Saving...' : 'Save Campaign'}
                </button>
                {/* Existing campaigns */}
                {campaigns.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-purple-200">
                    <p className="text-[10px] font-medium text-gray-500">ACTIVE CAMPAIGNS</p>
                    {campaigns.map((c) => (
                      <div key={c.id} className="bg-white rounded-lg p-3 border border-gray-200 text-xs">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-purple-700">{c.campaign_code}</span>
                          <span className="text-gray-500">{c.leads_count} leads</span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <input type="text" readOnly value={c.utm_link} className="flex-1 px-2 py-1 rounded bg-gray-50 border border-gray-200 text-[11px] text-gray-600 font-mono truncate" />
                          <button onClick={() => navigator.clipboard.writeText(c.utm_link)}
                            className="px-2 py-1 rounded bg-gray-900 text-white text-[10px] font-semibold flex-shrink-0">
                            Copy
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Edit / Add Modal */}
      {(editing || showAdd) && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto" onClick={() => { setEditing(null); setShowAdd(false) }}>
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl my-8" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">{showAdd ? 'Add New Product' : `Edit ${form.brand}`}</h3>
              <button onClick={() => { setEditing(null); setShowAdd(false) }} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              {/* Basic Info */}
              <section>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Basic Info</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Brand Name</label>
                    <input type="text" value={form.brand || ''} onChange={(e) => setForm({ ...form, brand: e.target.value })}
                      placeholder="e.g. SKIDS Dental" className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tagline</label>
                    <input type="text" value={form.tagline || ''} onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                      placeholder="One line pitch..." className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm" />
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Emoji</label>
                    <div className="flex flex-wrap gap-1.5">
                      {EMOJI_PRESETS.map((e) => (
                        <button key={e} onClick={() => setForm({ ...form, emoji: e })}
                          className={`w-9 h-9 rounded-lg text-xl flex items-center justify-center border-2 transition-colors ${form.emoji === e ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}>
                          {e}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                    <div className="flex flex-wrap gap-1.5">
                      {GRADIENT_PRESETS.map((g) => (
                        <button key={g.value} onClick={() => setForm({ ...form, gradient: g.value })} title={g.label}
                          className={`w-9 h-9 rounded-lg bg-gradient-to-br ${g.value} border-2 transition-all ${form.gradient === g.value ? 'border-gray-900 scale-110' : 'border-transparent hover:scale-105'}`} />
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* Status + Meta */}
              <section>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Status & Settings</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select value={form.status || 'building'} onChange={(e) => setForm({ ...form, status: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm">
                      <option value="available">Available</option>
                      <option value="building">Building</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Age Range</label>
                    <input type="text" value={form.ageRange || ''} onChange={(e) => setForm({ ...form, ageRange: e.target.value })}
                      placeholder="e.g. 3 – 12 years" className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CTA Button Text</label>
                    <input type="text" value={form.ctaLabel || ''} onChange={(e) => setForm({ ...form, ctaLabel: e.target.value })}
                      placeholder="e.g. Get Started" className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm" />
                  </div>
                </div>
              </section>

              {/* Description */}
              <section>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Description</h4>
                <textarea value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3} placeholder="Short description for cards and meta..." className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm" />
              </section>

              {/* Wonder Fact */}
              <section>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Wonder Fact <span className="text-gray-300 normal-case font-normal">— "Did You Know?" section</span></h4>
                <textarea value={form.wonderFact || ''} onChange={(e) => setForm({ ...form, wonderFact: e.target.value })}
                  rows={2} placeholder="An engaging fact that hooks parents..." className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm" />
              </section>

              {/* Why It Matters */}
              <section>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Why It Matters <span className="text-gray-300 normal-case font-normal">— narrative section</span></h4>
                <textarea value={form.whyItMatters || ''} onChange={(e) => setForm({ ...form, whyItMatters: e.target.value })}
                  rows={5} placeholder="Detailed explanation of why this product matters for parents..." className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm" />
              </section>

              {/* How It Works */}
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">How It Works</h4>
                  <button onClick={() => setForm({ ...form, howItWorks: [...(form.howItWorks || []), { step: (form.howItWorks?.length || 0) + 1, title: '', description: '', emoji: '📋' }] })}
                    className="text-xs text-green-600 font-semibold hover:text-green-700">+ Add Step</button>
                </div>
                <div className="space-y-2">
                  {(form.howItWorks || []).map((step: any, i: number) => (
                    <div key={i} className="flex gap-2 items-start bg-gray-50 rounded-lg p-3">
                      <span className="text-xs font-bold text-gray-400 mt-2 w-5 flex-shrink-0">{i + 1}</span>
                      <div className="flex-1 grid grid-cols-3 gap-2">
                        <input type="text" value={step.emoji || ''} onChange={(e) => { const h = [...form.howItWorks]; h[i] = { ...h[i], emoji: e.target.value }; setForm({ ...form, howItWorks: h }) }}
                          className="px-2 py-1.5 rounded border border-gray-300 text-sm text-center" placeholder="📋" />
                        <input type="text" value={step.title || ''} onChange={(e) => { const h = [...form.howItWorks]; h[i] = { ...h[i], title: e.target.value }; setForm({ ...form, howItWorks: h }) }}
                          className="col-span-2 px-2 py-1.5 rounded border border-gray-300 text-sm" placeholder="Step title" />
                        <textarea value={step.description || ''} onChange={(e) => { const h = [...form.howItWorks]; h[i] = { ...h[i], description: e.target.value }; setForm({ ...form, howItWorks: h }) }}
                          className="col-span-3 px-2 py-1.5 rounded border border-gray-300 text-sm" rows={1} placeholder="Step description..." />
                      </div>
                      <button onClick={() => { const h = form.howItWorks.filter((_: any, j: number) => j !== i).map((s: any, j: number) => ({ ...s, step: j + 1 })); setForm({ ...form, howItWorks: h }) }}
                        className="text-gray-300 hover:text-red-500 mt-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                      </button>
                    </div>
                  ))}
                </div>
              </section>

              {/* What You Get */}
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">What You Get</h4>
                  <button onClick={() => setForm({ ...form, whatYouGet: [...(form.whatYouGet || []), ''] })}
                    className="text-xs text-green-600 font-semibold hover:text-green-700">+ Add Bullet</button>
                </div>
                <div className="space-y-1.5">
                  {(form.whatYouGet || []).map((item: string, i: number) => (
                    <div key={i} className="flex gap-2">
                      <span className="text-green-500 mt-2.5 flex-shrink-0">✓</span>
                      <input type="text" value={item} onChange={(e) => { const w = [...form.whatYouGet]; w[i] = e.target.value; setForm({ ...form, whatYouGet: w }) }}
                        className="flex-1 px-3 py-1.5 rounded-lg border border-gray-300 text-sm" placeholder="Benefit bullet..." />
                      <button onClick={() => setForm({ ...form, whatYouGet: form.whatYouGet.filter((_: any, j: number) => j !== i) })}
                        className="text-gray-300 hover:text-red-500">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  ))}
                </div>
              </section>

              {/* Stats */}
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Key Stats</h4>
                  <button onClick={() => setForm({ ...form, stats: [...(form.stats || []), { value: '', label: '' }] })}
                    className="text-xs text-green-600 font-semibold hover:text-green-700">+ Add Stat</button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {(form.stats || []).map((stat: any, i: number) => (
                    <div key={i} className="flex gap-2 items-center bg-gray-50 rounded-lg p-2">
                      <input type="text" value={stat.value || ''} onChange={(e) => { const s = [...form.stats]; s[i] = { ...s[i], value: e.target.value }; setForm({ ...form, stats: s }) }}
                        className="w-20 px-2 py-1 rounded border border-gray-300 text-sm font-bold text-center" placeholder="10+" />
                      <input type="text" value={stat.label || ''} onChange={(e) => { const s = [...form.stats]; s[i] = { ...s[i], label: e.target.value }; setForm({ ...form, stats: s }) }}
                        className="flex-1 px-2 py-1 rounded border border-gray-300 text-sm" placeholder="Label" />
                      <button onClick={() => setForm({ ...form, stats: form.stats.filter((_: any, j: number) => j !== i) })}
                        className="text-gray-300 hover:text-red-500">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  ))}
                </div>
              </section>

              {/* FAQs */}
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">FAQs</h4>
                  <button onClick={() => setForm({ ...form, faqs: [...(form.faqs || []), { q: '', a: '' }] })}
                    className="text-xs text-green-600 font-semibold hover:text-green-700">+ Add FAQ</button>
                </div>
                <div className="space-y-3">
                  {(form.faqs || []).map((faq: any, i: number) => (
                    <div key={i} className="bg-gray-50 rounded-lg p-3 space-y-2">
                      <div className="flex gap-2">
                        <span className="text-xs font-bold text-gray-400 mt-2">Q</span>
                        <input type="text" value={faq.q || ''} onChange={(e) => { const f = [...form.faqs]; f[i] = { ...f[i], q: e.target.value }; setForm({ ...form, faqs: f }) }}
                          className="flex-1 px-2 py-1.5 rounded border border-gray-300 text-sm" placeholder="Question..." />
                        <button onClick={() => setForm({ ...form, faqs: form.faqs.filter((_: any, j: number) => j !== i) })}
                          className="text-gray-300 hover:text-red-500">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-xs font-bold text-gray-400 mt-2">A</span>
                        <textarea value={faq.a || ''} onChange={(e) => { const f = [...form.faqs]; f[i] = { ...f[i], a: e.target.value }; setForm({ ...form, faqs: f }) }}
                          className="flex-1 px-2 py-1.5 rounded border border-gray-300 text-sm" rows={2} placeholder="Answer..." />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="p-6 border-t border-gray-100 flex gap-3 justify-end">
              <button onClick={() => { setEditing(null); setShowAdd(false) }}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100">
                Cancel
              </button>
              <button onClick={saveProduct} disabled={saving || !form.brand}
                className="px-6 py-2 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-700 disabled:opacity-50">
                {saving ? 'Saving...' : showAdd ? 'Create Product' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Stat Card ───

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  const colorMap: Record<string, string> = {
    green: 'bg-green-50 text-green-700 border-green-100',
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    purple: 'bg-purple-50 text-purple-700 border-purple-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-100',
  }

  return (
    <div className={`rounded-xl border p-4 ${colorMap[color] || colorMap.green}`}>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs font-medium mt-1 opacity-70">{label}</div>
    </div>
  )
}
