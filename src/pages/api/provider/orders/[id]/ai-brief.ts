import type { APIRoute } from 'astro'
import { getProviderId } from '@/pages/api/provider/_auth'
import { routeToModel } from '@/lib/ai/router'
import { getEnv } from '@/lib/runtime/env'

export const prerender = false

export const GET: APIRoute = async ({ request, params, locals }) => {
  const env = getEnv(locals)
  const orderId = params.id as string

  let providerId: string
  try {
    const id = await getProviderId(request, env)
    if (!id) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
    providerId = id
  } catch (e: unknown) {
    if (e instanceof Error && 'code' in e && e.code === 'PROVIDER_PENDING') {
      return new Response(JSON.stringify({ error: 'Account pending review' }), { status: 403 })
    }
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  try {
    // Verify active order belongs to provider
    interface OrderRow { id: string; child_id: string }
    const order = await env.DB.prepare(
      "SELECT id, child_id FROM service_orders WHERE id = ? AND provider_id = ? AND status IN ('scheduled','in_progress')"
    ).bind(orderId, providerId).first<OrderRow>()

    if (!order) {
      return new Response(JSON.stringify({ error: 'Order not found or not active' }), { status: 404 })
    }

    const childId = order.child_id

    // Check KV cache
    const cacheKey = `ai-brief:${orderId}`
    if (env.KV) {
      const cached = await env.KV.get(cacheKey)
      if (cached) {
        return new Response(cached, {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      }
    }

    // Fetch child PHR data
    interface GrowthRow { id: string; child_id: string; date: string; height_cm: number | null; weight_kg: number | null; head_circ_cm: number | null; bmi: number | null }
    interface ChildRow { name: string; dob: string; gender: string | null; blood_group: string | null; allergies_json: string | null }
    const [growth, child] = await Promise.all([
      env.DB.prepare('SELECT * FROM growth_records WHERE child_id = ? ORDER BY date DESC LIMIT 1').bind(childId).first<GrowthRow>(),
      env.DB.prepare('SELECT name, dob, gender, blood_group, allergies_json FROM children WHERE id = ?').bind(childId).first<ChildRow>(),
    ])

    const [milestonesRes, vaccinationsRes, observationsRes] = await Promise.all([
      env.DB.prepare("SELECT * FROM milestones WHERE child_id = ? AND status IN ('delayed','in_progress') ORDER BY updated_at DESC LIMIT 10").bind(childId).all(),
      env.DB.prepare('SELECT * FROM vaccination_records WHERE child_id = ? AND next_due IS NOT NULL ORDER BY next_due ASC LIMIT 5').bind(childId).all(),
      env.DB.prepare("SELECT * FROM parent_observations WHERE child_id = ? AND concern_level IN ('moderate','serious') ORDER BY date DESC LIMIT 5").bind(childId).all(),
    ])

    const milestones = milestonesRes.results || []
    const vaccinations = vaccinationsRes.results || []
    const observations = observationsRes.results || []

    let allergies = 'None reported'
    if (child?.allergies_json) {
      try { allergies = JSON.parse(child.allergies_json).join(', ') } catch {}
    }

    const delayedMilestones = milestones.map((m: any) => `${m.title} (${m.status})`).join(', ') || 'None flagged'
    const vaccinationGapsList = vaccinations.map((v: any) => `${v.vaccine_name} due ${v.next_due}`).join(', ') || 'Up to date'
    const observationsList = observations.map((o: any) => `${o.observation_text} [${o.concern_level}]`).join('; ') || 'None'

    const prompt = `You are a clinical AI assistant for a pediatric teleconsult. Generate a structured pre-session brief for the doctor.

Child: ${child?.name || 'Unknown'}, DOB: ${child?.dob || 'Unknown'}, Gender: ${child?.gender || 'Unknown'}, Blood Group: ${child?.blood_group || 'Unknown'}
Allergies: ${allergies}

Latest Growth: Height ${growth?.height_cm || 'N/A'}cm, Weight ${growth?.weight_kg || 'N/A'}kg, BMI ${growth?.bmi || 'N/A'} (recorded ${growth?.date || 'N/A'})

Developmental Concerns: ${delayedMilestones}

Vaccination Gaps: ${vaccinationGapsList}

Parent-Flagged Concerns: ${observationsList}

Generate a JSON response with:
{
  "childSummary": "2-3 sentence clinical summary",
  "ddx": ["top 3 differential diagnoses based on concerns"],
  "redFlags": ["any red flags to watch for"],
  "vaccinationGaps": ["overdue vaccines"],
  "nutritionNote": "brief nutrition observation based on growth",
  "suggestedQuestions": ["3 questions doctor should ask parent"]
}`

    const aiResponse = await routeToModel(
      [{ role: 'user', content: prompt }],
      'free',
      env
    )

    let brief: any = {}
    try {
      const jsonMatch = aiResponse.text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        brief = JSON.parse(jsonMatch[0])
      }
    } catch {
      brief = {
        childSummary: aiResponse.text.slice(0, 300),
        ddx: [],
        redFlags: [],
        vaccinationGaps: [],
        nutritionNote: '',
        suggestedQuestions: [],
      }
    }

    const result = {
      childSummary: brief.childSummary || '',
      aiSuggestions: {
        ddx: brief.ddx || [],
        redFlags: brief.redFlags || [],
        vaccinationGaps: brief.vaccinationGaps || [],
        nutritionNote: brief.nutritionNote || '',
        suggestedQuestions: brief.suggestedQuestions || [],
      },
    }

    // Cache in KV for 2 hours
    if (env.KV) {
      await env.KV.put(cacheKey, JSON.stringify(result), { expirationTtl: 7200 })
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (e: unknown) {
    console.error('[ai-brief] Error:', e)
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 })
  }
}
