/**
 * SKIDS Life Record — Context Builder
 *
 * Assembles a child's complete LifeRecordContext from D1 database tables.
 * This is the data layer that feeds the probability engine.
 *
 * Every time a parent submits an observation, this builder pulls together:
 * - Child demographics + age
 * - Birth history (preterm, NICU, complications)
 * - Growth records + Z-scores + percentile trends
 * - Milestone status (achieved, delayed, regressed)
 * - Recent observations (temporal patterns)
 * - Screening results
 * - Vaccination status
 * - Family history
 * - Active conditions + medications
 * - Diet/nutrition status
 * - Recent illnesses
 *
 * The richer the life record, the more accurate the probability projections.
 */

import type { LifeRecordContext } from './types'

/**
 * Build the complete LifeRecordContext for a child from D1.
 * This is the single function that assembles everything the probability engine needs.
 */
export async function buildLifeRecordContext(
  childId: string,
  db: any
): Promise<LifeRecordContext> {
  // Run all queries in parallel for speed
  const [
    childRow,
    birthRow,
    growthRows,
    milestoneRows,
    observationRows,
    screeningRows,
    vaccinationRows,
    familyRows,
    conditionRows,
    medicationRows,
    dietRow,
    illnessRows,
  ] = await Promise.all([
    // Child demographics
    db.prepare('SELECT * FROM children WHERE id = ?').bind(childId).first(),
    // Birth history
    db.prepare('SELECT * FROM birth_history WHERE child_id = ?').bind(childId).first().catch(() => null),
    // Growth records (last 12)
    db.prepare('SELECT * FROM growth_records WHERE child_id = ? ORDER BY date DESC LIMIT 12').bind(childId).all().then((r: any) => r.results || []).catch(() => []),
    // Milestones
    db.prepare('SELECT * FROM milestones WHERE child_id = ?').bind(childId).all().then((r: any) => r.results || []).catch(() => []),
    // Recent observations (last 20)
    db.prepare('SELECT * FROM parent_observations WHERE child_id = ? ORDER BY date DESC LIMIT 20').bind(childId).all().then((r: any) => r.results || []).catch(() => []),
    // Screening results
    db.prepare('SELECT * FROM screening_results WHERE child_id = ? ORDER BY date DESC').bind(childId).all().then((r: any) => r.results || []).catch(() => []),
    // Vaccination records
    db.prepare('SELECT * FROM vaccination_records WHERE child_id = ?').bind(childId).all().then((r: any) => r.results || []).catch(() => []),
    // Family history
    db.prepare('SELECT * FROM family_history WHERE child_id = ?').bind(childId).all().then((r: any) => r.results || []).catch(() => []),
    // Active conditions
    db.prepare("SELECT * FROM active_conditions WHERE child_id = ? AND status = 'active'").bind(childId).all().then((r: any) => r.results || []).catch(() => []),
    // Medications
    db.prepare("SELECT * FROM medications WHERE child_id = ? AND status = 'active'").bind(childId).all().then((r: any) => r.results || []).catch(() => []),
    // Diet (latest)
    db.prepare('SELECT * FROM diet_records WHERE child_id = ? ORDER BY date DESC LIMIT 1').bind(childId).first().catch(() => null),
    // Recent illnesses (from observations categorized as illness, last 90 days)
    db.prepare(
      "SELECT * FROM parent_observations WHERE child_id = ? AND category IN ('illness', 'sick', 'fever', 'infection') AND date >= date('now', '-90 days') ORDER BY date DESC"
    ).bind(childId).all().then((r: any) => r.results || []).catch(() => []),
  ])

  if (!childRow) {
    throw new Error(`Child not found: ${childId}`)
  }

  // Calculate age in months
  const dob = new Date(childRow.dob)
  const now = new Date()
  const ageMonths = Math.floor((now.getTime() - dob.getTime()) / (1000 * 60 * 60 * 24 * 30.44))

  // Parse allergies
  let allergies: string[] = []
  if (childRow.allergies_json) {
    try { allergies = JSON.parse(childRow.allergies_json) } catch { /* ignore */ }
  }

  // Build growth context
  const growthRecords = (growthRows as any[]).map((r: any) => ({
    date: r.date,
    heightCm: r.height_cm || undefined,
    weightKg: r.weight_kg || undefined,
    headCircCm: r.head_circ_cm || undefined,
    bmi: r.bmi || undefined,
  }))

  // Parse Z-scores from latest growth record
  let latestZScores: LifeRecordContext['growth']['latestZScores'] = undefined
  if (growthRows.length > 0) {
    const latest = growthRows[0] as any
    if (latest.who_zscore_json) {
      try {
        const z = JSON.parse(latest.who_zscore_json)
        latestZScores = {
          weightForAge: z.weightForAge ?? z.wfa,
          heightForAge: z.heightForAge ?? z.hfa,
          bmiForAge: z.bmiForAge ?? z.bfa,
          headCircForAge: z.headCircForAge ?? z.hcfa,
        }
      } catch { /* ignore */ }
    }
  }

  // Determine percentile crossing from growth trend
  const percentileCrossing = computePercentileTrend(growthRows as any[])

  // Build milestone context
  const achieved = (milestoneRows as any[])
    .filter((m: any) => m.status === 'achieved')
    .map((m: any) => ({
      key: m.milestone_key,
      category: m.category,
      observedAt: m.observed_at || undefined,
    }))

  const delayed = (milestoneRows as any[])
    .filter((m: any) => m.status === 'delayed' || (m.status === 'not_started' && m.expected_age_max && ageMonths > m.expected_age_max))
    .map((m: any) => ({
      key: m.milestone_key,
      category: m.category,
      expectedAgeMax: m.expected_age_max || 0,
    }))

  const notStarted = (milestoneRows as any[])
    .filter((m: any) => m.status === 'not_started' && m.expected_age_max && ageMonths <= m.expected_age_max)
    .map((m: any) => ({
      key: m.milestone_key,
      category: m.category,
      expectedAgeMax: m.expected_age_max || 0,
    }))

  const regressions = (milestoneRows as any[])
    .filter((m: any) => m.status === 'regressed')
    .map((m: any) => ({
      key: m.milestone_key,
      category: m.category,
      previouslyAchievedAt: m.observed_at || undefined,
    }))

  // Build birth history
  const birthHistory: LifeRecordContext['birthHistory'] = birthRow
    ? {
        gestationalWeeks: (birthRow as any).gestational_weeks || undefined,
        deliveryMode: (birthRow as any).delivery_mode || undefined,
        birthWeight: (birthRow as any).birth_weight_grams || undefined,
        nicuStay: !!(birthRow as any).nicu_stay,
        nicuDays: (birthRow as any).nicu_days || undefined,
        apgarScore: (birthRow as any).apgar_score || undefined,
        complications: safeJsonParse((birthRow as any).complications_json, []),
      }
    : {}

  // Build vaccination status
  const completedVaccines = (vaccinationRows as any[])
    .filter((v: any) => v.administered_date)
    .map((v: any) => v.vaccine_name)
  const overdueVaccines = (vaccinationRows as any[])
    .filter((v: any) => !v.administered_date && v.next_due && new Date(v.next_due) < now)
    .map((v: any) => v.vaccine_name)

  // Build diet context
  const diet: LifeRecordContext['diet'] = dietRow
    ? {
        breastfed: !!(dietRow as any).breastfed,
        formulaFed: !!(dietRow as any).formula_fed,
        solidsStarted: !!(dietRow as any).solids_started,
        foodDiversity: (dietRow as any).food_diversity || undefined,
        ironSupplement: !!(dietRow as any).iron_supplement,
        vitaminD: !!(dietRow as any).vitamin_d,
      }
    : {}

  return {
    child: {
      id: childId,
      name: childRow.name,
      dob: childRow.dob,
      gender: childRow.gender || 'other',
      ageMonths,
      bloodGroup: childRow.blood_group || undefined,
      allergies: allergies.length > 0 ? allergies : undefined,
    },
    birthHistory,
    growth: {
      records: growthRecords,
      percentileCrossing,
      latestZScores,
    },
    milestones: {
      achieved,
      delayed,
      notStarted,
      regressions,
    },
    recentObservations: (observationRows as any[]).map((o: any) => ({
      text: o.observation_text,
      category: o.category || undefined,
      concernLevel: o.concern_level || 'none',
      date: o.date,
    })),
    screeningResults: (screeningRows as any[]).map((s: any) => ({
      type: s.screening_type,
      date: s.date,
      result: s.result,
      findings: safeJsonParse(s.findings_json, undefined),
    })),
    vaccinations: {
      completed: completedVaccines,
      overdue: overdueVaccines,
    },
    familyHistory: (familyRows as any[]).map((f: any) =>
      f.relation ? `${f.condition} (${f.relation})` : f.condition
    ),
    activeConditions: (conditionRows as any[]).map((c: any) => c.condition_name),
    currentMedications: (medicationRows as any[]).map((m: any) =>
      m.dosage ? `${m.medication_name} ${m.dosage}` : m.medication_name
    ),
    diet,
    recentIllnesses: (illnessRows as any[]).map((i: any) => ({
      type: i.category || 'illness',
      date: i.date,
    })),
  }
}

