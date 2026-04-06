/**
 * SKIDS Probabilistic Life Record — Bayesian Projection Engine
 *
 * The core intelligence of the SKIDS Life Record.
 * Takes a parent observation + the child's complete life record context
 * and projects probable conditions using three-layer Bayesian reasoning:
 *
 *   Layer 1: Knowledge Graph — population-level base rates (epidemiology)
 *   Layer 2: Life Record Prior — individual child context (Bayesian update)
 *   Layer 3: Doctor Refinement — clinical examination updates probabilities
 *
 * SKIDS does NOT diagnose. It unfolds possibilities into probabilities.
 * The doctor confirms into diagnoses. Nothing is missed.
 */

import type {
  ConditionObservationEntry,
  ConditionModifier,
  LifeRecordContext,
  ObservationProjection,
  ProjectionResult,
  ModifierSource,
  BodySystem,
} from './types'

import {
  matchObservationToConditions,
  detectDomains,
  getMustNotMissConditions,
} from './knowledge-graph'

// ============================================
// MODIFIER EVALUATION — Layer 2
// ============================================

/**
 * Check if a modifier's condition is present in the child's life record.
 * Returns the multiplier if the condition is met, or 1.0 (no effect) if not.
 */
function evaluateModifier(
  modifier: ConditionModifier,
  context: LifeRecordContext
): { applies: boolean; multiplier: number; explanation: string } {
  const { source, key } = modifier

  switch (source) {
    case 'birth_history':
      return evaluateBirthHistory(key, context)
    case 'growth_trend':
      return evaluateGrowthTrend(key, context)
    case 'milestone_status':
      return evaluateMilestoneStatus(key, context)
    case 'prior_observation':
      return evaluatePriorObservation(key, context)
    case 'screening_result':
      return evaluateScreeningResult(key, context)
    case 'vaccination_status':
      return evaluateVaccinationStatus(key, context)
    case 'family_history':
      return evaluateFamilyHistory(key, context)
    case 'active_condition':
      return evaluateActiveCondition(key, context)
    case 'medication':
      return evaluateMedication(key, context)
    case 'diet':
      return evaluateDiet(key, context)
    case 'environment':
      return evaluateEnvironment(key, context)
    case 'recent_illness':
      return evaluateRecentIllness(key, context)
    default:
      return { applies: false, multiplier: 1.0, explanation: 'Unknown modifier source' }
  }
}

function evaluateBirthHistory(
  key: string,
  context: LifeRecordContext
): { applies: boolean; multiplier: number; explanation: string } {
  const bh = context.birthHistory

  switch (key) {
    case 'preterm':
      if (bh.gestationalWeeks && bh.gestationalWeeks < 37) {
        return { applies: true, multiplier: 1.0, explanation: `Born at ${bh.gestationalWeeks} weeks (preterm)` }
      }
      return { applies: false, multiplier: 1.0, explanation: '' }

    case 'very_preterm':
      if (bh.gestationalWeeks && bh.gestationalWeeks < 32) {
        return { applies: true, multiplier: 1.0, explanation: `Born at ${bh.gestationalWeeks} weeks (very preterm)` }
      }
      return { applies: false, multiplier: 1.0, explanation: '' }

    case 'extremely_preterm':
      if (bh.gestationalWeeks && bh.gestationalWeeks < 28) {
        return { applies: true, multiplier: 1.0, explanation: `Born at ${bh.gestationalWeeks} weeks (extremely preterm)` }
      }
      return { applies: false, multiplier: 1.0, explanation: '' }

    case 'cesarean':
      if (bh.deliveryMode === 'cesarean') {
        return { applies: true, multiplier: 1.0, explanation: 'Delivered via cesarean section' }
      }
      return { applies: false, multiplier: 1.0, explanation: '' }

    case 'low_birth_weight':
      if (bh.birthWeight && bh.birthWeight < 2500) {
        return { applies: true, multiplier: 1.0, explanation: `Birth weight ${bh.birthWeight}g (low)` }
      }
      return { applies: false, multiplier: 1.0, explanation: '' }

    case 'very_low_birth_weight':
      if (bh.birthWeight && bh.birthWeight < 1500) {
        return { applies: true, multiplier: 1.0, explanation: `Birth weight ${bh.birthWeight}g (very low)` }
      }
      return { applies: false, multiplier: 1.0, explanation: '' }

    case 'nicu_stay':
      if (bh.nicuStay) {
        const days = bh.nicuDays ? ` (${bh.nicuDays} days)` : ''
        return { applies: true, multiplier: 1.0, explanation: `NICU stay${days}` }
      }
      return { applies: false, multiplier: 1.0, explanation: '' }

    case 'birth_complications':
      if (bh.complications && bh.complications.length > 0) {
        return { applies: true, multiplier: 1.0, explanation: `Birth complications: ${bh.complications.join(', ')}` }
      }
      return { applies: false, multiplier: 1.0, explanation: '' }

    case 'low_apgar':
      if (bh.apgarScore !== undefined && bh.apgarScore < 7) {
        return { applies: true, multiplier: 1.0, explanation: `Low Apgar score: ${bh.apgarScore}` }
      }
      return { applies: false, multiplier: 1.0, explanation: '' }

    default:
      return { applies: false, multiplier: 1.0, explanation: '' }
  }
}

