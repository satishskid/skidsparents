import { useState, useEffect, useCallback } from 'react'
import UploadDialog from './UploadDialog'

interface HealthRecord {
  id: string
  record_type: string
  title: string
  record_date: string
  provider_name: string | null
  summary: string | null
  source: string
  file_url: string | null
  concern_level: string
  ai_confidence: number | null
  data_json: string | null
}

interface RecordsTimelineProps {
  childId: string
  token: string
}

const TYPE_CONFIG: Record<string, { emoji: string; label: string; color: string }> = {
  doctor_visit: { emoji: '🩺', label: 'Doctor Visit', color: 'bg-blue-50 text-blue-700' },
  lab_test: { emoji: '🧪', label: 'Lab Test', color: 'bg-purple-50 text-purple-700' },
  vaccination: { emoji: '💉', label: 'Vaccination', color: 'bg-green-50 text-green-700' },
  prescription: { emoji: '💊', label: 'Prescription', color: 'bg-orange-50 text-orange-700' },
  dental: { emoji: '🦷', label: 'Dental', color: 'bg-pink-50 text-pink-700' },
  eye_checkup: { emoji: '👁️', label: 'Eye Checkup', color: 'bg-amber-50 text-amber-700' },
  hearing_test: { emoji: '👂', label: 'Hearing', color: 'bg-indigo-50 text-indigo-700' },
  screening: { emoji: '📋', label: 'Screening', color: 'bg-teal-50 text-teal-700' },
  growth_chart: { emoji: '📏', label: 'Growth', color: 'bg-emerald-50 text-emerald-700' },
  general: { emoji: '📄', label: 'General', color: 'bg-gray-50 text-gray-700' },
}

const FILTER_TYPES = [
  { key: 'all', label: 'All' },
  { key: 'doctor_visit', label: 'Visits' },
  { key: 'lab_test', label: 'Labs' },
  { key: 'vaccination', label: 'Vaccines' },
  { key: 'screening', label: 'Screening' },
  { key: 'general', label: 'Other' },
]

// Manual entry form types
const MANUAL_TYPES = [
  { key: 'doctor_visit', label: 'Doctor Visit', emoji: '🩺' },
  { key: 'lab_test', label: 'Lab Test', emoji: '🧪' },
  { key: 'prescription', label: 'Prescription', emoji: '💊' },
  { key: 'dental', label: 'Dental', emoji: '🦷' },
  { key: 'eye_checkup', label: 'Eye Checkup', emoji: '👁️' },
  { key: 'general', label: 'General Note', emoji: '📄' },
]