// ============================================
// HELPERS
// ============================================

function safeJsonParse<T>(json: string | null | undefined, fallback: T): T {
  if (!json) return fallback
  try { return JSON.parse(json) } catch { return fallback }
}

/**
 * Compute percentile trend from growth records.
 * Compares Z-scores across time to detect upward/downward crossing.
 */
function computePercentileTrend(
  rows: any[]
): 'stable' | 'upward' | 'downward' | undefined {
  if (rows.length < 2) return undefined

  // Get Z-scores from most recent and oldest available records
  const recent = rows[0]
  const older = rows[rows.length - 1]

  if (!recent?.who_zscore_json || !older?.who_zscore_json) return undefined

  try {
    const recentZ = JSON.parse(recent.who_zscore_json)
    const olderZ = JSON.parse(older.who_zscore_json)

    // Use weight-for-age as primary indicator
    const recentWFA = recentZ.weightForAge ?? recentZ.wfa
    const olderWFA = olderZ.weightForAge ?? olderZ.wfa

    if (recentWFA === undefined || olderWFA === undefined) return undefined

    const diff = recentWFA - olderWFA

    // Crossing = change of >0.67 SD (one major percentile line)
    if (diff > 0.67) return 'upward'
    if (diff < -0.67) return 'downward'
    return 'stable'
  } catch {
    return undefined
  }
}

/**
 * Build a minimal LifeRecordContext when no DB is available (e.g., for testing).
 * Uses only the child's basic info + observation.
 */
export function buildMinimalContext(
  childName: string,
  childDob: string,
  gender: 'male' | 'female' | 'other' = 'other'
): LifeRecordContext {
  const dob = new Date(childDob)
  const now = new Date()
  const ageMonths = Math.floor((now.getTime() - dob.getTime()) / (1000 * 60 * 60 * 24 * 30.44))

  return {
    child: {
      id: 'minimal',
      name: childName,
      dob: childDob,
      gender,
      ageMonths,
    },
    birthHistory: {},
    growth: { records: [] },
    milestones: { achieved: [], delayed: [], notStarted: [], regressions: [] },
    recentObservations: [],
    screeningResults: [],
    vaccinations: { completed: [], overdue: [] },
    familyHistory: [],
    activeConditions: [],
    currentMedications: [],
    diet: {},
    recentIllnesses: [],
  }
}