function evaluateGrowthTrend(
  key: string,
  context: LifeRecordContext
): { applies: boolean; multiplier: number; explanation: string } {
  const g = context.growth

  switch (key) {
    case 'percentile_crossing_down':
      if (g.percentileCrossing === 'downward') {
        return { applies: true, multiplier: 1.0, explanation: 'Growth percentiles crossing downward' }
      }
      return { applies: false, multiplier: 1.0, explanation: '' }

    case 'percentile_crossing_up':
      if (g.percentileCrossing === 'upward') {
        return { applies: true, multiplier: 1.0, explanation: 'Growth percentiles crossing upward' }
      }
      return { applies: false, multiplier: 1.0, explanation: '' }

    case 'percentile_stable':
      if (g.percentileCrossing === 'stable') {
        return { applies: true, multiplier: 1.0, explanation: 'Growth tracking stably on percentile curves' }
      }
      return { applies: false, multiplier: 1.0, explanation: '' }

    case 'weight_z_below_minus2':
      if (g.latestZScores?.weightForAge !== undefined && g.latestZScores.weightForAge < -2) {
        return { applies: true, multiplier: 1.0, explanation: `Weight Z-score ${g.latestZScores.weightForAge.toFixed(1)} (below -2)` }
      }
      return { applies: false, multiplier: 1.0, explanation: '' }

    case 'height_z_below_minus2':
      if (g.latestZScores?.heightForAge !== undefined && g.latestZScores.heightForAge < -2) {
        return { applies: true, multiplier: 1.0, explanation: `Height Z-score ${g.latestZScores.heightForAge.toFixed(1)} (below -2)` }
      }
      return { applies: false, multiplier: 1.0, explanation: '' }

    case 'bmi_z_above_2':
      if (g.latestZScores?.bmiForAge !== undefined && g.latestZScores.bmiForAge > 2) {
        return { applies: true, multiplier: 1.0, explanation: `BMI Z-score ${g.latestZScores.bmiForAge.toFixed(1)} (above +2, obese range)` }
      }
      return { applies: false, multiplier: 1.0, explanation: '' }

    case 'hc_z_above_2':
      if (g.latestZScores?.headCircForAge !== undefined && g.latestZScores.headCircForAge > 2) {
        return { applies: true, multiplier: 1.0, explanation: `Head circumference Z-score ${g.latestZScores.headCircForAge.toFixed(1)} (above +2)` }
      }
      return { applies: false, multiplier: 1.0, explanation: '' }

    case 'hc_z_below_minus2':
      if (g.latestZScores?.headCircForAge !== undefined && g.latestZScores.headCircForAge < -2) {
        return { applies: true, multiplier: 1.0, explanation: `Head circumference Z-score ${g.latestZScores.headCircForAge.toFixed(1)} (below -2, microcephaly range)` }
      }
      return { applies: false, multiplier: 1.0, explanation: '' }

    case 'rapid_hc_growth':
      if (g.latestZScores?.headCircForAge !== undefined && g.latestZScores.headCircForAge > 2 && g.percentileCrossing === 'upward') {
        return { applies: true, multiplier: 1.0, explanation: 'Rapid head circumference growth with upward percentile crossing' }
      }
      return { applies: false, multiplier: 1.0, explanation: '' }

    case 'no_growth_data':
      if (!g.records || g.records.length === 0) {
        return { applies: true, multiplier: 1.0, explanation: 'No growth data recorded — cannot assess trends' }
      }
      return { applies: false, multiplier: 1.0, explanation: '' }

    default:
      return { applies: false, multiplier: 1.0, explanation: '' }
  }
}

