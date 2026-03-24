import type { APIRoute } from 'astro'
import { getParentId, verifyChildOwnership } from '@/pages/api/children'
import { computeHealthScore, computeComponents, computeTrend } from '@/lib/phr/health-score'
import { getEnv } from '@/lib/runtime/env'
import type { GrowthInput, DevelopmentInput, HabitsInput, NutritionInput } from '@/lib/phr/health-score'

export const prerender = false

export const GET: APIRoute = async ({ params, request, locals }) => {
  const env = getEnv(locals)
  const parentId = await getParentId(request, env)
  if (!parentId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const childId = params.childId!
  const owned = await verifyChildOwnership(parentId, childId, env.DB)
  if (!owned) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 })
  }

  try {
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

    // Fetch child age months
    interface ChildRow { dob: string }
    const childRow = await env.DB.prepare('SELECT dob FROM children WHERE id = ?').bind(childId).first<ChildRow>()
    const ageMonths = childRow
      ? (() => {
          const dob = new Date(childRow.dob)
          return (now.getFullYear() - dob.getFullYear()) * 12 + (now.getMonth() - dob.getMonth())
        })()
      : 0

    // ── Growth ──────────────────────────────────────────
    interface GrowthRow { who_zscore_json: string | null }
    const growthRow = await env.DB
      .prepare('SELECT who_zscore_json FROM growth_records WHERE child_id = ? ORDER BY date DESC LIMIT 1')
      .bind(childId).first<GrowthRow>()

    let growthInput: GrowthInput | undefined
    if (growthRow?.who_zscore_json) {
      try {
        const z = JSON.parse(growthRow.who_zscore_json) as Record<string, number>
        const waz = z.waz ?? z.weight_for_age ?? 0
        const haz = z.haz ?? z.height_for_age ?? 0
        growthInput = { waz, haz }
      } catch { /* ignore parse errors */ }
    }

    // ── Development ─────────────────────────────────────
    interface MilestoneCountRow { achieved: number; eligible: number }
    const milestoneRow = await env.DB
      .prepare(`
        SELECT
          COUNT(CASE WHEN status = 'achieved' THEN 1 END) as achieved,
          COUNT(CASE WHEN expected_age_max <= ? THEN 1 END) as eligible
        FROM milestones WHERE child_id = ?
      `)
      .bind(ageMonths, childId).first<MilestoneCountRow>()

    let developmentInput: DevelopmentInput | undefined
    if (milestoneRow && milestoneRow.eligible > 0) {
      developmentInput = { achieved: milestoneRow.achieved, eligible: milestoneRow.eligible }
    }

    // ── Habits ───────────────────────────────────────────
    interface HabitRow { habit_type: string; streak_days: number }
    const habitRows = await env.DB
      .prepare(`
        SELECT habit_type, MAX(streak_days) as streak_days
        FROM habits_log WHERE child_id = ?
        GROUP BY habit_type
      `)
      .bind(childId).all<HabitRow>()

    let habitsInput: HabitsInput | undefined
    if (habitRows.results && habitRows.results.length > 0) {
      const streaks: Partial<Record<string, number>> = {}
      for (const row of habitRows.results) {
        streaks[row.habit_type] = row.streak_days
      }
      habitsInput = { streaks: streaks as HabitsInput['streaks'] }
    }

    // ── Nutrition ────────────────────────────────────────
    interface NutritionRow { concern_level: string }
    const nutritionRow = await env.DB
      .prepare(`
        SELECT concern_level FROM parent_observations
        WHERE child_id = ? AND category = 'nutrition'
        ORDER BY date DESC LIMIT 1
      `)
      .bind(childId).first<NutritionRow>()

    let nutritionInput: NutritionInput | undefined
    if (nutritionRow?.concern_level) {
      const level = nutritionRow.concern_level as NutritionInput['concernLevel']
      if (['none', 'mild', 'moderate', 'serious'].includes(level)) {
        nutritionInput = { concernLevel: level }
      }
    }

    const currentInputs = { growth: growthInput, development: developmentInput, habits: habitsInput, nutrition: nutritionInput }
    const currentScore = computeHealthScore(currentInputs)

    // Previous 30-day score: use growth from 30–60 days ago for trend
    interface GrowthPrevRow { who_zscore_json: string | null }
    const prevGrowthRow = await env.DB
      .prepare('SELECT who_zscore_json FROM growth_records WHERE child_id = ? AND date < ? AND date >= ? ORDER BY date DESC LIMIT 1')
      .bind(childId, thirtyDaysAgo, sixtyDaysAgo).first<GrowthPrevRow>()

    let prevGrowthInput: GrowthInput | undefined
    if (prevGrowthRow?.who_zscore_json) {
      try {
        const z = JSON.parse(prevGrowthRow.who_zscore_json) as Record<string, number>
        prevGrowthInput = { waz: z.waz ?? 0, haz: z.haz ?? 0 }
      } catch { /* ignore */ }
    }

    const previousScore = computeHealthScore({
      growth: prevGrowthInput,
      development: developmentInput,
      habits: habitsInput,
      nutrition: nutritionInput,
    })

    const trend = computeTrend(currentScore, previousScore)
    const components = computeComponents(currentInputs)

    return new Response(JSON.stringify({ score: currentScore, trend, components }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (e) {
    console.error('[health-score] error:', e)
    return new Response(JSON.stringify({ score: 0, trend: 'flat', components: {} }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
