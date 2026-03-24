/**
 * Health Score Engine — pure functions, no I/O.
 * Computes a composite 0–100 child health score from four components.
 */

export type HabitCategory =
  | 'healthy_eating'
  | 'active_movement'
  | 'balanced_stress'
  | 'inner_coaching'
  | 'timekeepers'
  | 'sufficient_sleep'

export interface GrowthInput {
  waz: number // WHO weight-for-age z-score
  haz: number // WHO height-for-age z-score
}

export interface DevelopmentInput {
  achieved: number // milestones with status='achieved'
  eligible: number // milestones where expected_age_max <= child age months
}

export interface HabitsInput {
  streaks: Partial<Record<HabitCategory, number>> // streak_days per category
}

export interface NutritionInput {
  concernLevel: 'none' | 'mild' | 'moderate' | 'serious'
}

export interface HealthScoreInputs {
  growth?: GrowthInput
  development?: DevelopmentInput
  habits?: HabitsInput
  nutrition?: NutritionInput
}

export interface HealthScoreResult {
  score: number // integer [0, 100]
  trend: 'up' | 'down' | 'flat'
  components: {
    growth?: number
    development?: number
    habits?: number
    nutrition?: number
  }
}

const BASE_WEIGHTS: Record<string, number> = {
  growth: 0.30,
  development: 0.30,
  habits: 0.25,
  nutrition: 0.15,
}

/** Map a WHO z-score in [-3, +3] to [0, 100] */
function zscoreToScore(z: number): number {
  return Math.max(0, Math.min(100, ((z + 3) / 6) * 100))
}

/** Compute the growth component score [0, 100] */
function growthScore(input: GrowthInput): number {
  return (zscoreToScore(input.waz) + zscoreToScore(input.haz)) / 2
}

/** Compute the development component score [0, 100] */
function developmentScore(input: DevelopmentInput): number {
  if (input.eligible === 0) return 0
  return Math.min(100, (input.achieved / input.eligible) * 100)
}

/** Compute the habits component score [0, 100] */
function habitsScore(input: HabitsInput): number {
  const categories: HabitCategory[] = [
    'healthy_eating', 'active_movement', 'balanced_stress',
    'inner_coaching', 'timekeepers', 'sufficient_sleep',
  ]
  const streaks = categories.map((c) => input.streaks[c] ?? 0)
  const avg = streaks.reduce((a, b) => a + b, 0) / categories.length
  return Math.min(100, (avg / 30) * 100)
}

/** Compute the nutrition component score [0, 100] */
function nutritionScore(input: NutritionInput): number {
  const map: Record<NutritionInput['concernLevel'], number> = {
    none: 100,
    mild: 70,
    moderate: 40,
    serious: 10,
  }
  return map[input.concernLevel]
}

/**
 * Compute the composite health score.
 * Absent components have their weight redistributed proportionally.
 * Returns an integer in [0, 100].
 */
export function computeHealthScore(inputs: HealthScoreInputs): number {
  const components: Array<{ key: string; score: number; weight: number }> = []

  if (inputs.growth !== undefined) {
    components.push({ key: 'growth', score: growthScore(inputs.growth), weight: BASE_WEIGHTS.growth })
  }
  if (inputs.development !== undefined) {
    components.push({ key: 'development', score: developmentScore(inputs.development), weight: BASE_WEIGHTS.development })
  }
  if (inputs.habits !== undefined) {
    components.push({ key: 'habits', score: habitsScore(inputs.habits), weight: BASE_WEIGHTS.habits })
  }
  if (inputs.nutrition !== undefined) {
    components.push({ key: 'nutrition', score: nutritionScore(inputs.nutrition), weight: BASE_WEIGHTS.nutrition })
  }

  if (components.length === 0) return 0

  // Redistribute weights proportionally so they sum to 1.0
  const totalWeight = components.reduce((sum, c) => sum + c.weight, 0)
  const weighted = components.reduce((sum, c) => sum + (c.score * c.weight) / totalWeight, 0)

  return Math.round(Math.max(0, Math.min(100, weighted)))
}

/** Compute component scores map (for API response) */
export function computeComponents(inputs: HealthScoreInputs): HealthScoreResult['components'] {
  const result: HealthScoreResult['components'] = {}
  if (inputs.growth !== undefined) result.growth = Math.round(growthScore(inputs.growth))
  if (inputs.development !== undefined) result.development = Math.round(developmentScore(inputs.development))
  if (inputs.habits !== undefined) result.habits = Math.round(habitsScore(inputs.habits))
  if (inputs.nutrition !== undefined) result.nutrition = Math.round(nutritionScore(inputs.nutrition))
  return result
}

/**
 * Compute trend based on 30-day comparison.
 * >2 point difference = up/down; ≤2 = flat.
 */
export function computeTrend(current: number, previous: number): 'up' | 'down' | 'flat' {
  const diff = current - previous
  if (diff > 2) return 'up'
  if (diff < -2) return 'down'
  return 'flat'
}

/**
 * Get color coding for a score.
 * <40 = red, 40–69 = amber, ≥70 = green
 */
export function getScoreColor(score: number): 'red' | 'amber' | 'green' {
  if (score < 40) return 'red'
  if (score < 70) return 'amber'
  return 'green'
}
