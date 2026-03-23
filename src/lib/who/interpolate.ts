// src/lib/who/interpolate.ts
// Pure utility functions for WHO growth chart calculations

export type Metric = 'weight' | 'height' | 'head' | 'bmi'

export interface WhoRow {
  month: number
  p3: number
  p15: number
  p50: number
  p85: number
  p97: number
}

export type WhoSeries = WhoRow[]

export interface ChartPoint {
  ageMonths: number
  value: number
  date: string
}

export interface GrowthRecord {
  date: string
  weightKg: number | null
  heightCm: number | null
  headCm: number | null
  bmiKgm2: number | null
}

/**
 * Returns completed months between two ISO date strings.
 * Uses 30.4375 days/month (365.25 / 12) for consistency with WHO methodology.
 */
export function calcAgeMonths(measurementDate: string, dob: string): number {
  const ms = new Date(measurementDate).getTime() - new Date(dob).getTime()
  return Math.floor(ms / (1000 * 60 * 60 * 24 * 30.4375))
}

/**
 * Linearly interpolates a percentile boundary value from a WHO series
 * at a fractional age in months.
 *
 * @param ageMonths  - exact age (may be fractional, e.g. 6.3)
 * @param percentile - 'p3' | 'p15' | 'p50' | 'p85' | 'p97'
 * @param series     - sorted WhoSeries array
 * @returns interpolated value, or null if ageMonths is out of range
 */
export function interpolateWho(
  ageMonths: number,
  percentile: keyof Omit<WhoRow, 'month'>,
  series: WhoSeries
): number | null {
  if (series.length === 0) return null
  if (ageMonths < series[0].month || ageMonths > series[series.length - 1].month) return null

  // Binary search for the surrounding rows
  let lo = 0
  let hi = series.length - 1
  while (lo < hi - 1) {
    const mid = (lo + hi) >> 1
    if (series[mid].month <= ageMonths) lo = mid
    else hi = mid
  }

  const x0 = series[lo].month
  const y0 = series[lo][percentile]
  const x1 = series[hi].month
  const y1 = series[hi][percentile]
  if (x0 === x1) return y0
  return y0 + (y1 - y0) * (ageMonths - x0) / (x1 - x0)
}

/**
 * Returns the estimated percentile rank (0–100) for a given measurement value
 * at a given age, by inverting the WHO percentile table via linear interpolation.
 *
 * Returns null if ageMonths is outside the series range.
 */
export function interpolatePercentile(
  ageMonths: number,
  value: number,
  series: WhoSeries
): number | null {
  const p3  = interpolateWho(ageMonths, 'p3',  series)
  const p15 = interpolateWho(ageMonths, 'p15', series)
  const p50 = interpolateWho(ageMonths, 'p50', series)
  const p85 = interpolateWho(ageMonths, 'p85', series)
  const p97 = interpolateWho(ageMonths, 'p97', series)

  if (p3 === null || p15 === null || p50 === null || p85 === null || p97 === null) return null

  const bands: [number, number][] = [
    [p3, 3], [p15, 15], [p50, 50], [p85, 85], [p97, 97]
  ]

  if (value <= bands[0][0]) return 3
  if (value >= bands[4][0]) return 97

  for (let i = 0; i < bands.length - 1; i++) {
    const [v0, r0] = bands[i]
    const [v1, r1] = bands[i + 1]
    if (value >= v0 && value <= v1) {
      return r0 + (r1 - r0) * (value - v0) / (v1 - v0)
    }
  }
  return null
}

/**
 * Calculates BMI from weight in kg and height in cm.
 * Returns weightKg / (heightCm/100)²
 */
export function calcBmi(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100
  return weightKg / (heightM * heightM)
}

/**
 * Returns a friendly, parent-facing interpretation message for a given
 * child name, metric, and percentile rank.
 */
export function getInterpretationMessage(
  childName: string,
  metric: Metric,
  percentileRank: number
): string {
  const metricLabel: Record<Metric, string> = {
    weight: 'weight',
    height: 'height',
    head: 'head circumference',
    bmi: 'BMI',
  }
  const label = metricLabel[metric]

  if (percentileRank < 3) {
    return `${childName}'s ${label} is below the typical range. Consider discussing this with your paediatrician at the next visit.`
  }
  if (percentileRank < 15) {
    return `${childName} is on the smaller side but within the WHO reference range — every child grows at their own pace.`
  }
  if (percentileRank <= 85) {
    return `${childName}'s ${label} is right in the typical range. Keep up the great work.`
  }
  if (percentileRank <= 97) {
    return `${childName} is on the larger side but within the WHO reference range — growth patterns vary widely.`
  }
  return `${childName}'s ${label} is above the typical range. Consider discussing this with your paediatrician at the next visit.`
}

/**
 * Returns the x-axis domain for the chart: [0, currentAgeMonths + 6]
 */
export function calcXDomain(currentAgeMonths: number): [number, number] {
  return [0, currentAgeMonths + 6]
}

/**
 * Converts an array of GrowthRecord to ChartPoint[], filtering out null metric values.
 */
export function toChartPoints(
  records: GrowthRecord[],
  metric: Metric,
  dob: string
): ChartPoint[] {
  const metricKey: Record<Metric, keyof GrowthRecord> = {
    weight: 'weightKg',
    height: 'heightCm',
    head: 'headCm',
    bmi: 'bmiKgm2',
  }
  const key = metricKey[metric]
  const result: ChartPoint[] = []
  for (const record of records) {
    const val = record[key]
    if (val !== null && val !== undefined) {
      result.push({
        ageMonths: calcAgeMonths(record.date, dob),
        value: val as number,
        date: record.date,
      })
    }
  }
  return result
}