function evaluateMilestoneStatus(
  key: string,
  context: LifeRecordContext
): { applies: boolean; multiplier: number; explanation: string } {
  const ms = context.milestones

  // Check if a specific milestone is achieved
  if (key.endsWith('_achieved')) {
    const milestoneKey = key.replace('_achieved', '')
    const found = ms.achieved.find((m) => m.key === milestoneKey || m.key.includes(milestoneKey))
    if (found) {
      return { applies: true, multiplier: 1.0, explanation: `Milestone achieved: ${found.key}` }
    }
    return { applies: false, multiplier: 1.0, explanation: '' }
  }

  // Check if a specific milestone is delayed
  if (key.endsWith('_delayed')) {
    const milestoneKey = key.replace('_delayed', '')
    const found = ms.delayed.find((m) => m.key === milestoneKey || m.key.includes(milestoneKey))
    if (found) {
      return { applies: true, multiplier: 1.0, explanation: `Milestone delayed: ${found.key} (expected by ${found.expectedAgeMax} months)` }
    }
    return { applies: false, multiplier: 1.0, explanation: '' }
  }

  // Check for any regression
  if (key === 'any_regression') {
    if (ms.regressions && ms.regressions.length > 0) {
      return { applies: true, multiplier: 1.0, explanation: `Milestone regression detected: ${ms.regressions.map((r) => r.key).join(', ')}` }
    }
    return { applies: false, multiplier: 1.0, explanation: '' }
  }

  // Check for multiple delays
  if (key === 'multiple_delays') {
    if (ms.delayed.length >= 2) {
      return { applies: true, multiplier: 1.0, explanation: `Multiple milestones delayed (${ms.delayed.length}): ${ms.delayed.map((d) => d.key).join(', ')}` }
    }
    return { applies: false, multiplier: 1.0, explanation: '' }
  }

  // Check for delays in a specific category
  if (key.startsWith('delays_in_')) {
    const category = key.replace('delays_in_', '')
    const categoryDelays = ms.delayed.filter((d) => d.category === category)
    if (categoryDelays.length > 0) {
      return { applies: true, multiplier: 1.0, explanation: `Delayed milestones in ${category}: ${categoryDelays.map((d) => d.key).join(', ')}` }
    }
    return { applies: false, multiplier: 1.0, explanation: '' }
  }

  // Generic: check if key exists in delayed or achieved
  const inDelayed = ms.delayed.find((m) => m.key.includes(key))
  if (inDelayed) {
    return { applies: true, multiplier: 1.0, explanation: `Related milestone delayed: ${inDelayed.key}` }
  }

  return { applies: false, multiplier: 1.0, explanation: '' }
}

function evaluatePriorObservation(
  key: string,
  context: LifeRecordContext
): { applies: boolean; multiplier: number; explanation: string } {
  const obs = context.recentObservations

  // Check for recurrent observations with similar keywords
  if (key === 'recurrent') {
    // Look for 3+ similar observations in recent history
    const grouped = new Map<string, number>()
    for (const ob of obs) {
      const cat = ob.category || 'general'
      grouped.set(cat, (grouped.get(cat) || 0) + 1)
    }
    for (const [cat, count] of grouped) {
      if (count >= 3) {
        return { applies: true, multiplier: 1.0, explanation: `Recurrent observations in ${cat} (${count} times recently)` }
      }
    }
    return { applies: false, multiplier: 1.0, explanation: '' }
  }

  // Check for high-concern prior observations
  if (key === 'prior_high_concern') {
    const highConcern = obs.filter((o) => o.concernLevel === 'high' || o.concernLevel === 'urgent')
    if (highConcern.length > 0) {
      return { applies: true, multiplier: 1.0, explanation: `Prior high-concern observations: ${highConcern.map((o) => o.text.substring(0, 40)).join('; ')}` }
    }
    return { applies: false, multiplier: 1.0, explanation: '' }
  }

  // Check for observations containing specific keywords
  const matching = obs.filter((o) => o.text.toLowerCase().includes(key.toLowerCase()))
  if (matching.length > 0) {
    return { applies: true, multiplier: 1.0, explanation: `Prior observation mentioning "${key}" (${matching.length} time${matching.length > 1 ? 's' : ''})` }
  }

  return { applies: false, multiplier: 1.0, explanation: '' }
}

function evaluateScreeningResult(
  key: string,
  context: LifeRecordContext
): { applies: boolean; multiplier: number; explanation: string } {
  const screenings = context.screeningResults

  // Check for a specific screening type and result
  if (key.includes('_pass') || key.includes('_fail') || key.includes('_refer')) {
    const parts = key.split('_')
    const resultType = parts.pop()!
    const screenType = parts.join('_')

    const found = screenings.find((s) =>
      s.type.toLowerCase().includes(screenType.toLowerCase())
    )
    if (found) {
      const resultMatch = resultType === 'pass'
        ? found.result.toLowerCase().includes('pass') || found.result.toLowerCase().includes('normal')
        : found.result.toLowerCase().includes('fail') || found.result.toLowerCase().includes('refer') || found.result.toLowerCase().includes('abnormal')

      if (resultMatch) {
        return { applies: true, multiplier: 1.0, explanation: `${found.type} screening: ${found.result}` }
      }
    }
    return { applies: false, multiplier: 1.0, explanation: '' }
  }

  // Generic: check if any screening of this type exists
  const found = screenings.find((s) => s.type.toLowerCase().includes(key.toLowerCase()))
  if (found) {
    return { applies: true, multiplier: 1.0, explanation: `${found.type} screening result: ${found.result}` }
  }

  return { applies: false, multiplier: 1.0, explanation: '' }
}

