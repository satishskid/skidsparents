import { useState, useEffect, useCallback, lazy, Suspense } from 'react'
import type { calcAgeMonths as CalcAgeMonths, interpolatePercentile as InterpPercentile, getInterpretationMessage as GetMsg, calcXDomain as CalcXDomain, toChartPoints as ToChartPoints } from '@/lib/who/interpolate'

// ─── Types ────────────────────────────────────────────────────────────────────

export type Metric = 'weight' | 'height' | 'head' | 'bmi'

export interface GrowthRecord {
  id: string
  date: string
  height_cm?: number | null
  weight_kg?: number | null
  head_circ_cm?: number | null
  bmi?: number | null
}

export interface ChartPoint {
  ageMonths: number
  value: number
  date: string
  percentileRank: number | null
}

export interface WhoRow {
  month: number
  p3: number
  p15: number
  p50: number
  p85: number
  p97: number
}

export type WhoSeries = WhoRow[]

export interface GrowthChartProps {
  childId: string
  childName: string
  dob: string
  sex: 'male' | 'female' | 'other' | null
  token: string
}

// ─── MetricTabs ───────────────────────────────────────────────────────────────

interface MetricTabsProps {
  active: Metric
  onChange: (m: Metric) => void
}

const METRIC_LABELS: { key: Metric; label: string }[] = [
  { key: 'weight', label: 'Weight' },
  { key: 'height', label: 'Height' },
  { key: 'head',   label: 'Head' },
  { key: 'bmi',    label: 'BMI' },
]