export default function RecordsTimeline({ childId, token }: RecordsTimelineProps) {
  const [records, setRecords] = useState<HealthRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [showUpload, setShowUpload] = useState(false)
  const [showManual, setShowManual] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Manual entry form state
  const [manualType, setManualType] = useState('doctor_visit')
  const [manualTitle, setManualTitle] = useState('')
  const [manualDate, setManualDate] = useState(new Date().toISOString().split('T')[0])
  const [manualProvider, setManualProvider] = useState('')
  const [manualSummary, setManualSummary] = useState('')
  const [saving, setSaving] = useState(false)

  const fetchRecords = useCallback(async () => {
    try {
      const typeParam = filter !== 'all' ? `&type=${filter}` : ''
      const res = await fetch(`/api/records?childId=${childId}${typeParam}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setRecords(data.records || [])
      }
    } catch {} finally {
      setLoading(false)
    }
  }, [childId, token, filter])

  useEffect(() => { fetchRecords() }, [fetchRecords])

  const handleManualSave = async () => {
    if (!manualTitle.trim() || !manualDate) return
    setSaving(true)
    try {
      const res = await fetch('/api/records', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          childId,
          recordType: manualType,
          title: manualTitle.trim(),
          recordDate: manualDate,
          providerName: manualProvider.trim() || undefined,
          summary: manualSummary.trim() || undefined,
        }),
      })
      if (res.ok) {
        setShowManual(false)
        setManualTitle('')
        setManualProvider('')
        setManualSummary('')
        fetchRecords()
      }
    } catch {} finally {
      setSaving(false)
    }
  }

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr)
      return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    } catch { return dateStr }
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl p-4 animate-pulse h-20" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Filter chips */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {FILTER_TYPES.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filter === f.key
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Records list */}
      {records.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center border border-gray-100">
          <p className="text-3xl mb-2">📋</p>
          <p className="text-sm font-medium text-gray-700">No records yet</p>
          <p className="text-xs text-gray-400 mt-1">Start building your child's health timeline</p>
          <div className="flex gap-2 justify-center mt-4">
            <button
              onClick={() => setShowUpload(true)}
              className="px-4 py-2 rounded-lg bg-green-600 text-white text-xs font-semibold"
            >
              Upload Report
            </button>
            <button
              onClick={() => setShowManual(true)}
              className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-xs font-semibold"
            >
              Add Manually
            </button>
          </div>
        </div>
      ) : (
        records.map((record) => {
          const cfg = TYPE_CONFIG[record.record_type] || TYPE_CONFIG.general
          const expanded = expandedId === record.id
          let findings: any[] = []
          if (record.data_json) {
            try { findings = JSON.parse(record.data_json).findings || [] } catch {}
          }

          return (
            <div
              key={record.id}
              className="bg-white rounded-xl border border-gray-100 overflow-hidden"
              onClick={() => setExpandedId(expanded ? null : record.id)}
            >
              <div className="flex items-start gap-3 p-4 cursor-pointer">
                <div className="text-xl flex-shrink-0 mt-0.5">{cfg.emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${cfg.color}`}>
                      {cfg.label}
                    </span>
                    <span className="text-[10px] text-gray-400">{formatDate(record.record_date)}</span>
                  </div>
                  <p className="text-sm font-medium text-gray-900 truncate">{record.title}</p>
                  {record.provider_name && (
                    <p className="text-xs text-gray-500">{record.provider_name}</p>
                  )}
                  {record.summary && !expanded && (
                    <p className="text-xs text-gray-400 mt-1 line-clamp-1">{record.summary}</p>
                  )}
                </div>
                {record.file_url && (
                  <span className="text-xs text-gray-300 flex-shrink-0">📎</span>
                )}
              </div>

              {expanded && (
                <div className="px-4 pb-4 border-t border-gray-50 space-y-2">
                  {record.summary && (
                    <p className="text-sm text-gray-600 pt-2">{record.summary}</p>
                  )}
                  {findings.length > 0 && (
                    <div className="space-y-1">
                      {findings.map((f: any, i: number) => (
                        <div key={i} className="flex items-center gap-2 text-xs">
                          <span className="font-medium text-gray-600">{f.name}</span>
                          {f.value && <span className="text-gray-400">: {f.value}{f.unit ? ` ${f.unit}` : ''}</span>}
                          {f.status && (
                            <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                              f.status === 'normal' ? 'bg-green-50 text-green-600' :
                              f.status === 'abnormal' ? 'bg-red-50 text-red-600' :
                              'bg-amber-50 text-amber-600'
                            }`}>{f.status}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2 text-[10px] text-gray-400 pt-1">
                    <span>Source: {record.source === 'parent_upload' ? 'Uploaded' : 'Manual'}</span>
                    {record.ai_confidence != null && <span>AI: {Math.round(record.ai_confidence * 100)}%</span>}
                  </div>
                </div>
              )}
            </div>
          )
        })
      )}

      {/* FAB - Add Record */}
      <div className="fixed bottom-20 right-4 md:bottom-6 z-40">
        {showMenu && (
          <div className="mb-2 space-y-2 animate-slide-up">
            <button
              onClick={() => { setShowMenu(false); setShowUpload(true) }}
              className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl shadow-lg border border-gray-100 text-sm font-medium text-gray-700 hover:bg-gray-50 w-full"
            >
              📷 Upload Report
            </button>
            <button
              onClick={() => { setShowMenu(false); setShowManual(true) }}
              className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl shadow-lg border border-gray-100 text-sm font-medium text-gray-700 hover:bg-gray-50 w-full"
            >
              ✏️ Add Manually
            </button>
          </div>
        )}
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="w-14 h-14 rounded-full bg-green-600 text-white shadow-lg shadow-green-500/30 flex items-center justify-center text-2xl hover:bg-green-700 transition-all"
        >
          {showMenu ? '×' : '+'}
        </button>
      </div>

      {/* Upload Dialog */}
      {showUpload && (
        <UploadDialog
          childId={childId}
          token={token}
          onClose={() => setShowUpload(false)}
          onUploaded={fetchRecords}
        />
      )}

      {/* Manual Entry Dialog */}
      {showManual && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end md:items-center justify-center" onClick={() => setShowManual(false)}>
          <div className="bg-white w-full max-w-lg rounded-t-2xl md:rounded-2xl p-5 space-y-3" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-base font-bold text-gray-900">Quick Add Record</h2>

            <div className="flex gap-2 flex-wrap">
              {MANUAL_TYPES.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setManualType(t.key)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    manualType === t.key ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {t.emoji} {t.label}
                </button>
              ))}
            </div>

            <input
              type="text" value={manualTitle} onChange={(e) => setManualTitle(e.target.value)}
              placeholder="Title (e.g., Routine checkup with Dr. Sharma)"
              className="w-full px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm"
            />

            <div className="flex gap-3">
              <input
                type="date" value={manualDate} onChange={(e) => setManualDate(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-sm"
              />
              <input
                type="text" value={manualProvider} onChange={(e) => setManualProvider(e.target.value)}
                placeholder="Provider / Hospital"
                className="flex-1 px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-sm"
              />
            </div>

            <textarea
              value={manualSummary} onChange={(e) => setManualSummary(e.target.value)}
              placeholder="Notes or summary (optional)"
              rows={2}
              className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-sm resize-none"
            />

            <button
              onClick={handleManualSave}
              disabled={saving || !manualTitle.trim()}
              className="w-full py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {saving ? 'Saving...' : 'Add Record'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