function evaluateVaccinationStatus(
  key: string,
  context: LifeRecordContext
): { applies: boolean; multiplier: number; explanation: string } {
  const vacc = context.vaccinations

  if (key === 'up_to_date') {
    if (vacc.overdue.length === 0) {
      return { applies: true, multiplier: 1.0, explanation: 'Vaccinations up to date' }
    }
    return { applies: false, multiplier: 1.0, explanation: '' }
  }

  if (key === 'overdue') {
    if (vacc.overdue.length > 0) {
      return { applies: true, multiplier: 1.0, explanation: `Overdue vaccinations: ${vacc.overdue.join(', ')}` }
    }
    return { applies: false, multiplier: 1.0, explanation: '' }
  }

  // Check specific vaccine
  if (key.startsWith('missing_')) {
    const vaccine = key.replace('missing_', '')
    if (vacc.overdue.some((v) => v.toLowerCase().includes(vaccine.toLowerCase()))) {
      return { applies: true, multiplier: 1.0, explanation: `Missing vaccination: ${vaccine}` }
    }
    return { applies: false, multiplier: 1.0, explanation: '' }
  }

  return { applies: false, multiplier: 1.0, explanation: '' }
}

function evaluateFamilyHistory(
  key: string,
  context: LifeRecordContext
): { applies: boolean; multiplier: number; explanation: string } {
  const fh = context.familyHistory

  const match = fh.find((h) => h.toLowerCase().includes(key.toLowerCase()))
  if (match) {
    return { applies: true, multiplier: 1.0, explanation: `Family history: ${match}` }
  }

  return { applies: false, multiplier: 1.0, explanation: '' }
}

function evaluateActiveCondition(
  key: string,
  context: LifeRecordContext
): { applies: boolean; multiplier: number; explanation: string } {
  const conditions = context.activeConditions

  const match = conditions.find((c) => c.toLowerCase().includes(key.toLowerCase()))
  if (match) {
    return { applies: true, multiplier: 1.0, explanation: `Active condition: ${match}` }
  }

  return { applies: false, multiplier: 1.0, explanation: '' }
}

function evaluateMedication(
  key: string,
  context: LifeRecordContext
): { applies: boolean; multiplier: number; explanation: string } {
  const meds = context.currentMedications

  const match = meds.find((m) => m.toLowerCase().includes(key.toLowerCase()))
  if (match) {
    return { applies: true, multiplier: 1.0, explanation: `Current medication: ${match}` }
  }

  return { applies: false, multiplier: 1.0, explanation: '' }
}

function evaluateDiet(
  key: string,
  context: LifeRecordContext
): { applies: boolean; multiplier: number; explanation: string } {
  const d = context.diet

  switch (key) {
    case 'exclusively_breastfed':
      if (d.breastfed && !d.formulaFed && !d.solidsStarted) {
        return { applies: true, multiplier: 1.0, explanation: 'Exclusively breastfed' }
      }
      return { applies: false, multiplier: 1.0, explanation: '' }

    case 'formula_fed':
      if (d.formulaFed) {
        return { applies: true, multiplier: 1.0, explanation: 'Formula fed' }
      }
      return { applies: false, multiplier: 1.0, explanation: '' }

    case 'no_solids':
      if (!d.solidsStarted && context.child.ageMonths >= 6) {
        return { applies: true, multiplier: 1.0, explanation: 'Solids not yet introduced (age ≥ 6 months)' }
      }
      return { applies: false, multiplier: 1.0, explanation: '' }

    case 'low_food_diversity':
      if (d.foodDiversity !== undefined && d.foodDiversity < 4) {
        return { applies: true, multiplier: 1.0, explanation: `Low food diversity: ${d.foodDiversity}/7 food groups` }
      }
      return { applies: false, multiplier: 1.0, explanation: '' }

    case 'no_iron_supplement':
      if (!d.ironSupplement) {
        return { applies: true, multiplier: 1.0, explanation: 'No iron supplementation' }
      }
      return { applies: false, multiplier: 1.0, explanation: '' }

    case 'no_vitamin_d':
      if (!d.vitaminD) {
        return { applies: true, multiplier: 1.0, explanation: 'No vitamin D supplementation' }
      }
      return { applies: false, multiplier: 1.0, explanation: '' }

    case 'iron_supplemented':
      if (d.ironSupplement) {
        return { applies: true, multiplier: 1.0, explanation: 'Receiving iron supplementation' }
      }
      return { applies: false, multiplier: 1.0, explanation: '' }

    default:
      return { applies: false, multiplier: 1.0, explanation: '' }
  }
}

function evaluateEnvironment(
  key: string,
  _context: LifeRecordContext
): { applies: boolean; multiplier: number; explanation: string } {
  // Environment data would come from profile settings — for now, return not applicable
  // This will be enriched as environment tracking is added to the life record
  return { applies: false, multiplier: 1.0, explanation: `Environment factor "${key}" not yet tracked` }
}

