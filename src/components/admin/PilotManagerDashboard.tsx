/**
 * PilotManagerDashboard — SKIDS Manager dashboard for pilot coordination
 * Tabs: Overview | Invitations | Groups | Ped Applications | Playbook
 *
 * Quick Start: On first load with empty state, shows setup wizard to create
 * Wave 1 group + first batch of invitations automatically.
 */
import { useState, useEffect, useCallback } from 'react'

type Tab = 'overview' | 'invitations' | 'groups' | 'ped_apps' | 'playbook'

// ── Playbook content (in-app help) ──
const PLAYBOOK_SECTIONS = [
  {
    id: 'quick_start', phase: 'Setup', title: '1. Quick Start — First 20 Minutes',
    steps: [
      { done: false, text: 'Sign into this dashboard with your admin key' },
      { done: false, text: 'Go to Groups tab and create "Wave 1 - Clinic Patients" (capacity: 20)' },
      { done: false, text: 'Go to Invitations tab, create invitations for 5-10 parents from your clinic' },
      { done: false, text: 'For each invitation: enter parent name + phone + child QR code from screening' },
      { done: false, text: 'Click "WhatsApp" next to each invitation to send the invite message' },
      { done: false, text: 'Parents open the link, enter their screening code + DOB, see the intelligence preview' },
      { done: false, text: 'Track who accepted in the Overview tab' },
    ],
  },
  {
    id: 'send_whatsapp', phase: 'Outreach', title: '2. Sending WhatsApp Invitations',
    steps: [
      { done: false, text: 'Create the invitation in Invitations tab with parent name + phone + QR code' },
      { done: false, text: 'Click "WhatsApp" button — it opens wa.me with a pre-written message' },
      { done: false, text: 'The message includes: invite code, pediatrician name, and pilot link' },
      { done: false, text: 'Parent clicks the link: parent.skids.clinic/pilot?code=XXXXXXXX' },
      { done: false, text: 'If no phone, click "Copy" to copy the message text and send manually' },
      { done: false, text: 'Follow up after 24 hours if status still shows "pending"' },
      { done: false, text: 'Batch tip: create 5-10 invitations first, then send all WhatsApp messages together' },
    ],
  },
  {
    id: 'parent_flow', phase: 'Parent Journey', title: '3. What the Parent Experiences',
    steps: [
      { done: false, text: 'Parent opens /pilot?code=XXXXXXXX from WhatsApp link' },
      { done: false, text: 'Step 1: Code validated — sees welcome + assigned pediatrician name' },
      { done: false, text: 'Step 2: Enters health card QR code + child DOB (from screening report)' },
      { done: false, text: 'Step 3: THE AHA MOMENT — sees intelligence preview with screening analysis' },
      { done: false, text: '  - Green/yellow/red modules from screening' },
      { done: false, text: '  - 8 growth & development tracks for their child\'s age' },
      { done: false, text: '  - Personalized message about what SKIDS Intelligence found' },
      { done: false, text: 'Step 4: Clicks "Create Life Record" — enters name + phone — record seeded from screening' },
      { done: false, text: 'Life record now contains: screening data, growth records, screening results' },
      { done: false, text: 'Child linked to assigned pediatrician via doctor_patients table' },
    ],
  },
  {
    id: 'onboard_peds', phase: 'Ped Onboarding', title: '4. Onboarding Pediatricians',
    steps: [
      { done: false, text: 'Share /ped/register link with pediatricians you want to onboard' },
      { done: false, text: 'Ped sees value proposition: Bayesian projections, 52 intervention pathways, connected parents' },
      { done: false, text: 'Ped fills application: name, phone, clinic, specialty, license number' },
      { done: false, text: 'Application appears in Ped Applications tab here' },
      { done: false, text: 'Click "Approve" — creates a doctor record in the system' },
      { done: false, text: 'The doctor can now sign into /doctor/dashboard with their phone' },
      { done: false, text: 'Assign this doctor to new invitations using their doctor_id' },
      { done: false, text: 'Priority: onboard peds in areas where you have screened parents (proximity matters)' },
      { done: false, text: 'Start with YOUR clinic ped — you control the experience end-to-end' },
    ],
  },
  {
    id: 'track_engagement', phase: 'Monitoring', title: '5. Tracking Engagement & Success',
    steps: [
      { done: false, text: 'Overview tab shows: total invites, accepted count, active parents (7d), life records' },
      { done: false, text: 'Engagement chart shows what features parents are using' },
      { done: false, text: 'Key metric: Invite → Accepted conversion (target: >50% in first 48 hours)' },
      { done: false, text: 'Key metric: Active parents in last 7 days (means they returned after initial registration)' },
      { done: false, text: 'If acceptance is low: follow up via WhatsApp, ask if they had trouble' },
      { done: false, text: 'If engagement drops: parent isn\'t seeing value — check if intelligence preview was compelling' },
      { done: false, text: 'Watch for: viewed_projection, viewed_growth_track, viewed_intervention events' },
      { done: false, text: 'When Wave 1 shows >50% weekly active: open Wave 2 to more screened families' },
    ],
  },
  {
    id: 'scale_plan', phase: 'Scaling', title: '6. Scaling from Pilot to Launch',
    steps: [
      { done: false, text: 'Wave 1 (Now): 20 clinic patients, 1 ped (you/your clinic), manager-coordinated' },
      { done: false, text: 'Wave 2 (Week 3): 100 screened families (best screening results), 2-3 peds nearby' },
      { done: false, text: 'Wave 3 (Month 2): Open /pilot to all 15K screened families (remove invite code gate)' },
      { done: false, text: 'To remove gate: intelligence-preview API already works without invite code' },
      { done: false, text: 'Add a "Register from Screening" button on the existing /report page' },
      { done: false, text: 'Ped onboarding goes parallel: share /ped/register in WhatsApp groups, conferences' },
      { done: false, text: 'Each approved ped gets pilot parents assigned based on location proximity' },
      { done: false, text: 'Funding milestone: "X parents active, Y peds engaged, Z interventions completed"' },
    ],
  },
]