export function MetricTabs({ active, onChange }: MetricTabsProps) {
  return (
    <div className="flex gap-1 bg-gray-100 rounded-xl p-1" role="tablist">
      {METRIC_LABELS.map(({ key, label }) => (
        <button
          key={key}
          role="tab"
          aria-selected={active === key}
          onClick={() => onChange(key)}
          style={{ minWidth: 44, minHeight: 44 }}
          className={`flex-1 rounded-lg text-xs font-semibold transition-colors ${
            active === key
              ? 'bg-white text-green-700 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

// ─── InterpretationMessage ────────────────────────────────────────────────────

interface InterpretationMessageProps {
  childName: string
  metric: Metric
  percentileRank: number | null
  recordCount: number
}

export function InterpretationMessage({ childName, metric, percentileRank, recordCount }: InterpretationMessageProps) {
  if (recordCount < 2) {
    return (
      <p className="text-sm text-gray-500 text-center py-2">
        Add more measurements to see how {childName} is growing over time.
      </p>
    )
  }
  if (percentileRank === null) {
    return <p className="text-sm text-gray-400 text-center py-2">Percentile data unavailable for this age range.</p>
  }

  const metricLabel: Record<Metric, string> = {
    weight: 'weight', height: 'height', head: 'head circumference', bmi: 'BMI',
  }
  const label = metricLabel[metric]
  let msg: string
  if (percentileRank < 3)
    msg = `${childName}'s ${label} is below the typical range. Consider discussing this with your paediatrician at the next visit.`
  else if (percentileRank < 15)
    msg = `${childName} is on the smaller side but within the WHO reference range — every child grows at their own pace.`
  else if (percentileRank <= 85)
    msg = `${childName}'s ${label} is right in the typical range. Keep up the great work.`
  else if (percentileRank <= 97)
    msg = `${childName} is on the larger side but within the WHO reference range — growth patterns vary widely.`
  else
    msg = `${childName}'s ${label} is above the typical range. Consider discussing this with your paediatrician at the next visit.`

  return <p className="text-sm text-gray-600 text-center py-2 px-4">{msg}</p>
}

// ─── InlineForm ───────────────────────────────────────────────────────────────

interface InlineFormProps {
  open: boolean
  onClose: () => void
  onSaved: () => void
  childId: string
  token: string
}

export function InlineForm({ open, onClose, onSaved, childId, token }: InlineFormProps) {
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    heightCm: '',
    weightKg: '',
    headCircCm: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!open) return null

  const hasValue = form.heightCm || form.weightKg || form.headCircCm

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!hasValue) return
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/growth', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          childId,
          date: form.date,
          heightCm: form.heightCm ? parseFloat(form.heightCm) : undefined,
          weightKg: form.weightKg ? parseFloat(form.weightKg) : undefined,
          headCircCm: form.headCircCm ? parseFloat(form.headCircCm) : undefined,
        }),
      })
      if (!res.ok) throw new Error('Failed to save')
      setForm({ date: new Date().toISOString().split('T')[0], heightCm: '', weightKg: '', headCircCm: '' })
      onSaved()
      onClose()
    } catch {
      setError('Could not save measurement. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end" onClick={onClose}>
      <div
        className="w-full bg-white rounded-t-2xl p-5 shadow-xl space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700">Add Measurement</h3>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Date</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-green-400"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Height (cm)</label>
              <input type="number" step="0.1" placeholder="75.5" value={form.heightCm}
                onChange={(e) => setForm({ ...form, heightCm: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-green-400" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Weight (kg)</label>
              <input type="number" step="0.1" placeholder="9.5" value={form.weightKg}
                onChange={(e) => setForm({ ...form, weightKg: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-green-400" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Head (cm)</label>
              <input type="number" step="0.1" placeholder="44.0" value={form.headCircCm}
                onChange={(e) => setForm({ ...form, headCircCm: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-green-400" />
            </div>
          </div>
          {form.heightCm && form.weightKg && (
            <p className="text-xs text-gray-400">
              BMI: {(parseFloat(form.weightKg) / Math.pow(parseFloat(form.heightCm) / 100, 2)).toFixed(1)} kg/m²
            </p>
          )}
          {error && <p className="text-xs text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={saving || !hasValue}
            className="w-full py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Measurement'}
          </button>
        </form>
      </div>
    </div>
  )
}

// ─── ChartCanvas (lazy-loaded) ────────────────────────────────────────────────

interface PercentileBandsProps {
  series: WhoSeries
  xDomain: [number, number]
}

interface MeasurementLineProps {
  points: ChartPoint[]
  onPointTap: (point: ChartPoint) => void
}

interface ChartCanvasProps {
  series: WhoSeries
  points: ChartPoint[]
  xDomain: [number, number]
  metric: Metric
  ageMonths: number
  onPointTap: (point: ChartPoint) => void
}

// Recharts is imported inside this function so it stays out of the static bundle.
// GrowthChart lazy-imports this via React.lazy.
export function ChartCanvas({ series, points, xDomain, metric, ageMonths, onPointTap }: ChartCanvasProps) {
  const {
    ResponsiveContainer, ComposedChart, Area, Line, XAxis, YAxis,
    CartesianGrid, Tooltip, ReferenceLine, Dot,
  } = require('recharts') as typeof import('recharts')

  // Build band data from WHO series filtered to xDomain
  const bandData = series
    .filter((r) => r.month >= xDomain[0] && r.month <= xDomain[1])
    .map((r) => ({
      month: r.month,
      band_lo: r.p3,
      band_mid_lo: r.p15,
      band_mid_hi: r.p85,
      band_hi: r.p97,
      p50: r.p50,
    }))

  const yUnit = metric === 'weight' ? 'kg' : metric === 'bmi' ? 'kg/m²' : 'cm'

  // Show dataset boundary at month 60 if records span both ranges
  const showBoundary = ageMonths > 60 && points.some((p) => p.ageMonths <= 60)

  return (
    <ResponsiveContainer width="100%" height={260}>
      <ComposedChart margin={{ top: 8, right: 32, bottom: 8, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="month"
          type="number"
          domain={xDomain}
          tickCount={7}
          label={{ value: 'Age (months)', position: 'insideBottom', offset: -4, fontSize: 10 }}
          tick={{ fontSize: 10 }}
        />
        <YAxis
          tick={{ fontSize: 10 }}
          label={{ value: yUnit, angle: -90, position: 'insideLeft', offset: 10, fontSize: 10 }}
        />
        <Tooltip
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter={(val: any, name: any) => [typeof val === 'number' ? val.toFixed(1) : String(val ?? ''), name] as any}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          labelFormatter={(label: any) => `${label} months`}
        />

        {/* Percentile bands */}
        <Area data={bandData} dataKey="band_hi" stroke="none" fill="#dbeafe" fillOpacity={0.5} legendType="none" />
        <Area data={bandData} dataKey="band_mid_hi" stroke="none" fill="#bbf7d0" fillOpacity={0.5} legendType="none" />
        <Area data={bandData} dataKey="band_mid_lo" stroke="none" fill="#bbf7d0" fillOpacity={0.5} legendType="none" />
        <Area data={bandData} dataKey="band_lo" stroke="none" fill="#dbeafe" fillOpacity={0.5} legendType="none" />

        {/* p50 reference line */}
        <Line data={bandData} dataKey="p50" stroke="#86efac" strokeWidth={1} dot={false} legendType="none" />

        {/* Percentile labels on right edge */}
        {(['p3', 'p15', 'p50', 'p85', 'p97'] as const).map((p) => {
          const last = bandData[bandData.length - 1]
          if (!last) return null
          return (
            <ReferenceLine
              key={p}
              y={last[p as keyof typeof last] as number}
              stroke="transparent"
              label={{ value: p, position: 'right', fontSize: 9, fill: '#9ca3af' }}
            />
          )
        })}

        {/* Dataset boundary at month 60 */}
        {showBoundary && (
          <ReferenceLine x={60} stroke="#f59e0b" strokeDasharray="4 2"
            label={{ value: 'CGS→Ref2007', position: 'top', fontSize: 9, fill: '#f59e0b' }} />
        )}

        {/* Child's measurement line */}
        <Line
          data={points}
          dataKey="value"
          stroke="#16a34a"
          strokeWidth={2}
          dot={(props: { cx?: number; cy?: number; payload: ChartPoint }) => (
            <Dot
              key={`dot-${props.payload.ageMonths}`}
              cx={props.cx ?? 0}
              cy={props.cy ?? 0}
              r={5}
              fill="#16a34a"
              stroke="#fff"
              strokeWidth={2}
              onClick={() => onPointTap(props.payload)}
              style={{ cursor: 'pointer' }}
            />
          )}
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}

// ─── GrowthChart (main) ───────────────────────────────────────────────────────

// Downsample to ≤ 100 points, preserving most recent and outliers outside p3–p97
function downsample(points: ChartPoint[], max = 100): ChartPoint[] {
  if (points.length <= max) return points
  const outliers = new Set<number>()
  // Always keep most recent
  outliers.add(points.length - 1)
  points.forEach((p, i) => {
    if (p.percentileRank !== null && (p.percentileRank < 3 || p.percentileRank > 97)) {
      outliers.add(i)
    }
  })
  const step = Math.ceil(points.length / max)
  return points.filter((_, i) => outliers.has(i) || i % step === 0)
}

export default function GrowthChart({ childId, childName, dob, sex, token }: GrowthChartProps) {
  const [activeMetric, setActiveMetric] = useState<Metric>('weight')
  const [records, setRecords] = useState<GrowthRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [inlineFormOpen, setInlineFormOpen] = useState(false)
  const [tooltipPoint, setTooltipPoint] = useState<ChartPoint | null>(null)
  const [whoData, setWhoData] = useState<{
    calcAgeMonths: typeof CalcAgeMonths
    interpolatePercentile: typeof InterpPercentile
    getInterpretationMessage: typeof GetMsg
    calcXDomain: typeof CalcXDomain
    toChartPoints: typeof ToChartPoints
    getWhoSeries: (metric: Metric, sex: 'male' | 'female') => WhoSeries
  } | null>(null)

  // Lazy-load WHO data and interpolation utilities
  useEffect(() => {
    Promise.all([
      import('@/lib/who/interpolate'),
      import('@/lib/who/who-data'),
    ]).then(([interp, data]) => {
      setWhoData({
        calcAgeMonths: interp.calcAgeMonths,
        interpolatePercentile: interp.interpolatePercentile,
        getInterpretationMessage: interp.getInterpretationMessage,
        calcXDomain: interp.calcXDomain,
        toChartPoints: interp.toChartPoints,
        getWhoSeries: data.getWhoSeries,
      })
    })
  }, [])

  const fetchRecords = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/growth?childId=${childId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Failed to load growth records')
      const data = await res.json() as { records?: GrowthRecord[] }
      setRecords(data.records || [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load growth records')
    } finally {
      setLoading(false)
    }
  }, [childId, token])

  useEffect(() => { fetchRecords() }, [fetchRecords])

  // Resolve sex for WHO lookup (default to male for 'other' / null)
  const resolvedSex: 'male' | 'female' = sex === 'female' ? 'female' : 'male'
  const showGenderNotice = sex === 'other' || sex === null

  // Compute chart data
  const ageMonths = whoData ? whoData.calcAgeMonths(new Date().toISOString().split('T')[0], dob) : 0
  const xDomain = whoData ? whoData.calcXDomain(ageMonths) : ([0, 6] as [number, number])
  const series = whoData ? whoData.getWhoSeries(activeMetric, resolvedSex) : []

  const rawPoints: ChartPoint[] = whoData
    ? whoData.toChartPoints(
        records.map((r) => ({
          date: r.date,
          weightKg: r.weight_kg ?? null,
          heightCm: r.height_cm ?? null,
          headCm: r.head_circ_cm ?? null,
          bmiKgm2: r.bmi ?? null,
        })),
        activeMetric,
        dob,
      ).map((p) => ({
        ...p,
        percentileRank: whoData.interpolatePercentile(p.ageMonths, p.value, series),
      }))
    : []

  const points = downsample(rawPoints)
  const latestPoint = rawPoints[rawPoints.length - 1] ?? null

  const datasetLabel = `WHO ${activeMetric === 'head' ? 'Standards' : ageMonths > 60 ? 'Reference 2007' : 'Standards'} · ${resolvedSex === 'male' ? 'Boys' : 'Girls'}`

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="bg-white rounded-xl p-4 animate-pulse h-12" />
        <div className="bg-white rounded-xl p-4 animate-pulse h-64" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl p-6 border border-red-100 text-center space-y-3">
        <p className="text-sm text-red-500">{error}</p>
        <button onClick={fetchRecords} className="text-xs text-green-600 font-semibold underline">Retry</button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {showGenderNotice && (
        <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
          Showing male reference curves. Update {childName}'s profile to see sex-specific charts.
        </p>
      )}

      <MetricTabs active={activeMetric} onChange={(m) => { setActiveMetric(m); setTooltipPoint(null) }} />

      {/* Dataset subtitle */}
      <p className="text-[10px] text-gray-400 text-center">{datasetLabel}</p>

      {/* Head circumference age limit notice */}
      {activeMetric === 'head' && ageMonths > 36 && (
        <p className="text-xs text-blue-500 bg-blue-50 rounded-lg px-3 py-2 text-center">
          WHO head circumference reference covers 0–36 months only.
        </p>
      )}

      {/* BMI no-records prompt */}
      {activeMetric === 'bmi' && rawPoints.length === 0 && (
        <p className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2 text-center">
          BMI is calculated automatically when both height and weight are recorded.
        </p>
      )}

      {/* Chart */}
      {whoData && series.length > 0 && (rawPoints.length > 0 || activeMetric !== 'bmi') ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-2">
          <Suspense fallback={<div className="h-64 animate-pulse bg-gray-50 rounded-lg" />}>
            <ChartCanvas
              series={series}
              points={points}
              xDomain={xDomain}
              metric={activeMetric}
              ageMonths={ageMonths}
              onPointTap={setTooltipPoint}
            />
          </Suspense>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 text-center">
          <div className="text-2xl mb-2">📏</div>
          <p className="text-sm text-gray-500">No {activeMetric} records yet. Add a measurement to get started.</p>
        </div>
      )}

      {/* Tooltip for tapped point */}
      {tooltipPoint && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3 text-xs text-gray-600 flex justify-between items-center">
          <span>{new Date(tooltipPoint.date + 'T12:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}</span>
          <span className="font-semibold">{tooltipPoint.value.toFixed(1)}</span>
          {tooltipPoint.percentileRank !== null && (
            <span className="text-green-600">p{tooltipPoint.percentileRank.toFixed(0)}</span>
          )}
          <button onClick={() => setTooltipPoint(null)} className="text-gray-400 ml-2">✕</button>
        </div>
      )}

      <InterpretationMessage
        childName={childName}
        metric={activeMetric}
        percentileRank={latestPoint?.percentileRank ?? null}
        recordCount={rawPoints.length}
      />

      <button
        onClick={() => setInlineFormOpen(true)}
        className="w-full py-3 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors"
      >
        + Add Measurement
      </button>

      <InlineForm
        open={inlineFormOpen}
        onClose={() => setInlineFormOpen(false)}
        onSaved={fetchRecords}
        childId={childId}
        token={token}
      />
    </div>
  )
}
