/**
 * GET /api/observation-prompts?childId=xxx — Get age-appropriate domain prompts for a child
 *
 * The wire speaks to the parent.
 * Returns open-ended domain questions based on the child's age and life record.
 * The parent taps a prompt, then describes what they see in their own words.
 */

import type { APIRoute } from 'astro'
import { getParentId, verifyChildOwnership } from './children'
import { getPromptsForAge } from '../../lib/ai/life-record/domain-prompts'

export const prerender = false

export const GET: APIRoute = async ({ request, locals }) => {
  const env = (locals as any).runtime?.env || {}
  const parentId = await getParentId(request, env)
  if (!parentId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const url = new URL(request.url)
  const childId = url.searchParams.get('childId')
  if (!childId) {
    return new Response(JSON.stringify({ error: 'childId required' }), { status: 400 })
  }

  const owns = await verifyChildOwnership(parentId, childId, env.DB)
  if (!owns) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 })
  }

  try {
    // Get child's age
    const child = await env.DB.prepare('SELECT dob, name FROM children WHERE id = ?').bind(childId).first()
    if (!child) {
      return new Response(JSON.stringify({ error: 'Child not found' }), { status: 404 })
    }

    const dob = new Date(child.dob as string)
    const now = new Date()
    const ageMonths = Math.floor((now.getTime() - dob.getTime()) / (1000 * 60 * 60 * 24 * 30.44))

    // Build life record flags for conditional prompts
    let flags: Parameters<typeof getPromptsForAge>[1] = undefined

    try {
      const [birthRow, milestoneDelays, growthRow, familyRows, conditionRows] = await Promise.all([
        env.DB.prepare('SELECT gestational_weeks FROM birth_history WHERE child_id = ?').bind(childId).first().catch(() => null),
        env.DB.prepare("SELECT COUNT(*) as cnt FROM milestones WHERE child_id = ? AND status = 'delayed'").bind(childId).first().catch(() => null),
        env.DB.prepare('SELECT who_zscore_json FROM growth_records WHERE child_id = ? ORDER BY date DESC LIMIT 1').bind(childId).first().catch(() => null),
        env.DB.prepare('SELECT condition FROM family_history WHERE child_id = ?').bind(childId).all().then((r: any) => r.results || []).catch(() => []),
        env.DB.prepare("SELECT condition_name FROM active_conditions WHERE child_id = ? AND status = 'active'").bind(childId).all().then((r: any) => r.results || []).catch(() => []),
      ])

      const isPreterm = birthRow && (birthRow as any).gestational_weeks < 37
      const hasMilestoneDelays = milestoneDelays && (milestoneDelays as any).cnt > 0

      // Check for growth concern (Z-score crossing)
      let hasGrowthConcern = false
      if (growthRow && (growthRow as any).who_zscore_json) {
        try {
          const z = JSON.parse((growthRow as any).who_zscore_json)
          const wfa = z.weightForAge ?? z.wfa
          if (wfa !== undefined && (wfa < -2 || wfa > 2)) hasGrowthConcern = true
        } catch { /* ignore */ }
      }

      flags = {
        isPreterm: !!isPreterm,
        hasGrowthConcern,
        hasMilestoneDelays: !!hasMilestoneDelays,
        familyHistory: (familyRows as any[]).map((f: any) => f.condition),
        activeConditions: (conditionRows as any[]).map((c: any) => c.condition_name),
      }
    } catch {
      // If life record tables don't exist yet, just use age-based prompts
    }

    // Get prompts
    const prompts = getPromptsForAge(ageMonths, flags)

    // Personalize: replace generic "your child" with child's name
    const name = child.name as string
    const personalizedPrompts = prompts.map((p) => ({
      id: p.id,
      domain: p.domain,
      prompt: personalizePrompt(p.prompt, name),
      shortPrompt: personalizePrompt(p.shortPrompt, name),
      priority: p.priority,
    }))

    return new Response(JSON.stringify({
      childId,
      childName: name,
      ageMonths,
      prompts: personalizedPrompts,
    }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err: any) {
    console.error('[Observation Prompts] Error:', err)
    return new Response(JSON.stringify({ error: 'Failed to get prompts' }), { status: 500 })
  }
}

function personalizePrompt(prompt: string, name: string): string {
  return prompt
    .replace(/your baby/gi, name)
    .replace(/your child/gi, name)
    .replace(/your teen/gi, name)
}
