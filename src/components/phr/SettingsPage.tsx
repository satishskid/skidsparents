/**
 * SettingsPage — Parent preferences
 *
 * Sections:
 * - Notification preferences (toggle each nudge type)
 * - Phase 2 Features (voice notes, vernacular — off by default)
 * - About
 */

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'

interface Settings {
  notificationsEnabled: boolean
  nudgeMilestones: boolean
  nudgeObservationGaps: boolean
  nudgePatterns: boolean
  nudgeCelebrations: boolean
  voiceNotesEnabled: boolean
  vernacularLanguage: string | null
}

const DEFAULT_SETTINGS: Settings = {
  notificationsEnabled: true,
  nudgeMilestones: true,
  nudgeObservationGaps: true,
  nudgePatterns: true,
  nudgeCelebrations: true,
  voiceNotesEnabled: false,
  vernacularLanguage: null,
}

export default function SettingsPage() {
  const { user, token, signOut } = useAuth()
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const fetchSettings = useCallback(async () => {
    if (!token) return
    try {
      const res = await fetch('/api/settings', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setSettings(data.settings || DEFAULT_SETTINGS)
      }
    } catch {} finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  async function updateSetting(key: keyof Settings, value: any) {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    setSaving(true)

    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ [key]: value }),
      })
    } catch {} finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        <div className="bg-white rounded-2xl p-6 animate-pulse h-20" />
        <div className="bg-white rounded-2xl p-6 animate-pulse h-40" />
        <div className="bg-white rounded-2xl p-6 animate-pulse h-24" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <a href="/me" className="text-gray-400 hover:text-gray-600">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </a>
        <h1 className="text-lg font-bold text-gray-900">Settings</h1>
        {saving && <span className="text-xs text-green-600">Saving...</span>}
      </div>

      {/* Profile */}
      {user && (
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Profile</h2>
          <div className="flex items-center gap-3">
            {user.photoURL ? (
              <img src={user.photoURL} alt="" className="w-10 h-10 rounded-full" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-sm">
                {(user.displayName || user.email || '?')[0].toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-sm font-semibold text-gray-900">{user.displayName || 'Parent'}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
          </div>
        </div>
      )}

      {/* Notifications */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Notifications</h2>

        <ToggleRow
          label="All notifications"
          description="Enable or disable all nudges"
          enabled={settings.notificationsEnabled}
          onChange={(v) => updateSetting('notificationsEnabled', v)}
        />

        {settings.notificationsEnabled && (
          <div className="ml-4 mt-2 space-y-1 border-l-2 border-gray-100 pl-3">
            <ToggleRow
              label="Milestone alerts"
              description="Developmental windows approaching"
              enabled={settings.nudgeMilestones}
              onChange={(v) => updateSetting('nudgeMilestones', v)}
              compact
            />
            <ToggleRow
              label="Observation gaps"
              description="Domains with no recent observations"
              enabled={settings.nudgeObservationGaps}
              onChange={(v) => updateSetting('nudgeObservationGaps', v)}
              compact
            />
            <ToggleRow
              label="Pattern alerts"
              description="Frequent observations in same area"
              enabled={settings.nudgePatterns}
              onChange={(v) => updateSetting('nudgePatterns', v)}
              compact
            />
            <ToggleRow
              label="Celebrations"
              description="Milestone achievements"
              enabled={settings.nudgeCelebrations}
              onChange={(v) => updateSetting('nudgeCelebrations', v)}
              compact
            />
          </div>
        )}
      </div>

      {/* Phase 2 Features */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Experimental Features</h2>

        <ToggleRow
          label="Voice notes"
          description="Hold-to-talk voice observation capture"
          enabled={settings.voiceNotesEnabled}
          onChange={(v) => updateSetting('voiceNotesEnabled', v)}
          badge="Coming Soon"
          disabled
        />

        <div className="mt-3 pt-3 border-t border-gray-100">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Vernacular language
          </label>
          <p className="text-xs text-gray-500 mb-2">Voice input in your language (coming soon)</p>
          <select
            value={settings.vernacularLanguage || ''}
            onChange={(e) => updateSetting('vernacularLanguage', e.target.value || null)}
            disabled
            className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-400"
          >
            <option value="">English (default)</option>
            <option value="hi">Hindi</option>
            <option value="ta">Tamil</option>
            <option value="te">Telugu</option>
            <option value="kn">Kannada</option>
            <option value="mr">Marathi</option>
            <option value="bn">Bengali</option>
          </select>
        </div>
      </div>

      {/* Sign Out */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
        <button
          onClick={() => { signOut?.(); window.location.href = '/' }}
          className="w-full py-2.5 rounded-xl border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 transition-colors"
        >
          Sign Out
        </button>
      </div>

      {/* Version */}
      <div className="text-center py-2">
        <p className="text-[10px] text-gray-400">SKIDS Life Record v2.0 · Built with love for parents</p>
      </div>
    </div>
  )
}

// Toggle row sub-component
function ToggleRow({ label, description, enabled, onChange, badge, disabled, compact }: {
  label: string
  description: string
  enabled: boolean
  onChange: (value: boolean) => void
  badge?: string
  disabled?: boolean
  compact?: boolean
}) {
  return (
    <div className={`flex items-center gap-3 ${compact ? 'py-1.5' : 'py-2'}`}>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className={`${compact ? 'text-xs' : 'text-sm'} font-medium text-gray-700`}>{label}</span>
          {badge && (
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-purple-50 text-purple-600 font-medium">{badge}</span>
          )}
        </div>
        <p className={`${compact ? 'text-[10px]' : 'text-xs'} text-gray-500`}>{description}</p>
      </div>
      <button
        onClick={() => !disabled && onChange(!enabled)}
        disabled={disabled}
        className={`relative w-10 h-6 rounded-full transition-colors ${
          disabled ? 'opacity-40 cursor-not-allowed' :
          enabled ? 'bg-green-500' : 'bg-gray-300'
        }`}
      >
        <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
          enabled ? 'translate-x-[18px]' : 'translate-x-0.5'
        }`} />
      </button>
    </div>
  )
}
