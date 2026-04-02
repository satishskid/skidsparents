/**
 * InterventionsTab — Doctor's view of patient interventions.
 *
 * Shows in PatientPHRView as a tab alongside existing Protocols tab.
 * Active assignments with compliance %, parameter summary, escalation badges.
 * Prescribe/Adjust/Pause/Cancel controls.
 */

import { useState, useEffect, useCallback } from 'react'

interface Assignment {
  id: string
  protocol_name: string
  category: string
  subspecialty: string
  status: string
  start_date: string
  end_date: string
  custom_params_json: string
  doctor_notes: string
  child_region: string
  child_ethnic_origin: string
  default_duration_days: number
  current_streak: number
  longest_streak: number
  compliance_pct: number
  total_done: number
  total_skipped: number
  total_partial: number
}

interface Protocol {
  id: string
  slug: string
  name: string
  category: string
  subspecialty: string
  condition_name: string
  region: string
  protocol_authority: string
  description: string
  evidence_base: string
  default_duration_days: number
  customizable_params_json: any
}

interface Escalation {
  id: string
  escalation_type: string
  severity: string
  title: string
  detail: string
  status: string
  created_at: string
}

const CATEGORY_EMOJI: Record<string, string> = {
  vision: '👁️', hearing: '👂', dental: '🦷', developmental: '🧩',
  nutrition: '🥄', skin: '🧴', respiratory: '🫁', physio: '🏋️',
  behavioral: '🧠', growth: '📏', cardiac: '❤️', allergy: '🤧',
}

const SEVERITY_COLORS: Record<string, string> = {
  info: 'bg-blue-100 text-blue-700',
  warning: 'bg-amber-100 text-amber-700',
  urgent: 'bg-red-100 text-red-700',
}

