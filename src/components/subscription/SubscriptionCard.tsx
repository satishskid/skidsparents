import { useState, useEffect, useCallback } from 'react'
import { computeDiscountedPrice, parseDiscountPct } from '@/lib/pricing/discount'

interface Subscription {
  id: string
  tier_id: string
  status: string
  started_at: string
  expires_at: string | null
  billing_cycle: string
  features_snapshot_json: string
}

interface Props {
  token: string
}

const FEATURE_LABELS: Record<string, string> = {
  health_score_detailed: 'Detailed Health Score',
  teleconsult_discount_pct: 'Teleconsult Discount',
  unlimited_observations: 'Unlimited Observations',
  growth_insights: 'Growth Insights',
  nutrition_assessment: 'Nutrition Assessment',
  hearing_tracker: 'Hearing Tracker',
  vision_dashboard: 'Vision Dashboard',
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function parseFeatures(json: string): string[] {
  try { return JSON.parse(json) as string[] } catch { return [] }
}

export default function SubscriptionCard({ token }: Props) {
  const [subscription, setSubscription] = useState<Subscription | null | undefined>(undefined)
  const [features, setFeatures] = useState<string[]>([])
  const [error, setError] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [confirmCancel, setConfirmCancel] = useState(false)
  const [cancelError, setCancelError] = useState(false)

  const fetchSub = useCallback(async () => {
    setError(false)
    try {
      const res = await fetch('/api/subscriptions/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error()
      const data = await res.json() as { subscription: Subscription | null; features: string[] }
      setSubscription(data.subscription)
      setFeatures(data.features)
    } catch {
      setError(true)
    }
  }, [token])

  useEffect(() => { fetchSub() }, [fetchSub])

  async function handleCancel() {
    setCancelling(true)
    setCancelError(false)
    try {
      const res = await fetch('/api/subscriptions/cancel', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error()
      setConfirmCancel(false)
      await fetchSub()
    } catch {
      setCancelError(true)
    } finally {
      setCancelling(false)
    }
  }

  // Loading
  if (subscription === undefined && !error) {
    return <div className="bg-gray-100 rounded-2xl h-24 animate-pulse" />
  }

  // Error
  if (error) {
    return (
      <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center justify-between">
        <span className="text-sm text-red-600">Could not load subscription</span>
        <button onClick={fetchSub} className="text-sm font-semibold text-red-600 hover:text-red-700">
          Retry
        </button>
      </div>
    )
  }

  const sub = subscription
  const tierName = sub ? sub.tier_id.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : 'Free Plan'
  const featurePills = sub ? parseFeatures(sub.features_snapshot_json) : features
  const discountPct = parseDiscountPct(featurePills)
  const isActive = sub?.status === 'active'

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold text-gray-900">{tierName}</div>
          {sub && (
            <div className="text-xs text-gray-400 mt-0.5">
              Expires {formatDate(sub.expires_at)}
            </div>
          )}
        </div>
        {sub && (
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
            isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
          }`}>
            {sub.billing_cycle === 'monthly' ? 'Monthly' : sub.billing_cycle === 'annual' ? 'Annual' : sub.billing_cycle}
          </span>
        )}
      </div>

      {featurePills.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {featurePills.map((f) => {
            const key = f.split(':')[0]
            const label = FEATURE_LABELS[key] ?? key
            const extra = discountPct > 0 && key === 'teleconsult_discount_pct' ? ` (${discountPct}% off)` : ''
            return (
              <span key={f} className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">
                {label}{extra}
              </span>
            )
          })}
        </div>
      )}

      {isActive && !confirmCancel && (
        <button
          onClick={() => setConfirmCancel(true)}
          className="text-xs text-red-500 hover:text-red-600 font-medium"
        >
          Cancel Plan
        </button>
      )}

      {confirmCancel && (
        <div className="space-y-2">
          <p className="text-xs text-gray-600">Are you sure you want to cancel your plan?</p>
          {cancelError && (
            <p className="text-xs text-red-500">Something went wrong. Please try again.</p>
          )}
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="text-xs font-semibold text-white bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-lg disabled:opacity-50"
            >
              {cancelling ? 'Cancelling…' : 'Yes, cancel'}
            </button>
            <button
              onClick={() => { setConfirmCancel(false); setCancelError(false) }}
              className="text-xs font-medium text-gray-600 hover:text-gray-800 px-3 py-1.5 rounded-lg border border-gray-200"
            >
              Keep Plan
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
