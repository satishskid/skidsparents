import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'

type Step = 'service' | 'child' | 'provider' | 'summary' | 'payment'

interface Service {
  id: string
  name: string
  priceCents: number
  category: string
  deliveryType: string
  slug: string
}

interface Child {
  id: string
  name: string
  dob: string
  gender?: string
}

interface Provider {
  id: string
  name: string
  type: string
  specializationsJson?: string
  city?: string
  rating?: number
  commissionPct?: number
}

interface Slot {
  id: string
  startTime: string
  endTime: string
  slotType: string
  date?: string
  dayOfWeek?: number
}

interface SelectedSlot extends Slot {
  date: string
  providerId: string
}

const STEP_LABELS = ['Service', 'Child', 'Provider', 'Summary', 'Payment']
const STEPS: Step[] = ['service', 'child', 'provider', 'summary', 'payment']

function StepIndicator({ current }: { current: Step }) {
  const idx = STEPS.indexOf(current)
  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {STEPS.map((s, i) => (
        <div key={s} className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
              i < idx
                ? 'bg-green-600 text-white'
                : i === idx
                ? 'bg-green-600 text-white ring-2 ring-green-300'
                : 'bg-gray-200 text-gray-500'
            }`}
          >
            {i < idx ? '✓' : i + 1}
          </div>
          {i < STEPS.length - 1 && (
            <div className={`w-6 h-0.5 ${i < idx ? 'bg-green-600' : 'bg-gray-200'}`} />
          )}
        </div>
      ))}
    </div>
  )
}

function Spinner() {
  return (
    <div className="flex justify-center py-10">
      <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

// ─── Step 1: Service Selector ──────────────────────────

function ServiceSelector({ onSelect }: { onSelect: (s: Service) => void }) {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/services')
      .then(r => r.json())
      .then((data: any) => {
        const rows = Array.isArray(data) ? data : data.services || []
        setServices(
          rows.map((r: any) => ({
            id: r.id,
            name: r.name,
            priceCents: r.price_cents ?? r.priceCents ?? 0,
            category: r.category,
            deliveryType: r.delivery_type ?? r.deliveryType,
            slug: r.slug,
          }))
        )
      })
      .catch(() => setError('Failed to load services'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner />
  if (error) return <p className="text-red-600 text-sm text-center">{error}</p>

  return (
    <div>
      <h2 className="text-lg font-bold text-gray-900 mb-4">Choose a Service</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {services.map(s => (
          <button
            key={s.id}
            onClick={() => onSelect(s)}
            className="text-left p-4 rounded-2xl border border-gray-200 bg-white hover:border-green-500 hover:shadow-sm transition-all"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="font-semibold text-gray-900 text-sm">{s.name}</span>
              <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full whitespace-nowrap">
                {s.category}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-green-700 font-bold text-base">
                ₹{(s.priceCents / 100).toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-gray-400 capitalize">{s.deliveryType?.replace('_', ' ')}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Step 2: Child Selector ────────────────────────────

function ChildSelector({ token, onSelect }: { token: string; onSelect: (c: Child) => void }) {
  const [children, setChildren] = useState<Child[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/children', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then((data: any) => setChildren(data.children || []))
      .catch(() => setError('Failed to load children'))
      .finally(() => setLoading(false))
  }, [token])

  const genderEmoji = (g?: string) => (g === 'female' ? '👧' : g === 'male' ? '👦' : '🧒')

  if (loading) return <Spinner />
  if (error) return <p className="text-red-600 text-sm text-center">{error}</p>
  if (!children.length)
    return (
      <p className="text-gray-500 text-sm text-center py-8">
        No children found. Please add a child profile first.
      </p>
    )

  return (
    <div>
      <h2 className="text-lg font-bold text-gray-900 mb-4">Who is this for?</h2>
      <div className="flex flex-col gap-3">
        {children.map(c => (
          <button
            key={c.id}
            onClick={() => onSelect(c)}
            className="flex items-center gap-4 p-4 rounded-2xl border border-gray-200 bg-white hover:border-green-500 hover:shadow-sm transition-all text-left"
          >
            <span className="text-3xl">{genderEmoji(c.gender)}</span>
            <div>
              <p className="font-semibold text-gray-900">{c.name}</p>
              <p className="text-xs text-gray-400">DOB: {c.dob}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Step 3: Provider + Slot Picker ───────────────────

function ProviderSlotPicker({
  token,
  serviceId,
  onSelect,
}: {
  token: string
  serviceId: string
  onSelect: (slot: SelectedSlot, provider: Provider) => void
}) {
  const [providers, setProviders] = useState<Provider[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null)
  const [date, setDate] = useState('')
  const [slots, setSlots] = useState<Slot[]>([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [slotsError, setSlotsError] = useState('')

  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    fetch(`/api/bookings/providers?serviceId=${serviceId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then((data: any) => setProviders(data.providers || []))
      .catch(() => setError('Failed to load providers'))
      .finally(() => setLoading(false))
  }, [serviceId, token])

  useEffect(() => {
    if (!selectedProvider || !date) return
    setSlotsLoading(true)
    setSlotsError('')
    setSlots([])
    fetch(
      `/api/bookings/slots?serviceId=${serviceId}&providerId=${selectedProvider.id}&date=${date}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
      .then(r => r.json())
      .then((data: any) => setSlots(data.slots || []))
      .catch(() => setSlotsError('Failed to load slots'))
      .finally(() => setSlotsLoading(false))
  }, [selectedProvider, date, serviceId, token])

  const stars = (rating?: number) => {
    if (!rating) return null
    return (
      <span className="text-yellow-500 text-xs">
        {'★'.repeat(Math.round(rating))}{'☆'.repeat(5 - Math.round(rating))}
        <span className="text-gray-400 ml-1">{rating.toFixed(1)}</span>
      </span>
    )
  }

  if (loading) return <Spinner />
  if (error) return <p className="text-red-600 text-sm text-center">{error}</p>
  if (!providers.length)
    return (
      <p className="text-gray-500 text-sm text-center py-8">
        No providers available for this service right now.
      </p>
    )

  return (
    <div>
      <h2 className="text-lg font-bold text-gray-900 mb-4">Choose a Provider</h2>
      <div className="flex flex-col gap-3 mb-5">
        {providers.map(p => {
          const specs = p.specializationsJson ? JSON.parse(p.specializationsJson) : []
          return (
            <button
              key={p.id}
              onClick={() => { setSelectedProvider(p); setDate(''); setSlots([]) }}
              className={`text-left p-4 rounded-2xl border transition-all ${
                selectedProvider?.id === p.id
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 bg-white hover:border-green-400'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-gray-900">{p.name}</p>
                  <p className="text-xs text-gray-400 capitalize">{p.type?.replace('_', ' ')}{p.city ? ` · ${p.city}` : ''}</p>
                </div>
                {stars(p.rating)}
              </div>
              {specs.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {specs.slice(0, 3).map((s: string) => (
                    <span key={s} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </button>
          )
        })}
      </div>

      {selectedProvider && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Select Date</label>
          <input
            type="date"
            min={today}
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      )}

      {date && selectedProvider && (
        <div className="mt-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Available Slots</p>
          {slotsLoading && <Spinner />}
          {slotsError && <p className="text-red-600 text-sm">{slotsError}</p>}
          {!slotsLoading && !slotsError && slots.length === 0 && (
            <p className="text-gray-400 text-sm">No slots available on this date.</p>
          )}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {slots.map(slot => (
              <button
                key={slot.id}
                onClick={() =>
                  onSelect({ ...slot, date, providerId: selectedProvider.id }, selectedProvider)
                }
                className="py-2 px-3 rounded-xl border border-green-200 bg-green-50 text-green-800 text-sm font-medium hover:bg-green-100 transition-colors"
              >
                {slot.startTime} – {slot.endTime}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Step 4: Order Summary ─────────────────────────────

function OrderSummary({
  service,
  child,
  provider,
  slot,
  onConfirm,
}: {
  service: Service
  child: Child
  provider: Provider
  slot: SelectedSlot
  onConfirm: () => void
}) {
  const [agreed, setAgreed] = useState(false)

  return (
    <div>
      <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
      <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100 mb-5">
        <div className="p-4 flex justify-between">
          <span className="text-sm text-gray-500">Service</span>
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-900">{service.name}</p>
            <p className="text-green-700 font-bold">₹{(service.priceCents / 100).toLocaleString('en-IN')}</p>
          </div>
        </div>
        <div className="p-4 flex justify-between">
          <span className="text-sm text-gray-500">Child</span>
          <p className="text-sm font-semibold text-gray-900">{child.name}</p>
        </div>
        <div className="p-4 flex justify-between">
          <span className="text-sm text-gray-500">Provider</span>
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-900">{provider.name}</p>
            {provider.city && <p className="text-xs text-gray-400">{provider.city}</p>}
          </div>
        </div>
        <div className="p-4 flex justify-between">
          <span className="text-sm text-gray-500">Slot</span>
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-900">
              {slot.startTime} – {slot.endTime}
            </p>
            <p className="text-xs text-gray-400">{slot.date}</p>
          </div>
        </div>
      </div>

      <label className="flex items-start gap-3 mb-5 cursor-pointer">
        <input
          type="checkbox"
          checked={agreed}
          onChange={e => setAgreed(e.target.checked)}
          className="mt-0.5 w-4 h-4 accent-green-600"
        />
        <span className="text-sm text-gray-600">
          I agree to{' '}
          <a href="/terms" className="text-green-600 underline" target="_blank" rel="noopener noreferrer">
            SKIDS Terms of Service
          </a>
        </span>
      </label>

      <button
        onClick={onConfirm}
        disabled={!agreed}
        className="w-full py-3 rounded-xl bg-green-600 text-white font-semibold text-sm hover:bg-green-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Confirm &amp; Pay
      </button>
    </div>
  )
}

// ─── Step 5: Payment Gate ──────────────────────────────

function PaymentGate({
  token,
  service,
  child,
  provider,
  slot,
  user,
}: {
  token: string
  service: Service
  child: Child
  provider: Provider
  slot: SelectedSlot
  user: any
}) {
  const [status, setStatus] = useState<'loading' | 'ready' | 'success' | 'error'>('loading')
  const [error, setError] = useState('')
  const [serviceOrderId, setServiceOrderId] = useState('')

  useEffect(() => {
    let cancelled = false

    async function init() {
      try {
        // Create Razorpay order
        const res = await fetch('/api/payments/create-order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            serviceId: service.id,
            childId: child.id,
            providerId: provider.id,
            slotId: slot.id,
          }),
        })
        if (!res.ok) throw new Error('Failed to create order')
        const data = await res.json() as {
          razorpayOrderId: string
          amount: number
          keyId: string
          serviceOrderId: string
        }

        if (cancelled) return

        setServiceOrderId(data.serviceOrderId)

        // Load Razorpay script
        await new Promise<void>((resolve, reject) => {
          if ((window as any).Razorpay) { resolve(); return }
          const script = document.createElement('script')
          script.src = 'https://checkout.razorpay.com/v1/checkout.js'
          script.onload = () => resolve()
          script.onerror = () => reject(new Error('Failed to load Razorpay'))
          document.body.appendChild(script)
        })

        if (cancelled) return

        // Open Razorpay modal
        new (window as any).Razorpay({
          key: data.keyId,
          amount: data.amount,
          currency: 'INR',
          order_id: data.razorpayOrderId,
          name: 'SKIDS',
          description: service.name,
          prefill: {
            name: user?.displayName || '',
            contact: user?.phoneNumber || '',
          },
          theme: { color: '#16a34a' },
          handler: async (response: any) => {
            try {
              const verifyRes = await fetch('/api/payments/verify', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpayOrderId: response.razorpay_order_id,
                  razorpaySignature: response.razorpay_signature,
                  serviceOrderId: data.serviceOrderId,
                }),
              })
              if (verifyRes.ok) {
                setStatus('success')
              } else {
                setStatus('error')
                setError('Payment verification failed. Please contact support.')
              }
            } catch {
              setStatus('error')
              setError('Payment verification failed. Please contact support.')
            }
          },
          modal: {
            ondismiss: () => {
              setStatus('error')
              setError('Payment was cancelled.')
            },
          },
        }).open()

        setStatus('ready')
      } catch (e: unknown) {
        if (!cancelled) {
          setStatus('error')
          setError(e instanceof Error ? (e.message || 'Something went wrong') : 'Something went wrong')
        }
      }
    }

    init()
    return () => { cancelled = true }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (status === 'loading') {
    return (
      <div className="text-center py-10">
        <Spinner />
        <p className="text-sm text-gray-500 mt-3">Setting up payment...</p>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="text-center py-10">
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
        <p className="text-sm text-gray-500 mb-6">
          Your appointment has been booked. We'll send you a WhatsApp confirmation shortly.
        </p>
        <a
          href="/orders"
          className="inline-block px-6 py-3 rounded-xl bg-green-600 text-white font-semibold text-sm hover:bg-green-700 transition-colors"
        >
          View My Orders
        </a>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="text-center py-10">
        <div className="text-4xl mb-4">⚠️</div>
        <p className="text-sm text-red-600 mb-5">{error}</p>
        <button
          onClick={() => { setStatus('loading'); setError('') }}
          className="px-6 py-3 rounded-xl bg-green-600 text-white font-semibold text-sm hover:bg-green-700 transition-colors"
        >
          Retry Payment
        </button>
      </div>
    )
  }

  return (
    <div className="text-center py-10">
      <Spinner />
      <p className="text-sm text-gray-500 mt-3">Opening payment window...</p>
    </div>
  )
}

// ─── Main BookingFlow ──────────────────────────────────

export default function BookingFlow() {
  const { user, loading: authLoading, token } = useAuth()
  const [step, setStep] = useState<Step>('service')
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedChild, setSelectedChild] = useState<Child | null>(null)
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<SelectedSlot | null>(null)

  if (authLoading) return <Spinner />

  if (!user || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <p className="text-gray-600 mb-4">Please sign in to book a service.</p>
          <a
            href="/login"
            className="px-6 py-3 rounded-xl bg-green-600 text-white font-semibold text-sm hover:bg-green-700 transition-colors"
          >
            Sign In
          </a>
        </div>
      </div>
    )
  }

  const canGoBack = step !== 'service' && step !== 'payment'

  function goBack() {
    const idx = STEPS.indexOf(step)
    if (idx > 0) setStep(STEPS[idx - 1])
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          {canGoBack && (
            <button
              onClick={goBack}
              className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-600"
              aria-label="Go back"
            >
              ←
            </button>
          )}
          <h1 className="text-xl font-bold text-gray-900">Book a Service</h1>
        </div>

        <StepIndicator current={step} />

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          {step === 'service' && (
            <ServiceSelector
              onSelect={s => {
                setSelectedService(s)
                setStep('child')
              }}
            />
          )}

          {step === 'child' && (
            <ChildSelector
              token={token}
              onSelect={c => {
                setSelectedChild(c)
                setStep('provider')
              }}
            />
          )}

          {step === 'provider' && selectedService && (
            <ProviderSlotPicker
              token={token}
              serviceId={selectedService.id}
              onSelect={(slot, provider) => {
                setSelectedSlot(slot)
                setSelectedProvider(provider)
                setStep('summary')
              }}
            />
          )}

          {step === 'summary' &&
            selectedService &&
            selectedChild &&
            selectedProvider &&
            selectedSlot && (
              <OrderSummary
                service={selectedService}
                child={selectedChild}
                provider={selectedProvider}
                slot={selectedSlot}
                onConfirm={() => setStep('payment')}
              />
            )}

          {step === 'payment' &&
            selectedService &&
            selectedChild &&
            selectedProvider &&
            selectedSlot && (
              <PaymentGate
                token={token}
                service={selectedService}
                child={selectedChild}
                provider={selectedProvider}
                slot={selectedSlot}
                user={user}
              />
            )}
        </div>
      </div>
    </div>
  )
}