function evaluateRecentIllness(
  key: string,
  context: LifeRecordContext
): { applies: boolean; multiplier: number; explanation: string } {
  const illnesses = context.recentIllnesses

  const match = illnesses.find((i) => i.type.toLowerCase().includes(key.toLowerCase()))
  if (match) {
    return { applies: true, multiplier: 1.0, explanation: `Recent illness: ${match.type} on ${match.date}` }
  }

  // Check if ANY recent illness exists
  if (key === 'any' && illnesses.length > 0) {
    return { applies: true, multiplier: 1.0, explanation: `Recent illnesses: ${illnesses.map((i) => i.type).join(', ')}` }
  }

  return { applies: false, multiplier: 1.0, explanation: '' }
}

// ============================================
// EVIDENCE GATHERING
// ============================================

/**
 * Gather evidence FOR a condition from the life record.
 * Evidence = life record data points that increase the probability of this condition.
 */
function gatherEvidenceFor(
  entry: ConditionObservationEntry,
  context: LifeRecordContext,
  modifierResults: Array<{ applies: boolean; multiplier: number; explanation: string; source: ModifierSource; key: string }>
): string[] {
  const evidence: string[] = []

  // Modifiers that increased probability
  for (const mr of modifierResults) {
    if (mr.applies && mr.multiplier > 1) {
      evidence.push(mr.explanation)
    }
  }

  // Check for milestone delays in the relevant domain
  const domainDelays = context.milestones.delayed.filter((d) =>
    d.category.toLowerCase().includes(entry.domain) ||
    entry.domain.includes(d.category.toLowerCase())
  )
  if (domainDelays.length > 0) {
    evidence.push(`Delayed milestones in ${entry.domain}: ${domainDelays.map((d) => d.key).join(', ')}`)
  }

  // Check for regressions
  if (context.milestones.regressions.length > 0) {
    evidence.push(`Milestone regressions present: ${context.milestones.regressions.map((r) => r.key).join(', ')}`)
  }

  // Check for prior similar observations
  const similarObs = context.recentObservations.filter((o) =>
    entry.observationPatterns.some((p) => o.text.toLowerCase().includes(p.toLowerCase()))
  )
  if (similarObs.length > 0) {
    evidence.push(`${similarObs.length} prior similar observation(s) recorded`)
  }

  return evidence
}

/**
 * Gather evidence AGAINST a condition from the life record.
 * Counter-evidence = data points that decrease the probability.
 */
function gatherEvidenceAgainst(
  entry: ConditionObservationEntry,
  context: LifeRecordContext,
  modifierResults: Array<{ applies: boolean; multiplier: number; explanation: string; source: ModifierSource; key: string }>
): string[] {
  const evidence: string[] = []

  // Modifiers that decreased probability
  for (const mr of modifierResults) {
    if (mr.applies && mr.multiplier < 1) {
      evidence.push(mr.explanation)
    }
  }

  // If it's a developmental condition but milestones in that domain are on track
  if (['developmental', 'neurological', 'behavioral'].includes(entry.conditionCategory)) {
    const domainAchieved = context.milestones.achieved.filter((a) =>
      a.category.toLowerCase().includes(entry.domain) ||
      entry.domain.includes(a.category.toLowerCase())
    )
    if (domainAchieved.length > 0 && context.milestones.delayed.length === 0) {
      evidence.push(`All ${entry.domain} milestones achieved and on track`)
    }
  }

  // Normal screening results in relevant domain
  const normalScreenings = context.screeningResults.filter(
    (s) =>
      (s.result.toLowerCase().includes('normal') || s.result.toLowerCase().includes('pass')) &&
      s.type.toLowerCase().includes(entry.domain)
  )
  if (normalScreenings.length > 0) {
    evidence.push(`Normal ${entry.domain} screening: ${normalScreenings.map((s) => s.type).join(', ')}`)
  }

  // Stable growth for growth-related conditions
  if (entry.domain === 'growth' && context.growth.percentileCrossing === 'stable') {
    evidence.push('Growth tracking stably along percentile curves')
  }

  return evidence
}

// ============================================
// CLARIFYING QUESTIONS
// ============================================

/**
 * Generate clarifying questions when there's ambiguity.
 * These help the parent provide more detail to refine the projection.
 */
