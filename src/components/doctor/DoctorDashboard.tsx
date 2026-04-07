import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import DoctorNavbar from './DoctorNavbar'
import LinkPatientModal from './LinkPatientModal'
import PatientPHRView from './PatientPHRView'
import CareQueue from './CareQueue'
import DoctorInbox from './DoctorInbox'

interface Patient {
  link_id: string
  child_id: string
  child_name: string
  dob: string
  gender: string | null
  photo_url: string | null
  parent_name: string
  parent_phone: string
  relationship: string
  linked_at: string
}

function ageFromDob(dob: string): string {
  const birth = new Date(dob)
  const now = new Date()
  let totalMonths = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth())
  if (now.getDate() < birth.getDate()) totalMonths--
  if (totalMonths < 0) totalMonths = 0
  if (totalMonths < 24) return `${totalMonths}m`
  return `${Math.floor(totalMonths / 12)}y ${totalMonths % 12}m`
}

export default function DoctorDashboard() {
  const { user, loading: authLoading, token } = useAuth()
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [showLink, setShowLink] = useState(false)
  const [selectedChild, setSelectedChild] = useState<{ id: string; name: string } | null>(null)
  const [search, setSearch] = useState('')
  const [escalationCounts, setEscalationCounts] = useState<Record<string, number>>({})
  const [activeTab, setActiveTab] = useState<'inbox' | 'patients' | 'care-queue'>('inbox')

  useEffect(() => {
    if (token) {
      fetchPatients()
      fetchEscalations()
    }
  }, [token])

  async function fetchEscalations() {
    try {
      const res = await fetch('/api/doctor/interventions/escalations', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        const counts: Record<string, number> = {}
        for (const esc of (data.escalations || []) as any[]) {
          if (esc.status === 'open' && esc.child_id) {
            counts[esc.child_id] = (counts[esc.child_id] || 0) + 1
          }
        }
        setEscalationCounts(counts)
      }
    } catch { /* ignore */ }
  }

  async function fetchPatients() {
    setLoading(true)
    try {
      const res = await fetch('/api/doctor/patients', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.status === 401) {
        window.location.href = '/doctor/login'
        return
      }
      const data = await res.json()
      setPatients(data.patients || [])
    } catch {
      // ignore
    }
    setLoading(false)
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    if (typeof window !== 'undefined') window.location.href = '/doctor/login'
    return null
  }

  // PHR View
  if (selectedChild && token) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DoctorNavbar />
        <main className="max-w-4xl mx-auto px-4 py-6">
          <PatientPHRView
            childId={selectedChild.id}
            childName={selectedChild.name}
            token={token}
            onBack={() => setSelectedChild(null)}
          />
        </main>
      </div>
    )
  }

  const filtered = patients.filter(
    (p) =>
      p.child_name.toLowerCase().includes(search.toLowerCase()) ||
      p.parent_name.toLowerCase().includes(search.toLowerCase()) ||
      p.parent_phone.includes(search)
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <DoctorNavbar />

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Tab Navigation */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 mb-6">
          <button
            onClick={() => setActiveTab('inbox')}
            className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'inbox'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Inbox
          </button>
          <button
            onClick={() => setActiveTab('patients')}
            className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'patients'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Patients
          </button>
          <button
            onClick={() => setActiveTab('care-queue')}
            className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all relative ${
              activeTab === 'care-queue'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Queue
          </button>
        </div>

        {/* Inbox Tab (new unified WhatsApp-style view) */}
        {activeTab === 'inbox' && token && (
          <DoctorInbox token={token} />
        )}

        {/* Care Queue Tab (existing detailed view) */}
        {activeTab === 'care-queue' && token && (
          <CareQueue token={token} />
        )}

        {/* Patient Panel Tab */}
        {activeTab === 'patients' && <>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Patient Panel</h1>
            <p className="text-sm text-gray-500 mt-1">
              {patients.length} {patients.length === 1 ? 'patient' : 'patients'} linked
            </p>
          </div>
          <button
            onClick={() => setShowLink(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Link Patient
          </button>
        </div>

        {/* Search */}
        {patients.length > 0 && (
          <div className="mb-4">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by child name, parent name, or phone..."
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        )}

        {/* Patient list */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
            </div>
            <p className="text-gray-500 text-sm mb-4">
              {patients.length === 0
                ? 'No patients linked yet. Link your first patient to get started.'
                : 'No patients match your search.'}
            </p>
            {patients.length === 0 && (
              <button
                onClick={() => setShowLink(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
              >
                Link First Patient
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((p) => (
              <button
                key={p.link_id}
                onClick={() => setSelectedChild({ id: p.child_id, name: p.child_name })}
                className="w-full flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-200 hover:shadow-sm transition-all text-left"
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  {p.photo_url ? (
                    <img src={p.photo_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-semibold text-sm">
                      {p.child_name[0].toUpperCase()}
                    </div>
                  )}
                  {escalationCounts[p.child_id] > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1 shadow-sm">
                      {escalationCounts[p.child_id]}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900 text-sm truncate">{p.child_name}</span>
                    {p.gender && (
                      <span className="text-xs text-gray-400">{p.gender}</span>
                    )}
                    {p.dob && (
                      <span className="px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-500">
                        {ageFromDob(p.dob)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5 truncate">
                    {p.parent_name} {p.parent_phone ? `· ${p.parent_phone}` : ''}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <a
                    href={`/doctor/console?childId=${p.child_id}&name=${encodeURIComponent(p.child_name)}&age=${p.dob ? ageFromDob(p.dob) : ''}&gender=${p.gender || ''}`}
                    onClick={(e) => e.stopPropagation()}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors"
                    title="Open clinic console for this patient"
                  >
                    Console
                  </a>
                  <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        )}
        </>}
      </main>

      {/* Link Modal */}
      {showLink && token && (
        <LinkPatientModal
          token={token}
          onClose={() => setShowLink(false)}
          onLinked={fetchPatients}
        />
      )}
    </div>
  )
}
