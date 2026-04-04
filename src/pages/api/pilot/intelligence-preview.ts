/**
 * POST /api/pilot/intelligence-preview — Run intelligence on screening data
 * Public endpoint (gated by invite code). The "aha moment" API.
 */
import type { APIRoute } from 'astro'
import { getEnv } from '@/lib/runtime/env'

export const prerender = false

const V3_API = 'https://skids-api.satish-9f4.workers.dev'

function ageInMonths(dob: string): number {
  const birth = new Date(dob)
  const now = new Date()
  return (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth())
}

const DOMAIN_NAMES: Record<string, string> = {
  eye: 'Vision', ent: 'Ear, Nose & Throat', dental: 'Dental', skin: 'Skin',
  heart: 'Heart', lungs: 'Lungs', spine: 'Spine & Posture', development: 'Development',
  behavioral: 'Behavioral', motor: 'Motor Skills', language: 'Language',
  nutrition: 'Nutrition', height: 'Height', weight: 'Weight', bmi: 'BMI',
  hemoglobin: 'Hemoglobin', spo2: 'Oxygen Saturation', bp: 'Blood Pressure',
  vitals: 'Vitals', general: 'General', hair: 'Hair & Scalp', limbs: 'Limbs',
  nails: 'Nails', lymph: 'Lymph Nodes', throat: 'Throat', abdomen: 'Abdomen',
  learning: 'Learning', social: 'Social Skills', emotional: 'Emotional',
}

const GROWTH_DOMAINS = ['emotional', 'behavioral', 'nutrition_habits', 'physical_activity', 'sleep_hygiene', 'social', 'digital_wellness', 'parental_coping']

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const { qr_code, dob, invite_code } = await request.json()
    if (!qr_code || !dob) {
      return new Response(JSON.stringify({ error: 'qr_code and dob required' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
    }

    const env = getEnv(locals)
    const db = env.DB

    // Validate invite code if provided
    if (invite_code && db) {
      const invite = await db.prepare(
        'SELECT status FROM pilot_invitations WHERE invite_code = ?'
      ).bind(invite_code.trim().toUpperCase()).first() as any
      if (!invite || invite.status === 'expired' || invite.status === 'revoked') {
        return new Response(JSON.stringify({ error: 'Invalid or expired invite code' }), { status: 403, headers: { 'Content-Type': 'application/json' } })
      }
    }

    // Fetch screening data from V3
    const verifyRes = await fetch(`${V3_API}/api/parent-portal/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: qr_code, dob }),
    })

    if (!verifyRes.ok) {
      const errData = await verifyRes.json().catch(() => ({})) as any
      return new Response(JSON.stringify({ error: 'Could not verify screening data', detail: errData.error }), { status: verifyRes.status, headers: { 'Content-Type': 'application/json' } })
    }

    const screeningData = await verifyRes.json() as any
    const child = screeningData.child || {}
    const childAge = child.dob ? ageInMonths(child.dob) : ageInMonths(dob)
    const gender = child.gender || 'unknown'

    // Build vitals
    const vitals: Record<string, any> = {}
    for (const obs of (screeningData.observations || [])) {
      const module = obs.moduleType?.toLowerCase()
      if (['height', 'weight', 'bmi', 'hemoglobin', 'spo2', 'bp'].includes(module)) {
        const ann = obs.aiAnnotations?.[0]
        if (ann) vitals[module] = { value: ann.summaryText || '', risk: ann.riskCategory || 'normal' }
      }
    }

    // Build screening summary per module
    const screeningSummary: Record<string, { status: string; detail: string; urgency: string }> = {}
    for (const obs of (screeningData.observations || [])) {
      const module = obs.moduleType?.toLowerCase() || 'general'
      const annotations = obs.aiAnnotations || []
      const review = (screeningData.reviews || []).find((r: any) => r.observationId === obs.id)

      let status = 'normal'
      let detail = 'No concerns identified'
      let urgency = 'routine'

      for (const ann of annotations) {
        if (ann.riskCategory === 'high_risk' || ann.riskCategory === 'critical') {
          status = 'attention_needed'; detail = ann.summaryText || ann.conditionName || 'Requires attention'; urgency = 'soon'
        } else if (ann.riskCategory === 'moderate_risk' && status === 'normal') {
          status = 'monitor'; detail = ann.summaryText || 'Worth monitoring'; urgency = 'next_visit'
        } else if (ann.riskCategory !== 'normal' && ann.riskCategory !== 'low_risk' && status === 'normal') {
          status = 'monitor'; detail = ann.summaryText || 'Minor observation noted'
        }
      }

      if (review?.decision && review.decision !== 'normal' && review.decision !== 'no_concern') {
        status = 'attention_needed'; detail = review.notes || 'Clinician flagged for review'; urgency = 'soon'
      }

      screeningSummary[module] = { status, detail, urgency }
    }

    // Flagged observations
    const flaggedObservations: string[] = []
    for (const obs of (screeningData.observations || [])) {
      for (const ann of (obs.aiAnnotations || [])) {
        if (ann.riskCategory && ann.riskCategory !== 'normal' && ann.riskCategory !== 'low_risk') {
          flaggedObservations.push(`${obs.moduleType}: ${ann.conditionName || ann.summaryText || 'flagged'} (${ann.riskCategory})`)
        }
      }
    }

    const agePeriod = childAge < 3 ? '0-3mo' : childAge < 6 ? '3-6mo' : childAge < 12 ? '6-12mo' : childAge < 24 ? '12-24mo' : childAge < 36 ? '2-3yr' : childAge < 60 ? '3-5yr' : childAge < 96 ? '5-8yr' : childAge < 144 ? '8-12yr' : childAge < 180 ? '12-15yr' : '15-18yr'

    const growthTracks = GROWTH_DOMAINS.map(domain => ({
      domain, title: `${domain.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} (${agePeriod})`, active: true,
    }))

    const normalCount = Object.values(screeningSummary).filter(s => s.status === 'normal').length
    const monitorCount = Object.values(screeningSummary).filter(s => s.status === 'monitor').length
    const attentionCount = Object.values(screeningSummary).filter(s => s.status === 'attention_needed').length
    const childName = child.name || 'Your child'

    return new Response(JSON.stringify({
      child: { name: childName, age_months: childAge, gender, age_period: agePeriod, school: child.schoolName, class: child.class },
      screening_summary: screeningSummary,
      vitals,
      flagged_observations: flaggedObservations,
      counts: { total_modules: Object.keys(screeningSummary).length, normal: normalCount, monitor: monitorCount, attention_needed: attentionCount },
      growth_tracks: growthTracks,
      intelligence_message: attentionCount > 0
        ? `We found ${attentionCount} area${attentionCount > 1 ? 's' : ''} that need attention. SKIDS Intelligence can help you and your pediatrician track and address ${attentionCount > 1 ? 'these' : 'this'} proactively.`
        : monitorCount > 0
        ? `${childName} is doing well overall. We identified ${monitorCount} area${monitorCount > 1 ? 's' : ''} worth monitoring. SKIDS Intelligence provides ongoing guidance personalized to your child.`
        : `Great news! ${childName} looks healthy across all screening modules. SKIDS Intelligence can help you maintain this trajectory with age-appropriate guidance.`,
    }), { status: 200, headers: { 'Content-Type': 'application/json' } })
  } catch (err: any) {
    console.error('[Pilot] Intelligence preview error:', err)
    return new Response(JSON.stringify({ error: 'Failed to generate intelligence preview' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
}