function generateClarifyingQuestions(
  projections: ObservationProjection[],
  context: LifeRecordContext,
  observationText: string
): string[] {
  const questions: string[] = []
  const asked = new Set<string>()

  for (const proj of projections) {
    // If probability is in the uncertain zone (0.1 - 0.5), ask clarifying Qs
    if (proj.adjustedProbability >= 0.1 && proj.adjustedProbability <= 0.5) {
      for (const step of proj.parentNextSteps) {
        if (!asked.has(step) && questions.length < 5) {
          // Only ask if the observation doesn't already answer it
          if (!observationText.toLowerCase().includes(step.toLowerCase().split('?')[0].slice(-20))) {
            questions.push(step)
            asked.add(step)
          }
        }
      }
    }
  }

  // Always ask about duration/frequency if not mentioned
  const lowerObs = observationText.toLowerCase()
  if (!lowerObs.includes('week') && !lowerObs.includes('day') && !lowerObs.includes('month') && !lowerObs.includes('since')) {
    questions.push('How long have you noticed this? (days, weeks, months)')
  }

  // Ask about worsening/improving if not mentioned
  if (!lowerObs.includes('worse') && !lowerObs.includes('better') && !lowerObs.includes('improv') && !lowerObs.includes('progress')) {
    questions.push('Is this getting worse, staying the same, or improving?')
  }

  return questions.slice(0, 5) // Max 5 clarifying questions
}

// ============================================
// PROBABILITY CLAMPING & NORMALIZATION
// ============================================

/** Clamp probability to valid range */
function clampProbability(p: number): number {
  return Math.max(0.001, Math.min(0.999, p))
}

/**
 * Compute overall confidence based on data completeness.
 * More life record data = higher confidence in projections.
 */
function computeConfidence(context: LifeRecordContext): number {
  let score = 0
  let maxScore = 0

  // Birth history completeness
  maxScore += 4
  if (context.birthHistory.gestationalWeeks) score += 1
  if (context.birthHistory.deliveryMode) score += 1
  if (context.birthHistory.birthWeight) score += 1
  if (context.birthHistory.nicuStay !== undefined) score += 1

  // Growth data
  maxScore += 3
  if (context.growth.records.length > 0) score += 1
  if (context.growth.records.length >= 3) score += 1
  if (context.growth.latestZScores) score += 1

  // Milestones
  maxScore += 2
  if (context.milestones.achieved.length > 0) score += 1
  if (context.milestones.achieved.length >= 5) score += 1

  // Screening
  maxScore += 1
  if (context.screeningResults.length > 0) score += 1

  // Vaccination
  maxScore += 1
  if (context.vaccinations.completed.length > 0) score += 1

  // Family history
  maxScore += 1
  if (context.familyHistory.length > 0) score += 1

  // Diet
  maxScore += 1
  if (context.diet.breastfed !== undefined || context.diet.formulaFed !== undefined) score += 1

  // Observation history
  maxScore += 2
  if (context.recentObservations.length > 0) score += 1
  if (context.recentObservations.length >= 3) score += 1

  // Base confidence: 0.3 (observation alone) to 0.95 (complete life record)
  return 0.3 + (score / maxScore) * 0.65
}

// ============================================
// MAIN PROJECTION ENGINE
// ============================================

/**
 * The core projection function.
 * Takes a parent's observation and the child's complete life record,
 * then projects probable conditions with Bayesian-updated probabilities.
 *
 * This is the heart of the SKIDS Life Record.
 */
