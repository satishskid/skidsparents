/**
 * POST /api/pilot/companion — SKIDS Companion Pilot API
 *
 * Runs the Bayesian projection engine on a standalone observation.
 * This is the core intelligence engine exposed for controlled testing only.
 *
 * Does NOT require a child record in the database — builds a synthetic
 * life record context from the provided parameters.
 *
 * Accepts: { observation, childAgeMonths, gender?, birthType?, additionalContext? }
 * Returns: { projections[], domainsDetected[], clarifyingQuestions[], confidence, computedAt }
 */

import type { APIRoute } from 'astro'
import { projectObservation } from '@/lib/ai/life-record/probability-engine'
import { detectDomains } from '@/lib/ai/life-record/knowledge-graph'
import type { LifeRecordContext } from '@/lib/ai/life-record/types'

export const prerender = false

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json() as {
      observation: string
      childAgeMonths: number
      gender?: string
      birthType?: string
      additionalContext?: string
    }

    const { observation, childAgeMonths, gender, birthType, additionalContext } = body

    if (!observation?.trim()) {
      return new Response(
        JSON.stringify({ error: 'observation is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    if (childAgeMonths == null || childAgeMonths < 0) {
      return new Response(
        JSON.stringify({ error: 'childAgeMonths is required and must be >= 0' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Build a synthetic life record context for standalone testing.
    // In production, this would come from the child's actual life record in the database.
    const pilotId = `pilot-${Date.now()}`
    const lifeRecord: LifeRecordContext = {
      child: {
        id: pilotId,
        name: 'Pilot Child',
        dob: new Date(Date.now() - childAgeMonths * 30.44 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        gender: (gender as 'male' | 'female' | 'other') || 'male',
        ageMonths: childAgeMonths,
      },
      birthHistory: {
        gestationalWeeks: birthType === 'preterm' ? 34 : birthType === 'post-term' ? 43 : 39,
        birthWeight: birthType === 'preterm' ? 2200 : 3200,
        deliveryMode: 'normal',
        complications: birthType === 'preterm' ? ['preterm birth'] : [],
      },
      growth: {
        records: [],
      },
      milestones: {
        achieved: [],
        delayed: [],
        notStarted: [],
        regressions: [],
      },
      recentObservations: [],
      screeningResults: [],
      vaccinations: {
        completed: [],
        overdue: [],
      },
      familyHistory: additionalContext
        ? additionalContext.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
      activeConditions: [],
      currentMedications: [],
      diet: {},
      recentIllnesses: [],
    }

    // Run the Bayesian projection engine
    const result = projectObservation(observation.trim(), lifeRecord, pilotId)

    // Also detect domains for display
    const domains = detectDomains(observation.trim())

    return new Response(
      JSON.stringify({
        observation: observation.trim(),
        childAgeMonths,
        gender: gender || 'male',
        birthType: birthType || 'term',
        domainsDetected: result.domainsDetected || domains,
        projectionsCount: result.projections.length,
        confidence: result.confidence,
        computedAt: result.computedAt,
        clarifyingQuestions: result.clarifyingQuestions || [],
        projections: result.projections.map((p) => ({
          conditionName: p.conditionName,
          icd10: p.icd10,
          domain: p.domain,
          category: p.category,
          baseProbability: p.baseProbability,
          adjustedProbability: p.adjustedProbability,
          urgency: p.urgency,
          mustNotMiss: p.mustNotMiss,
          parentExplanation: p.parentExplanation,
          modifiersApplied: p.modifiersApplied,
          evidenceFor: p.evidenceFor,
          evidenceAgainst: p.evidenceAgainst,
          parentNextSteps: p.parentNextSteps,
          doctorExamPoints: p.doctorExamPoints,
          ruleOutBefore: p.ruleOutBefore,
          citation: p.citation,
        })),
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (err: unknown) {
    console.error('[SKIDS Companion Pilot] Error:', err)
    const message = err instanceof Error ? err.message : String(err)
    return new Response(
      JSON.stringify({ error: `Projection engine error: ${message}` }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