export default function PilotManagerDashboard() {
  const [adminKey, setAdminKey] = useState('')
  const [authenticated, setAuthenticated] = useState(false)
  const [tab, setTab] = useState<Tab>('overview')
  const [stats, setStats] = useState<any>(null)
  const [invitations, setInvitations] = useState<any[]>([])
  const [pedApps, setPedApps] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [showSetupWizard, setShowSetupWizard] = useState(false)
  const [setupStep, setSetupStep] = useState(0)
  const [newInvite, setNewInvite] = useState({ parent_name: '', parent_phone: '', parent_email: '', child_qr_code: '', pilot_group: 'wave_1', source: 'screening', notes: '' })
  const [newGroup, setNewGroup] = useState({ name: '', description: '', max_capacity: 50 })
  // Bulk invite form
  const [bulkText, setBulkText] = useState('')
  const [bulkGroup, setBulkGroup] = useState('wave_1')

  const hdrs = useCallback(() => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${adminKey}` }), [adminKey])

  async function authenticate() {
    try {
      const res = await fetch('/api/admin/pilot/stats', { headers: { Authorization: `Bearer ${adminKey}` } })
      if (res.ok) {
        setAuthenticated(true)
        const data = await res.json()
        setStats(data)
        // Show setup wizard if nothing exists yet
        if (data.invitations?.total === 0 && (!data.groups || data.groups.length === 0)) {
          setShowSetupWizard(true)
        }
      } else setMessage('Invalid admin key')
    } catch { setMessage('Connection failed') }
  }

  useEffect(() => { if (authenticated) loadData() }, [authenticated, tab])

  async function loadData() {
    setLoading(true)
    try {
      const s = await fetch('/api/admin/pilot/stats', { headers: hdrs() }); if (s.ok) setStats(await s.json())
      if (tab === 'invitations') { const r = await fetch('/api/admin/pilot/invitations', { headers: hdrs() }); if (r.ok) { const d = await r.json(); setInvitations(d.invitations || []) } }
      if (tab === 'ped_apps') { const r = await fetch('/api/admin/pilot/ped-applications', { headers: hdrs() }); if (r.ok) { const d = await r.json(); setPedApps(d.applications || []) } }
    } catch {}
    setLoading(false)
  }

  // ── Setup Wizard: auto-create Wave 1 group ──
  async function setupCreateGroup() {
    const r = await fetch('/api/admin/pilot/groups', { method: 'POST', headers: hdrs(),
      body: JSON.stringify({ name: 'wave_1', description: 'Wave 1 — Clinic patients & select screening parents', max_capacity: 20 }) })
    if (r.ok) {
      setMessage('Wave 1 group created (capacity: 20)')
      setSetupStep(1)
      loadData()
    } else setMessage('Failed to create group')
  }

  async function createInvitation() {
    if (!newInvite.parent_name && !newInvite.parent_phone) { setMessage('Enter at least parent name or phone'); return }
    const r = await fetch('/api/admin/pilot/invitations', { method: 'POST', headers: hdrs(), body: JSON.stringify(newInvite) })
    const d = await r.json()
    if (r.ok) { setMessage(`Invitation created: ${d.created[0]?.invite_code}`); setNewInvite({ parent_name: '', parent_phone: '', parent_email: '', child_qr_code: '', pilot_group: 'wave_1', source: 'screening', notes: '' }); loadData() }
    else setMessage(d.error)
  }

  // ── Bulk invite: parse "Name, Phone, QR" lines ──
  async function createBulkInvitations() {
    const lines = bulkText.trim().split('\n').filter(l => l.trim())
    if (lines.length === 0) { setMessage('Enter at least one line: Name, Phone, QR (optional)'); return }

    const batch = lines.map(line => {
      const parts = line.split(',').map(p => p.trim())
      return {
        parent_name: parts[0] || '',
        parent_phone: parts[1] || '',
        child_qr_code: parts[2] || '',
        pilot_group: bulkGroup,
        source: 'screening',
      }
    })

    const r = await fetch('/api/admin/pilot/invitations', { method: 'POST', headers: hdrs(), body: JSON.stringify(batch) })
    const d = await r.json()
    if (r.ok) {
      setMessage(`${d.count} invitations created!`)
      setBulkText('')
      loadData()
    } else setMessage(d.error || 'Bulk creation failed')
  }

  async function createGroup() {
    if (!newGroup.name) { setMessage('Group name required'); return }
    const r = await fetch('/api/admin/pilot/groups', { method: 'POST', headers: hdrs(), body: JSON.stringify(newGroup) })
    if (r.ok) { setMessage('Group created'); setNewGroup({ name: '', description: '', max_capacity: 50 }); loadData() }
  }

  async function getWhatsApp(id: string) {
    const r = await fetch(`/api/admin/pilot/whatsapp-message?id=${id}`, { headers: hdrs() })
    const d = await r.json()
    if (d.whatsapp_url) window.open(d.whatsapp_url, '_blank')
    else if (d.message) { navigator.clipboard.writeText(d.message); setMessage('Message copied to clipboard!') }
  }

  async function copyInviteLink(code: string) {
    const link = `https://parent.skids.clinic/pilot?code=${code}`
    navigator.clipboard.writeText(link)
    setMessage(`Link copied: ${link}`)
  }

  async function handlePedAction(id: string, action: string) {
    const r = await fetch('/api/admin/pilot/ped-applications', { method: 'PATCH', headers: hdrs(), body: JSON.stringify({ application_id: id, action }) })
    if (r.ok) { setMessage(`Application ${action}d`); loadData() }
  }

  // ── Auth Gate ──
  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-sm border p-8 w-full max-w-sm">
          <h1 className="text-xl font-bold text-gray-900 mb-2 text-center">SKIDS Pilot Manager</h1>
          <p className="text-sm text-gray-500 text-center mb-6">Coordinate pilot groups, send invitations, track engagement</p>
          <input type="password" value={adminKey} onChange={e => setAdminKey(e.target.value)} placeholder="Admin key"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 outline-none mb-4" onKeyDown={e => e.key === 'Enter' && authenticate()} />
          {message && <p className="text-sm text-red-600 mb-3">{message}</p>}
          <button onClick={authenticate} className="w-full py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700">Sign In</button>
        </div>
      </div>
    )
  }

  // ── Setup Wizard (shown on first use) ──
  if (showSetupWizard) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🚀</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Pilot Manager</h1>
          <p className="text-gray-500">Let's set up your first pilot group and invitations in 2 steps.</p>
        </div>

        {setupStep === 0 && (
          <div className="bg-white rounded-2xl border p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Step 1: Create Wave 1 Group</h2>
            <p className="text-sm text-gray-500 mb-6">This creates a "Wave 1" group with capacity for 20 pilot parents — your clinic patients and select screened families.</p>
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div><span className="text-gray-500">Name:</span><br /><strong>wave_1</strong></div>
                <div><span className="text-gray-500">Capacity:</span><br /><strong>20 parents</strong></div>
                <div><span className="text-gray-500">Source:</span><br /><strong>Clinic + Screening</strong></div>
              </div>
            </div>
            <button onClick={setupCreateGroup} className="w-full py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700">
              Create Wave 1 Group
            </button>
          </div>
        )}

        {setupStep === 1 && (
          <div className="bg-white rounded-2xl border p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Step 2: Add Your First Parents</h2>
            <p className="text-sm text-gray-500 mb-4">Paste parent details below — one per line. Format: <code className="bg-gray-100 px-1 rounded text-xs">Name, Phone, QR Code</code></p>
            <textarea value={bulkText} onChange={e => setBulkText(e.target.value)} rows={8}
              placeholder={`Priya Sharma, +919876543210, AB12CD34\nRahul Verma, +919876543211, EF56GH78\nAnita Patel, +919876543212`}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 outline-none text-sm font-mono mb-4" />
            <p className="text-xs text-gray-400 mb-4">QR code is optional. Phone format: +91 or 10 digits. You can also add parents one-by-one later from the Invitations tab.</p>
            <div className="flex gap-3">
              <button onClick={() => { setShowSetupWizard(false); setTab('invitations') }} className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200">Skip — I'll add later</button>
              <button onClick={async () => { await createBulkInvitations(); setShowSetupWizard(false); setTab('invitations') }}
                disabled={!bulkText.trim()}
                className="flex-1 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 disabled:opacity-50">
                Create {bulkText.trim().split('\n').filter(l => l.trim()).length || 0} Invitations
              </button>
            </div>
          </div>
        )}

        {message && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">{message}</div>
        )}
      </div>
    )
  }

  // ── Main Dashboard ──
  const tabLabels: Record<Tab, string> = { overview: 'Overview', invitations: 'Invitations', groups: 'Groups', ped_apps: 'Ped Applications', playbook: 'Playbook' }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-gray-900">Pilot Manager</h1><p className="text-sm text-gray-500">Manage invitations, groups, track engagement</p></div>
        <div className="flex gap-2">
          <button onClick={loadData} disabled={loading} className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200 disabled:opacity-50">{loading ? '...' : 'Refresh'}</button>
        </div>
      </div>

      {message && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800 flex justify-between">
          <span>{message}</span><button onClick={() => setMessage(null)} className="text-green-600 font-bold ml-3">×</button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 overflow-x-auto">
        {(['overview', 'invitations', 'groups', 'ped_apps', 'playbook'] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {tabLabels[t]}
            {t === 'playbook' && <span className="ml-1 text-xs">?</span>}
          </button>
        ))}
      </div>

      {/* ══════════ Overview ══════════ */}
      {tab === 'overview' && stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div className="bg-white rounded-xl border p-4"><div className="text-3xl font-bold">{stats.invitations?.total || 0}</div><div className="text-xs text-gray-500">Invitations</div></div>
            <div className="bg-green-50 rounded-xl border border-green-200 p-4"><div className="text-3xl font-bold text-green-700">{stats.invitations?.by_status?.find((s: any) => s.status === 'accepted')?.count || 0}</div><div className="text-xs text-gray-500">Accepted</div></div>
            <div className="bg-blue-50 rounded-xl border border-blue-200 p-4"><div className="text-3xl font-bold text-blue-700">{stats.engagement?.active_parents_7d || 0}</div><div className="text-xs text-gray-500">Active (7d)</div></div>
            <div className="bg-purple-50 rounded-xl border border-purple-200 p-4"><div className="text-3xl font-bold text-purple-700">{stats.pilot_children || 0}</div><div className="text-xs text-gray-500">Life Records</div></div>
            <div className="bg-amber-50 rounded-xl border border-amber-200 p-4"><div className="text-3xl font-bold text-amber-700">{stats.ped_applications?.total || 0}</div><div className="text-xs text-gray-500">Ped Apps</div></div>
          </div>

          {/* Conversion funnel */}
          {(stats.invitations?.total || 0) > 0 && (
            <div className="bg-white rounded-xl border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Conversion Funnel</h3>
              <div className="flex items-center gap-2 text-sm">
                {[
                  { label: 'Invited', val: stats.invitations?.total || 0, color: 'bg-gray-200' },
                  { label: 'Accepted', val: stats.invitations?.by_status?.find((s: any) => s.status === 'accepted')?.count || 0, color: 'bg-green-200' },
                  { label: 'Life Records', val: stats.pilot_children || 0, color: 'bg-blue-200' },
                  { label: 'Active (7d)', val: stats.engagement?.active_parents_7d || 0, color: 'bg-purple-200' },
                ].map((step, i) => (
                  <div key={step.label} className="flex items-center gap-2">
                    {i > 0 && <span className="text-gray-300">→</span>}
                    <div className={`${step.color} rounded-lg px-3 py-2 text-center`}>
                      <div className="font-bold text-gray-900">{step.val}</div>
                      <div className="text-xs text-gray-500">{step.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Groups summary */}
          {stats?.groups?.length > 0 && (
            <div className="bg-white rounded-xl border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Groups</h3>
              <div className="space-y-3">{stats.groups.map((g: any) => (
                <div key={g.name} className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-700 w-32">{g.name}</span>
                  <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${Math.min(100, (g.current_count / g.max_capacity) * 100)}%` }} /></div>
                  <span className="text-sm text-gray-500 w-16 text-right">{g.current_count}/{g.max_capacity}</span>
                </div>
              ))}</div>
            </div>
          )}

          {/* Engagement */}
          <div className="bg-white rounded-xl border p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Engagement (7 Days)</h3>
            {(stats.engagement?.by_type?.length || 0) > 0 ? (
              <div className="space-y-2">{stats.engagement.by_type.map((e: any) => (
                <div key={e.event_type} className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-40">{e.event_type.replace(/_/g, ' ')}</span>
                  <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-green-500 rounded-full" style={{ width: `${Math.min(100, (e.count / Math.max(...stats.engagement.by_type.map((x: any) => x.count))) * 100)}%` }} /></div>
                  <span className="text-sm font-semibold w-12 text-right">{e.count}</span>
                </div>
              ))}</div>
            ) : <p className="text-sm text-gray-400">No events yet. Send invitations to get started.</p>}
          </div>

          {/* Empty state CTA */}
          {(stats.invitations?.total || 0) === 0 && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-8 text-center">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Ready to launch your pilot?</h3>
              <p className="text-sm text-gray-500 mb-4">Start by creating your first pilot group and sending invitations to select parents.</p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => setTab('playbook')} className="px-6 py-2 bg-white border border-green-300 text-green-700 text-sm font-semibold rounded-lg hover:bg-green-50">Read Playbook</button>
                <button onClick={() => { setShowSetupWizard(true); setSetupStep(0) }} className="px-6 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700">Quick Setup</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════ Invitations ══════════ */}
      {tab === 'invitations' && (
        <div className="space-y-6">
          {/* Single invite */}
          <div className="bg-white rounded-xl border p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Create Invitation</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <input value={newInvite.parent_name} onChange={e => setNewInvite({ ...newInvite, parent_name: e.target.value })} placeholder="Parent name" className="px-3 py-2 border rounded-lg text-sm" />
              <input value={newInvite.parent_phone} onChange={e => setNewInvite({ ...newInvite, parent_phone: e.target.value })} placeholder="Phone (+91...)" className="px-3 py-2 border rounded-lg text-sm" />
              <input value={newInvite.child_qr_code} onChange={e => setNewInvite({ ...newInvite, child_qr_code: e.target.value })} placeholder="Screening QR code (optional)" className="px-3 py-2 border rounded-lg text-sm" />
              <select value={newInvite.pilot_group} onChange={e => setNewInvite({ ...newInvite, pilot_group: e.target.value })} className="px-3 py-2 border rounded-lg text-sm">
                <option value="wave_1">Wave 1</option><option value="wave_2">Wave 2</option><option value="clinic_walkin">Clinic Walk-in</option><option value="referral">Referral</option>
              </select>
              <input value={newInvite.notes} onChange={e => setNewInvite({ ...newInvite, notes: e.target.value })} placeholder="Notes (optional)" className="px-3 py-2 border rounded-lg text-sm sm:col-span-2" />
            </div>
            <button onClick={createInvitation} className="mt-4 px-6 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700">Create Invitation</button>
          </div>

          {/* Bulk invite */}
          <details className="bg-white rounded-xl border">
            <summary className="p-4 cursor-pointer font-semibold text-gray-900 hover:bg-gray-50">Bulk Create (paste CSV)</summary>
            <div className="p-6 pt-2">
              <p className="text-xs text-gray-500 mb-3">One parent per line: <code className="bg-gray-100 px-1 rounded">Name, Phone, QR Code</code></p>
              <textarea value={bulkText} onChange={e => setBulkText(e.target.value)} rows={5}
                placeholder="Priya Sharma, +919876543210, AB12CD34&#10;Rahul Verma, +919876543211&#10;Anita Patel, +919876543212, EF56GH78"
                className="w-full px-3 py-2 border rounded-lg text-sm font-mono mb-3" />
              <div className="flex items-center gap-3">
                <select value={bulkGroup} onChange={e => setBulkGroup(e.target.value)} className="px-3 py-2 border rounded-lg text-sm">
                  <option value="wave_1">Wave 1</option><option value="wave_2">Wave 2</option><option value="clinic_walkin">Clinic Walk-in</option>
                </select>
                <button onClick={createBulkInvitations} disabled={!bulkText.trim()} className="px-6 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50">
                  Create {bulkText.trim().split('\n').filter(l => l.trim()).length || 0} Invitations
                </button>
              </div>
            </div>
          </details>

          {/* Invitation list */}
          <div className="bg-white rounded-xl border overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold">All Invitations ({invitations.length})</h3>
              {invitations.filter(i => i.status === 'pending').length > 0 && (
                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">{invitations.filter(i => i.status === 'pending').length} pending</span>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50"><tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Code</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Parent</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Group</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Status</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Actions</th>
                </tr></thead>
                <tbody className="divide-y">
                  {invitations.map((inv: any) => (
                    <tr key={inv.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs font-semibold text-green-700">{inv.invite_code}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{inv.parent_name || '—'}</div>
                        <div className="text-xs text-gray-400">{inv.parent_phone || ''}{inv.child_qr_code ? ` · QR: ${inv.child_qr_code}` : ''}</div>
                      </td>
                      <td className="px-4 py-3"><span className="bg-gray-100 px-2 py-0.5 rounded text-xs">{inv.pilot_group}</span></td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${inv.status === 'accepted' ? 'bg-green-100 text-green-700' : inv.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'}`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          {inv.status === 'pending' && (
                            <button onClick={() => getWhatsApp(inv.id)} className="text-xs text-green-600 hover:text-green-800 font-medium">WhatsApp</button>
                          )}
                          <button onClick={() => copyInviteLink(inv.invite_code)} className="text-xs text-gray-400 hover:text-gray-600">Copy Link</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {invitations.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No invitations yet. Create one above.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ══════════ Groups ══════════ */}
      {tab === 'groups' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Create Group</h3>
            <div className="grid sm:grid-cols-3 gap-4">
              <input value={newGroup.name} onChange={e => setNewGroup({ ...newGroup, name: e.target.value })} placeholder="Group name (e.g. wave_2)" className="px-3 py-2 border rounded-lg text-sm" />
              <input value={newGroup.description} onChange={e => setNewGroup({ ...newGroup, description: e.target.value })} placeholder="Description" className="px-3 py-2 border rounded-lg text-sm" />
              <input type="number" value={newGroup.max_capacity} onChange={e => setNewGroup({ ...newGroup, max_capacity: parseInt(e.target.value) || 50 })} placeholder="Capacity" className="px-3 py-2 border rounded-lg text-sm" />
            </div>
            <button onClick={createGroup} className="mt-4 px-6 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700">Create</button>
          </div>
          {stats?.groups?.length > 0 ? (
            <div className="grid sm:grid-cols-2 gap-4">{stats.groups.map((g: any) => (
              <div key={g.name} className="bg-white rounded-xl border p-6">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-semibold text-gray-900">{g.name}</h4>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${g.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{g.status}</span>
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-green-500 rounded-full" style={{ width: `${Math.min(100, (g.current_count / g.max_capacity) * 100)}%` }} /></div>
                  <span className="text-sm text-gray-500">{g.current_count}/{g.max_capacity}</span>
                </div>
              </div>
            ))}</div>
          ) : (
            <div className="bg-gray-50 rounded-xl p-8 text-center text-gray-400">
              <p>No groups yet. Create "wave_1" to get started.</p>
              <button onClick={setupCreateGroup} className="mt-3 px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700">Quick: Create Wave 1</button>
            </div>
          )}
        </div>
      )}

      {/* ══════════ Ped Applications ══════════ */}
      {tab === 'ped_apps' && (
        <div className="space-y-6">
          {/* Share link card */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-blue-900 text-sm">Ped Registration Page</h4>
              <p className="text-xs text-blue-700">Share this link with pediatricians you want to onboard</p>
            </div>
            <button onClick={() => { navigator.clipboard.writeText('https://parent.skids.clinic/ped/register'); setMessage('Ped registration link copied!') }}
              className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700">
              Copy Link
            </button>
          </div>

          <div className="bg-white rounded-xl border divide-y">
            <div className="p-4 border-b"><h3 className="font-semibold text-gray-900">Applications ({pedApps.length})</h3></div>
            {pedApps.map((app: any) => (
              <div key={app.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900">{app.name}</h4>
                    <p className="text-sm text-gray-500">{app.phone} {app.email && `· ${app.email}`}</p>
                    {app.clinic_name && <p className="text-sm text-gray-500">{app.clinic_name} · {app.city}</p>}
                    {app.specialty && <p className="text-xs text-gray-400">{app.specialty}{app.experience_years ? ` · ${app.experience_years}y exp` : ''}{app.license_number ? ` · ${app.license_number}` : ''}</p>}
                    {app.motivation && <p className="text-sm text-gray-600 mt-2 italic">"{app.motivation}"</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${app.status === 'approved' ? 'bg-green-100 text-green-700' : app.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{app.status}</span>
                    {app.status === 'applied' && (
                      <div className="flex gap-1">
                        <button onClick={() => handlePedAction(app.id, 'approve')} className="px-3 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700">Approve</button>
                        <button onClick={() => handlePedAction(app.id, 'reject')} className="px-3 py-1 bg-red-100 text-red-700 text-xs rounded-lg hover:bg-red-200">Reject</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {pedApps.length === 0 && (
              <div className="p-8 text-center text-gray-400">
                <p>No applications yet.</p>
                <p className="text-xs mt-1">Share the ped registration link to start onboarding pediatricians.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════ Playbook (Help / Guide) ══════════ */}
      {tab === 'playbook' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-1">SKIDS Pilot Playbook</h2>
            <p className="text-sm text-gray-600">Step-by-step guide to launch and run your pilot program. Follow phases 1→6 in order.</p>
          </div>

          {/* Quick links */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
            <a href="/pilot" target="_blank" className="bg-white rounded-xl border p-4 hover:border-green-300 transition-colors">
              <div className="text-lg mb-1">🏠</div>
              <div className="text-sm font-semibold text-gray-900">Parent Landing</div>
              <div className="text-xs text-gray-400">/pilot</div>
            </a>
            <a href="/pilot/register" target="_blank" className="bg-white rounded-xl border p-4 hover:border-green-300 transition-colors">
              <div className="text-lg mb-1">📝</div>
              <div className="text-sm font-semibold text-gray-900">Parent Registration</div>
              <div className="text-xs text-gray-400">/pilot/register</div>
            </a>
            <a href="/ped/register" target="_blank" className="bg-white rounded-xl border p-4 hover:border-green-300 transition-colors">
              <div className="text-lg mb-1">👨‍⚕️</div>
              <div className="text-sm font-semibold text-gray-900">Ped Registration</div>
              <div className="text-xs text-gray-400">/ped/register</div>
            </a>
            <a href="/doctor/dashboard" target="_blank" className="bg-white rounded-xl border p-4 hover:border-green-300 transition-colors">
              <div className="text-lg mb-1">🩺</div>
              <div className="text-sm font-semibold text-gray-900">Doctor Dashboard</div>
              <div className="text-xs text-gray-400">/doctor/dashboard</div>
            </a>
            <a href="/report" target="_blank" className="bg-white rounded-xl border p-4 hover:border-green-300 transition-colors">
              <div className="text-lg mb-1">📋</div>
              <div className="text-sm font-semibold text-gray-900">Screening Report</div>
              <div className="text-xs text-gray-400">/report</div>
            </a>
            <a href="/admin" target="_blank" className="bg-white rounded-xl border p-4 hover:border-green-300 transition-colors">
              <div className="text-lg mb-1">⚙️</div>
              <div className="text-sm font-semibold text-gray-900">Admin CRM</div>
              <div className="text-xs text-gray-400">/admin</div>
            </a>
          </div>

          {/* Playbook sections */}
          {PLAYBOOK_SECTIONS.map(section => (
            <details key={section.id} className="bg-white rounded-xl border group" open={section.id === 'quick_start'}>
              <summary className="p-4 cursor-pointer flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    section.phase === 'Setup' ? 'bg-green-100 text-green-700' :
                    section.phase === 'Outreach' ? 'bg-blue-100 text-blue-700' :
                    section.phase === 'Parent Journey' ? 'bg-purple-100 text-purple-700' :
                    section.phase === 'Ped Onboarding' ? 'bg-amber-100 text-amber-700' :
                    section.phase === 'Monitoring' ? 'bg-cyan-100 text-cyan-700' :
                    'bg-rose-100 text-rose-700'
                  }`}>{section.phase}</span>
                  <span className="font-semibold text-gray-900 text-sm">{section.title}</span>
                </div>
                <svg className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </summary>
              <div className="px-4 pb-4">
                <div className="space-y-2 ml-2">
                  {section.steps.map((step, i) => (
                    <div key={i} className="flex items-start gap-3 py-1">
                      <div className="w-5 h-5 rounded-full border-2 border-gray-200 flex-shrink-0 mt-0.5 flex items-center justify-center">
                        <span className="text-[10px] text-gray-400">{i + 1}</span>
                      </div>
                      <p className={`text-sm ${step.text.startsWith('  ') ? 'text-gray-400 ml-4' : 'text-gray-700'}`}>{step.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </details>
          ))}

          {/* API reference */}
          <details className="bg-white rounded-xl border">
            <summary className="p-4 cursor-pointer flex items-center justify-between hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold px-2 py-1 rounded-full bg-gray-100 text-gray-700">Reference</span>
                <span className="font-semibold text-gray-900 text-sm">API Endpoints</span>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </summary>
            <div className="px-4 pb-4">
              <div className="text-xs font-mono space-y-1 bg-gray-50 rounded-lg p-4">
                <div className="text-gray-500 mb-2"># Public (parent-facing)</div>
                <div>POST /api/pilot/validate <span className="text-gray-400">— Validate invite code</span></div>
                <div>POST /api/pilot/intelligence-preview <span className="text-gray-400">— Run intelligence on screening</span></div>
                <div>POST /api/pilot/accept <span className="text-gray-400">— Accept invitation</span></div>
                <div>POST /api/pilot/seed-life-record <span className="text-gray-400">— Create child + import screening</span></div>
                <div>POST /api/pilot/engagement <span className="text-gray-400">— Log engagement event</span></div>
                <div>POST /api/ped/apply <span className="text-gray-400">— Ped self-registration</span></div>
                <div className="text-gray-500 mt-3 mb-2"># Admin (manager-facing)</div>
                <div>GET/POST /api/admin/pilot/groups <span className="text-gray-400">— CRUD groups</span></div>
                <div>GET/POST /api/admin/pilot/invitations <span className="text-gray-400">— CRUD invitations</span></div>
                <div>GET /api/admin/pilot/stats <span className="text-gray-400">— Engagement metrics</span></div>
                <div>GET /api/admin/pilot/whatsapp-message <span className="text-gray-400">— Generate WA message</span></div>
                <div>GET/PATCH /api/admin/pilot/ped-applications <span className="text-gray-400">— Manage ped apps</span></div>
              </div>
            </div>
          </details>
        </div>
      )}
    </div>
  )
}