export default function InterventionsTab({
  childId,
  token,
}: {
  childId: string
  token: string
}) {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [protocols, setProtocols] = useState<Protocol[]>([])
  const [escalations, setEscalations] = useState<Escalation[]>([])
  const [loading, setLoading] = useState(true)
  const [showPrescribe, setShowPrescribe] = useState(false)
  const [selectedProtocol, setSelectedProtocol] = useState<string>('')
  const [customParams, setCustomParams] = useState<Record<string, any>>({})
  const [prescribeNotes, setPrescribeNotes] = useState('')
  const [prescribing, setPrescribing] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      const [assignRes, protoRes, escRes] = await Promise.all([
        fetch(`/api/doctor/interventions/compliance?childId=${childId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => null),
        fetch(`/api/doctor/interventions?childId=${childId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`/api/doctor/interventions/escalations?childId=${childId}&status=open`, {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => null),
      ])

      if (protoRes.ok) {
        const data = await protoRes.json()
        setProtocols(data.protocols || [])
      }

      // Get assignments from active endpoint
      const activeRes = await fetch(`/api/interventions/active?childId=${childId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (activeRes.ok) {
        const data = await activeRes.json()
        setAssignments(data.assignments || [])
      }

      if (escRes?.ok) {
        const data = await escRes.json()
        setEscalations(data.escalations || [])
      }
    } catch {} finally {
      setLoading(false)
    }
  }, [childId, token])

  useEffect(() => { fetchData() }, [fetchData])

  async function prescribeIntervention() {
    if (!selectedProtocol) return
    setPrescribing(true)
    try {
      const protocol = protocols.find(p => p.slug === selectedProtocol)
      const res = await fetch('/api/doctor/interventions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          protocolSlug: selectedProtocol,
          childId,
          customParams,
          notes: prescribeNotes,
        }),
      })
      if (res.ok) {
        setShowPrescribe(false)
        setSelectedProtocol('')
        setCustomParams({})
        setPrescribeNotes('')
        fetchData()
      }
    } catch {} finally {
      setPrescribing(false)
    }
  }

  async function updateAssignment(assignmentId: string, action: string) {
    try {
      await fetch('/api/doctor/interventions', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ assignmentId, action }),
      })
      fetchData()
    } catch {}
  }

  async function resolveEscalation(escalationId: string, action: string) {
    try {
      await fetch('/api/doctor/interventions/escalations', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ escalationId, action }),
      })
      fetchData()
    } catch {}
  }

  if (loading) {
    return <div className="space-y-3">
      <div className="bg-white rounded-xl p-4 animate-pulse h-20" />
      <div className="bg-white rounded-xl p-4 animate-pulse h-32" />
    </div>
  }

  const selectedProto = protocols.find(p => p.slug === selectedProtocol)

  return (
    <div className="space-y-4">
      {/* Escalations */}
      {escalations.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-red-600 uppercase tracking-wider">Open Alerts</h3>
          {escalations.map(esc => (
            <div key={esc.id} className={`rounded-xl p-3 border ${
              esc.severity === 'urgent' ? 'border-red-200 bg-red-50' :
              esc.severity === 'warning' ? 'border-amber-200 bg-amber-50' :
              'border-blue-200 bg-blue-50'
            }`}>
              <div className="flex items-start gap-2">
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${SEVERITY_COLORS[esc.severity]}`}>
                  {esc.severity}
                </span>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-gray-800">{esc.title}</p>
                  <p className="text-[10px] text-gray-600 mt-0.5">{esc.detail}</p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => resolveEscalation(esc.id, 'acknowledge')}
                    className="text-[10px] px-2 py-1 bg-white rounded-lg text-gray-600 hover:bg-gray-50"
                  >
                    Ack
                  </button>
                  <button
                    onClick={() => resolveEscalation(esc.id, 'resolve')}
                    className="text-[10px] px-2 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600"
                  >
                    Resolve
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Active Assignments */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Interventions</h3>
          <button
            onClick={() => setShowPrescribe(!showPrescribe)}
            className="text-xs px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            + Prescribe
          </button>
        </div>

        {assignments.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">No active interventions</p>
        ) : (
          <div className="space-y-2">
            {assignments.map((a: any) => {
              const emoji = CATEGORY_EMOJI[a.category] || '💊'
              const dayNumber = a.dayNumber || 1
              return (
                <div key={a.id} className="bg-white rounded-xl border border-gray-100 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span>{emoji}</span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-800">{a.protocolName}</p>
                      <p className="text-[10px] text-gray-500">Day {dayNumber}/{a.durationDays}</p>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      a.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {a.status}
                    </span>
                  </div>

                  {/* Compliance bar */}
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          (a.streak?.compliancePct || 0) >= 70 ? 'bg-green-500' :
                          (a.streak?.compliancePct || 0) >= 40 ? 'bg-amber-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${a.streak?.compliancePct || 0}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-gray-600">
                      {Math.round(a.streak?.compliancePct || 0)}%
                    </span>
                  </div>

                  {/* Quick stats */}
                  <div className="flex gap-3 text-[10px] text-gray-500">
                    <span>Done: {a.streak?.totalDone || 0}</span>
                    <span>Skipped: {a.streak?.totalSkipped || 0}</span>
                    <span>Streak: {a.streak?.currentStreak || 0}d</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1 mt-2 pt-2 border-t border-gray-100">
                    {a.status === 'active' && (
                      <button
                        onClick={() => updateAssignment(a.id, 'pause')}
                        className="text-[10px] px-2 py-1 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100"
                      >
                        Pause
                      </button>
                    )}
                    {a.status === 'paused' && (
                      <button
                        onClick={() => updateAssignment(a.id, 'resume')}
                        className="text-[10px] px-2 py-1 bg-green-50 text-green-700 rounded-lg hover:bg-green-100"
                      >
                        Resume
                      </button>
                    )}
                    <button
                      onClick={() => updateAssignment(a.id, 'cancel')}
                      className="text-[10px] px-2 py-1 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Prescribe Modal */}
      {showPrescribe && (
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
          <h3 className="text-sm font-semibold text-blue-800 mb-3">Prescribe Intervention</h3>

          <select
            value={selectedProtocol}
            onChange={(e) => {
              setSelectedProtocol(e.target.value)
              setCustomParams({})
            }}
            className="w-full px-3 py-2 rounded-lg border border-blue-200 bg-white text-sm mb-3"
          >
            <option value="">Select protocol...</option>
            {protocols.map(p => (
              <option key={p.slug} value={p.slug}>
                {CATEGORY_EMOJI[p.category] || '💊'} {p.name} ({p.protocol_authority} · {p.region})
              </option>
            ))}
          </select>

          {selectedProto && (
            <>
              <p className="text-xs text-gray-600 mb-2">{selectedProto.description}</p>
              <p className="text-[10px] text-gray-500 mb-3">{selectedProto.evidence_base}</p>

              {/* Customizable params */}
              {selectedProto.customizable_params_json && (
                <div className="space-y-2 mb-3">
                  {(Array.isArray(selectedProto.customizable_params_json)
                    ? selectedProto.customizable_params_json
                    : Object.entries(selectedProto.customizable_params_json).map(([key, val]: any) => ({ key, ...val }))
                  ).map((param: any) => (
                    <div key={param.key}>
                      <label className="text-[10px] font-medium text-gray-600">{param.label || param.key}</label>
                      {param.type === 'number' ? (
                        <input
                          type="number"
                          min={param.min}
                          max={param.max}
                          value={customParams[param.key] ?? param.defaultValue ?? param.default}
                          onChange={(e) => setCustomParams(prev => ({ ...prev, [param.key]: Number(e.target.value) }))}
                          className="w-full px-2 py-1 rounded-lg border border-gray-200 text-sm mt-0.5"
                        />
                      ) : param.type === 'select' ? (
                        <select
                          value={customParams[param.key] ?? param.defaultValue ?? param.default}
                          onChange={(e) => setCustomParams(prev => ({ ...prev, [param.key]: e.target.value }))}
                          className="w-full px-2 py-1 rounded-lg border border-gray-200 text-sm mt-0.5"
                        >
                          {(param.options || []).map((opt: string) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      ) : param.type === 'boolean' ? (
                        <label className="flex items-center gap-2 mt-0.5">
                          <input
                            type="checkbox"
                            checked={customParams[param.key] ?? param.defaultValue ?? param.default}
                            onChange={(e) => setCustomParams(prev => ({ ...prev, [param.key]: e.target.checked }))}
                          />
                          <span className="text-xs text-gray-600">{param.label}</span>
                        </label>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}

              <textarea
                value={prescribeNotes}
                onChange={(e) => setPrescribeNotes(e.target.value)}
                placeholder="Clinical notes..."
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm mb-3"
                rows={2}
              />

              <div className="flex gap-2">
                <button
                  onClick={prescribeIntervention}
                  disabled={prescribing}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 disabled:opacity-50"
                >
                  {prescribing ? 'Prescribing...' : 'Prescribe'}
                </button>
                <button
                  onClick={() => setShowPrescribe(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-600 rounded-lg text-sm"
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
