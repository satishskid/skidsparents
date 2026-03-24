import { useState, useEffect } from 'react'
import { parseDiscountPct, serializeDiscountPct } from '@/lib/pricing/discount'

const KNOWN_FEATURES = [
  'pdf_export',
  'health_score_basic',
  'health_score_detailed',
  'unlimited_children',
  'priority_support',
  'teleconsult_discount_pct',
]

interface Tier {
  id: string
  name: string
  description: string | null
  currency: string
  amount_cents: number
  amount_yearly_cents: number
  features: string[]
  is_active: boolean
  created_at: string
}

interface TierFormData {
  name: string
  description: string
  currency: string
  amount_cents: number
  amount_yearly_cents: number
  features: string[]
  is_active: boolean
}

const EMPTY_FORM: TierFormData = {
  name: '', description: '', currency: 'INR',
  amount_cents: 0, amount_yearly_cents: 0,
  features: [], is_active: true,
}

function TierForm({
  initial, onSave, onCancel, saving, error,
}: {
  initial: TierFormData
  onSave: (data: TierFormData) => void
  onCancel: () => void
  saving: boolean
  error: string | null
}) {
  const [form, setForm] = useState<TierFormData>(initial)
  const [discountPct, setDiscountPct] = useState<number>(parseDiscountPct(initial.features))
  const [discountError, setDiscountError] = useState<string | null>(null)

  const teleconsultChecked = form.features.some(f => f === 'teleconsult_discount_pct' || f.startsWith('teleconsult_discount_pct:'))

  function toggleFeature(key: string) {
    setForm((f) => ({
      ...f,
      features: f.features.includes(key) || f.features.some(fk => fk.startsWith(key + ':'))
        ? f.features.filter((k) => k !== key && !k.startsWith(key + ':'))
        : [...f.features.filter(k => !k.startsWith(key + ':')), key],
    }))
  }

  function handleSave() {
    if (teleconsultChecked) {
      if (discountPct < 0 || discountPct > 100) {
        setDiscountError('Discount must be between 0 and 100')
        return
      }
      setDiscountError(null)
      const serialized = serializeDiscountPct(discountPct)
      const updatedFeatures = [
        ...form.features.filter(f => !f.startsWith('teleconsult_discount_pct')),
        serialized,
      ]
      onSave({ ...form, features: updatedFeatures })
    } else {
      setDiscountError(null)
      onSave(form)
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="block text-xs font-semibold text-gray-600 mb-1">Name *</label>
          <input
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-semibold text-gray-600 mb-1">Description</label>
          <input
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Monthly (paise)</label>
          <input
            type="number" min={0}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            value={form.amount_cents}
            onChange={(e) => setForm((f) => ({ ...f, amount_cents: Number(e.target.value) }))}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Yearly (paise)</label>
          <input
            type="number" min={0}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            value={form.amount_yearly_cents}
            onChange={(e) => setForm((f) => ({ ...f, amount_yearly_cents: Number(e.target.value) }))}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Currency</label>
          <input
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            value={form.currency}
            onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}
          />
        </div>
        <div className="flex items-end pb-2">
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
            />
            Active
          </label>
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-gray-600 mb-2">Features</p>
        <div className="grid grid-cols-2 gap-1.5">
          {KNOWN_FEATURES.map((key) => (
            <label key={key} className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={form.features.includes(key) || form.features.some(f => f.startsWith(key + ':'))}
                onChange={() => toggleFeature(key)}
              />
              {key}
            </label>
          ))}
        </div>
        {teleconsultChecked && (
          <div className="mt-2">
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Teleconsult Discount (%)
            </label>
            <input
              type="number"
              min={0}
              max={100}
              className="w-32 border border-gray-200 rounded-lg px-3 py-2 text-sm"
              value={discountPct}
              onChange={(e) => {
                setDiscountPct(Number(e.target.value))
                setDiscountError(null)
              }}
            />
            {discountError && (
              <p className="text-xs text-red-600 mt-1">{discountError}</p>
            )}
          </div>
        )}
      </div>

      {error && <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

      <div className="flex gap-2 justify-end pt-2">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving || !form.name}
          className="px-4 py-2 text-sm font-semibold bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  )
}

export default function PricingManager({ adminKey }: { adminKey: string }) {
  const [tiers, setTiers] = useState<Tier[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<{ mode: 'create' | 'edit'; tier?: Tier } | null>(null)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [rowErrors, setRowErrors] = useState<Record<string, string>>({})

  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${adminKey}` }

  async function loadTiers() {
    const res = await fetch('/api/admin/pricing/tiers', { headers })
    if (res.ok) {
      const data = await res.json() as { tiers: Tier[] }
      setTiers(data.tiers)
    }
    setLoading(false)
  }

  useEffect(() => { void loadTiers() }, [])

  async function handleSave(data: TierFormData) {
    setSaving(true)
    setFormError(null)
    const isEdit = modal?.mode === 'edit'
    const url = isEdit ? `/api/admin/pricing/tiers/${modal!.tier!.id}` : '/api/admin/pricing/tiers'
    const method = isEdit ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers,
      body: JSON.stringify({ ...data, features_json: data.features }),
    })

    if (res.ok) {
      setModal(null)
      await loadTiers()
    } else {
      const err = await res.json() as { error?: string }
      setFormError(err.error ?? 'Failed to save tier')
    }
    setSaving(false)
  }

  async function handleDeactivate(tier: Tier) {
    setRowErrors((e) => ({ ...e, [tier.id]: '' }))
    const res = await fetch(`/api/admin/pricing/tiers/${tier.id}`, { method: 'DELETE', headers })
    if (res.ok) {
      await loadTiers()
    } else {
      const err = await res.json() as { error?: string }
      setRowErrors((e) => ({ ...e, [tier.id]: err.error ?? 'Failed to deactivate' }))
    }
  }

  if (loading) {
    return <div className="p-6 text-sm text-gray-500">Loading pricing tiers…</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Pricing Tiers</h2>
        <button
          onClick={() => { setModal({ mode: 'create' }); setFormError(null) }}
          className="px-4 py-2 text-sm font-semibold bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          + New Tier
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-100">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Monthly</th>
              <th className="px-4 py-3 text-left">Yearly</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Features</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {tiers.map((tier) => (
              <tr key={tier.id} className="bg-white hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{tier.name}</td>
                <td className="px-4 py-3 text-gray-600">
                  {tier.amount_cents === 0 ? 'Free' : `${tier.currency} ${(tier.amount_cents / 100).toFixed(2)}`}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {tier.amount_yearly_cents === 0 ? '—' : `${tier.currency} ${(tier.amount_yearly_cents / 100).toFixed(2)}`}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${tier.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {tier.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs max-w-xs truncate">
                  {tier.features.join(', ') || '—'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 justify-end">
                    <button
                      onClick={() => { setModal({ mode: 'edit', tier }); setFormError(null) }}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                    {tier.is_active && (
                      <button
                        onClick={() => handleDeactivate(tier)}
                        className="text-xs text-red-500 hover:underline"
                      >
                        Deactivate
                      </button>
                    )}
                  </div>
                  {rowErrors[tier.id] && (
                    <p className="text-xs text-red-600 mt-1">{rowErrors[tier.id]}</p>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
            <h3 className="text-base font-bold text-gray-900 mb-4">
              {modal.mode === 'create' ? 'New Tier' : `Edit — ${modal.tier?.name}`}
            </h3>
            <TierForm
              initial={modal.mode === 'edit' && modal.tier
                ? {
                    name: modal.tier.name,
                    description: modal.tier.description ?? '',
                    currency: modal.tier.currency,
                    amount_cents: modal.tier.amount_cents,
                    amount_yearly_cents: modal.tier.amount_yearly_cents,
                    features: modal.tier.features,
                    is_active: modal.tier.is_active,
                  }
                : EMPTY_FORM}
              onSave={handleSave}
              onCancel={() => setModal(null)}
              saving={saving}
              error={formError}
            />
          </div>
        </div>
      )}
    </div>
  )
}
