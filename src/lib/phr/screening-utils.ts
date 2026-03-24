// Screening utility library — pure functions, no side effects

export type ScreeningType = 'vision' | 'chatter' | 'nutrition' | 'hearing' | 'unknown'
export type ResultStatus = 'normal' | 'borderline' | 'needs-attention'

// ─── Type derivation ───────────────────────────────────

const TYPE_ALIASES: Record<string, ScreeningType> = {
  vision: 'vision', welchallyn: 'vision', eye: 'vision',
  chatter: 'chatter', developmental: 'chatter', speech: 'chatter',
  nutrition: 'nutrition', nutree: 'nutrition', diet: 'nutrition',
  hearing: 'hearing', symphony: 'hearing', audio: 'hearing',
}

export function deriveScreeningType(dataJson: string | null): ScreeningType {
  if (!dataJson) return 'unknown'
  try {
    const data = JSON.parse(dataJson) as Record<string, unknown>
    const raw = ((data.type ?? data.screeningType ?? '') as string).toLowerCase().trim()
    return TYPE_ALIASES[raw] ?? 'unknown'
  } catch {
    return 'unknown'
  }
}

// ─── Status derivation ────────────────────────────────

interface FourDDimension {
  flagged?: boolean
  severity?: 'mild' | 'moderate' | 'severe'
}

interface FourD {
  defects?: FourDDimension
  delay?: FourDDimension
  disability?: FourDDimension
  deficiency?: FourDDimension
}

export function deriveStatus(fourDJson: string | null): ResultStatus {
  if (!fourDJson) return 'normal'
  let fourD: FourD
  try {
    fourD = JSON.parse(fourDJson) as FourD
  } catch {
    return 'normal'
  }

  const dims = [fourD.defects, fourD.delay, fourD.disability, fourD.deficiency]
  let highestSeverity: ResultStatus = 'normal'

  for (const dim of dims) {
    if (!dim?.flagged) continue
    const sev = dim.severity ?? 'mild'
    if (sev === 'moderate' || sev === 'severe') return 'needs-attention'
    if (sev === 'mild') highestSeverity = 'borderline'
  }

  return highestSeverity
}

// ─── Report URL extraction ────────────────────────────

export function extractReportUrl(dataJson: string | null): string | null {
  if (!dataJson) return null
  try {
    const data = JSON.parse(dataJson) as Record<string, unknown>
    const url = (data.reportUrl ?? data.report_url ?? null) as string | null
    if (!url || typeof url !== 'string') return null
    new URL(url) // throws if invalid
    return url
  } catch {
    return null
  }
}

// ─── Next-steps lookup ────────────────────────────────

type NextStepsKey = `${ScreeningType}:${ResultStatus}`

const NEXT_STEPS: Record<NextStepsKey, string> = {
  'vision:normal':             'Next vision screening recommended in 12 months.',
  'vision:borderline':         'We recommend a follow-up vision screening in 3 months.',
  'vision:needs-attention':    'Please book a SKIDS Vision consultation for a detailed assessment.',
  'chatter:normal':            "Your child's developmental screening looks great. Next check in 6 months.",
  'chatter:borderline':        'We recommend a follow-up developmental screening in 3 months.',
  'chatter:needs-attention':   'Please book a SKIDS Chatter session for a detailed developmental assessment.',
  'nutrition:normal':          "Your child's nutrition screening is on track. Keep up the healthy habits.",
  'nutrition:borderline':      'We recommend a follow-up nutrition check in 3 months.',
  'nutrition:needs-attention': 'Please book a SKIDS Nutrition consultation for a personalised plan.',
  'hearing:normal':            "Your child's hearing screening is clear. Next check recommended in 12 months.",
  'hearing:borderline':        'We recommend a follow-up hearing screening in 3 months.',
  'hearing:needs-attention':   'Please book a SKIDS Symphony session for a detailed hearing assessment.',
  'unknown:normal':            'Results recorded. Please consult your SKIDS provider for details.',
  'unknown:borderline':        'We recommend a follow-up screening in 3 months.',
  'unknown:needs-attention':   'Please book a consultation with your SKIDS provider.',
}

const INTERVENTION_LINKS: Partial<Record<ScreeningType, string>> = {
  vision:    '/interventions/vision',
  chatter:   '/interventions/chatter',
  nutrition: '/interventions/nutrition',
  hearing:   '/interventions/hearing',
}

export function getNextStepsMessage(type: ScreeningType, status: ResultStatus): string {
  return NEXT_STEPS[`${type}:${status}`] ?? NEXT_STEPS[`unknown:${status}`]
}

export function getInterventionLink(type: ScreeningType): string | null {
  return INTERVENTION_LINKS[type] ?? null
}

// ─── Display config ───────────────────────────────────

export const SCREENING_TYPE_CONFIG: Record<ScreeningType, { label: string; emoji: string; order: number }> = {
  vision:    { label: 'SKIDS Vision',    emoji: '👁️',  order: 0 },
  chatter:   { label: 'SKIDS Chatter',   emoji: '🗣️',  order: 1 },
  nutrition: { label: 'SKIDS Nutrition', emoji: '🥗',  order: 2 },
  hearing:   { label: 'SKIDS Symphony',  emoji: '🎵',  order: 3 },
  unknown:   { label: 'Screening',       emoji: '📋',  order: 4 },
}

export const SCREENING_TYPE_ORDER: ScreeningType[] = ['vision', 'chatter', 'nutrition', 'hearing', 'unknown']

// ─── Date formatting ──────────────────────────────────

export function formatScreeningDate(isoDate: string | null): string {
  if (!isoDate) return 'Date unknown'
  try {
    return new Date(isoDate + 'T12:00:00').toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
    })
  } catch {
    return 'Date unknown'
  }
}

// ─── Grouping & sorting ───────────────────────────────

export interface ScreeningImportRecord {
  id: string
  childId: string
  screeningDate: string | null
  importedAt: string
  summaryText: string | null
  fourDJson: string | null
  dataJson: string | null
  campaignCode: string | null
}

export interface ScreeningGroup {
  type: ScreeningType
  records: ScreeningImportRecord[]
}

export function groupAndSortRecords(records: ScreeningImportRecord[]): ScreeningGroup[] {
  const map = new Map<ScreeningType, ScreeningImportRecord[]>()

  for (const r of records) {
    const type = deriveScreeningType(r.dataJson)
    if (!map.has(type)) map.set(type, [])
    map.get(type)!.push(r)
  }

  // Sort within each group: screeningDate descending, nulls last
  for (const [, group] of map) {
    group.sort((a, b) => {
      if (!a.screeningDate && !b.screeningDate) return 0
      if (!a.screeningDate) return 1
      if (!b.screeningDate) return -1
      return b.screeningDate.localeCompare(a.screeningDate)
    })
  }

  // Return groups in canonical order, only non-empty ones
  return SCREENING_TYPE_ORDER
    .filter((t) => map.has(t))
    .map((t) => ({ type: t, records: map.get(t)! }))
}

// ─── Child pre-selection ──────────────────────────────

export interface ChildRef {
  id: string
  name: string
}

export function resolveInitialChild(children: ChildRef[], initialChildId: string | null | undefined): ChildRef {
  if (initialChildId) {
    const match = children.find((c) => c.id === initialChildId)
    if (match) return match
  }
  return children[0]
}