export function projectObservation(
  observationText: string,
  context: LifeRecordContext,
  observationId?: string
): ProjectionResult {
  const ageMonths = context.child.ageMonths

  // Layer 1: Knowledge Graph — find matching conditions from population data
  const matchedEntries = matchObservationToConditions(observationText, ageMonths)

  // Determine which domains were actually matched by the observation
  const matchedDomains = new Set(matchedEntries.map((e) => e.domain))

  // Also pull in must-not-miss conditions — but ONLY from domains that the
  // observation actually relates to. This prevents "speech delay" from surfacing
  // unrelated must-not-miss conditions like septic arthritis or Kawasaki disease.
  const mustNotMiss = getMustNotMissConditions(ageMonths)
  const matchedIds = new Set(matchedEntries.map((e) => e.id))
  const additionalMustNotMiss = mustNotMiss.filter(
    (m) => !matchedIds.has(m.id) && matchedDomains.has(m.domain)
  )

  // Tag entries with match source for sorting: pattern-matched entries are
  // more relevant than safety-net must-not-miss additions
  const allEntries = [
    ...matchedEntries.map((e) => ({ ...e, _matchSource: 'pattern' as const })),
    ...additionalMustNotMiss.map((e) => ({
      ...e,
      baseProbability: e.baseProbability * 0.3,
      _matchSource: 'safety-net' as const,
    })),
  ]

  // Layer 2: Life Record Prior — apply Bayesian modifiers from child's history
  const projections: ObservationProjection[] = allEntries.map((entry) => {
    let adjustedProb = entry.baseProbability

    const appliedModifiers: ObservationProjection['modifiersApplied'] = []

    // Evaluate each modifier against the life record
    for (const modifier of entry.modifiers) {
      const result = evaluateModifier(modifier, context)

      if (result.applies) {
        const effectiveMultiplier = modifier.multiplier
        adjustedProb *= effectiveMultiplier

        appliedModifiers.push({
          source: modifier.source,
          key: modifier.key,
          multiplier: effectiveMultiplier,
          explanation: result.explanation || modifier.explanation,
          direction: effectiveMultiplier > 1 ? 'increased' : 'decreased',
        })
      }
    }

    // Clamp to valid probability range
    adjustedProb = clampProbability(adjustedProb)

    // Gather evidence for and against
    const modifierResults = entry.modifiers.map((m) => ({
      ...evaluateModifier(m, context),
      source: m.source,
      key: m.key,
    }))

    const evidenceFor = gatherEvidenceFor(entry, context, modifierResults)
    const evidenceAgainst = gatherEvidenceAgainst(entry, context, modifierResults)

    return {
      conditionName: entry.conditionName,
      icd10: entry.icd10,
      domain: entry.domain,
      category: entry.conditionCategory,
      baseProbability: entry.baseProbability,
      adjustedProbability: adjustedProb,
      modifiersApplied: appliedModifiers,
      evidenceFor,
      evidenceAgainst,
      parentNextSteps: entry.parentNextSteps,
      doctorExamPoints: entry.doctorExamPoints,
      ruleOutBefore: entry.ruleOutBefore || [],
      urgency: entry.urgency,
      mustNotMiss: entry.mustNotMiss,
      parentExplanation: entry.parentExplanation,
      citation: entry.citation,
      doctorStatus: 'projected',
      _sourceId: entry.id,
      _matchSource: entry._matchSource || 'pattern',
    }
  })

  // Sort by clinical relevance:
  // 1. Pattern-matched conditions first (directly relevant to observation)
  // 2. Within each group, higher probability first
  // 3. Must-not-miss gets a boost within its relevance group, not a global override
  projections.sort((a, b) => {
    // Primary: pattern-matched (relevant) conditions before safety-net additions
    const aRelevant = matchedIds.has(a._sourceId) ? 1 : 0
    const bRelevant = matchedIds.has(b._sourceId) ? 1 : 0
    if (aRelevant !== bRelevant) return bRelevant - aRelevant

    // Secondary: must-not-miss conditions surface higher within their relevance group
    if (a.mustNotMiss && !b.mustNotMiss) return -1
    if (!a.mustNotMiss && b.mustNotMiss) return 1

    // Tertiary: urgency (emergency > urgent > soon > routine)
    const urgencyOrder: Record<string, number> = { emergency: 4, urgent: 3, soon: 2, routine: 1 }
    const urgDiff = (urgencyOrder[b.urgency] || 0) - (urgencyOrder[a.urgency] || 0)
    if (urgDiff !== 0) return urgDiff

    // Finally: by adjusted probability
    return b.adjustedProbability - a.adjustedProbability
  })

  // Generate clarifying questions from the TOP relevant projections only
  const topProjections = projections.slice(0, 8)
  const clarifyingQuestions = generateClarifyingQuestions(topProjections, context, observationText)

  // Compute confidence based on life record completeness
  const confidence = computeConfidence(context)

  // Detect domains involved
  const domainsDetected = detectDomains(observationText, ageMonths) as BodySystem[]

  // Clean internal tracking fields from output
  const cleanProjections = projections.map(({ _sourceId, _matchSource, ...rest }) => ({
    ...rest,
    matchSource: _matchSource, // expose as proper field for UI
  }))

  return {
    observationId: observationId || crypto.randomUUID(),
    observationText,
    childAge: formatAge(ageMonths),
    childName: context.child.name,
    projections: cleanProjections as ObservationProjection[],
    clarifyingQuestions,
    confidence,
    computedAt: new Date().toISOString(),
    domainsDetected,
  }
}

// ============================================
// DOCTOR REFINEMENT — Layer 3
// ============================================

/**
 * Apply a doctor's clinical refinement to a projection.
 * This is Layer 3 — the HITL confirmation/rule-out loop.
 */
export function applyDoctorRefinement(
  projection: ObservationProjection,
  action: 'confirm' | 'rule_out' | 'investigate' | 'adjust_probability',
  clinicalFindings?: string,
  adjustedProbability?: number,
  notes?: string
): ObservationProjection {
  const updated = { ...projection }

  switch (action) {
    case 'confirm':
      updated.doctorStatus = 'confirmed'
      updated.adjustedProbability = clampProbability(
        adjustedProbability ?? Math.max(projection.adjustedProbability, 0.9)
      )
      updated.doctorNotes = clinicalFindings
        ? `CONFIRMED — ${clinicalFindings}${notes ? `. ${notes}` : ''}`
        : `CONFIRMED${notes ? ` — ${notes}` : ''}`
      break

    case 'rule_out':
      updated.doctorStatus = 'ruled_out'
      updated.adjustedProbability = 0.001
      updated.doctorNotes = clinicalFindings
        ? `RULED OUT — ${clinicalFindings}${notes ? `. ${notes}` : ''}`
        : `RULED OUT${notes ? ` — ${notes}` : ''}`
      break

    case 'investigate':
      updated.doctorStatus = 'investigating'
      updated.doctorNotes = clinicalFindings
        ? `INVESTIGATING — ${clinicalFindings}${notes ? `. ${notes}` : ''}`
        : `INVESTIGATING${notes ? ` — ${notes}` : ''}`
      break

    case 'adjust_probability':
      updated.doctorStatus = 'investigating'
      if (adjustedProbability !== undefined) {
        updated.adjustedProbability = clampProbability(adjustedProbability)
      }
      updated.doctorNotes = clinicalFindings
        ? `Probability adjusted — ${clinicalFindings}${notes ? `. ${notes}` : ''}`
        : notes || 'Probability manually adjusted by clinician'
      break
  }

  return updated
}

// ============================================
// UTILITIES
// ============================================

/** Format age in months to a human-readable string */
function formatAge(months: number): string {
  if (months < 1) return 'newborn'
  if (months < 24) return `${months} month${months === 1 ? '' : 's'}`
  const years = Math.floor(months / 12)
  const remainingMonths = months % 12
  if (remainingMonths === 0) return `${years} year${years === 1 ? '' : 's'}`
  return `${years} year${years === 1 ? '' : 's'} ${remainingMonths} month${remainingMonths === 1 ? '' : 's'}`
}

/**
 * Get a summary of the most likely projections — used for the parent view.
 * Filters out ruled-out conditions and returns top N by probability.
 */
export function getParentSummary(
  result: ProjectionResult,
  maxProjections: number = 5
): {
  mostLikely: Array<{
    condition: string
    probability: string
    explanation: string
    nextSteps: string[]
    urgency: string
  }>
  mustNotMiss: Array<{
    condition: string
    explanation: string
    urgency: string
  }>
  clarifyingQuestions: string[]
  confidence: string
} {
  const active = result.projections.filter((p) => p.doctorStatus !== 'ruled_out')

  const mostLikely = active
    .filter((p) => !p.mustNotMiss)
    .slice(0, maxProjections)
    .map((p) => ({
      condition: p.conditionName,
      probability: `${(p.adjustedProbability * 100).toFixed(0)}%`,
      explanation: p.parentExplanation,
      nextSteps: p.parentNextSteps,
      urgency: p.urgency,
    }))

  const mustNotMiss = active
    .filter((p) => p.mustNotMiss)
    .map((p) => ({
      condition: p.conditionName,
      explanation: p.parentExplanation,
      urgency: p.urgency,
    }))

  return {
    mostLikely,
    mustNotMiss,
    clarifyingQuestions: result.clarifyingQuestions,
    confidence: result.confidence >= 0.7
      ? 'High — comprehensive life record available'
      : result.confidence >= 0.5
        ? 'Moderate — some life record data available'
        : 'Low — limited life record data. Adding more history will improve accuracy.',
  }
}

/**
 * Get a summary for the doctor view — includes exam points, differentials, ICD-10.
 */
export function getDoctorSummary(
  result: ProjectionResult
): {
  differentials: Array<{
    condition: string
    icd10?: string
    probability: string
    adjustedFrom: string
    domain: string
    examPoints: string[]
    ruleOutFirst: string[]
    evidenceFor: string[]
    evidenceAgainst: string[]
    status: string
    modifiers: string[]
  }>
  domainsInvolved: string[]
  confidence: string
  lifeRecordCompleteness: string
} {
  const differentials = result.projections
    .filter((p) => p.doctorStatus !== 'ruled_out')
    .map((p) => ({
      condition: p.conditionName,
      icd10: p.icd10,
      probability: `${(p.adjustedProbability * 100).toFixed(1)}%`,
      adjustedFrom: `${(p.baseProbability * 100).toFixed(1)}%`,
      domain: p.domain,
      examPoints: p.doctorExamPoints,
      ruleOutFirst: p.ruleOutBefore,
      evidenceFor: p.evidenceFor,
      evidenceAgainst: p.evidenceAgainst,
      status: p.doctorStatus || 'projected',
      modifiers: p.modifiersApplied.map(
        (m) => `${m.direction === 'increased' ? '↑' : '↓'} ${m.explanation} (×${m.multiplier})`
      ),
    }))

  return {
    differentials,
    domainsInvolved: result.domainsDetected,
    confidence: `${(result.confidence * 100).toFixed(0)}%`,
    lifeRecordCompleteness: result.confidence >= 0.7
      ? 'Good — sufficient data for reliable projections'
      : result.confidence >= 0.5
        ? 'Moderate — some gaps in life record'
        : 'Limited — recommend gathering more history before clinical decisions',
  }
}
