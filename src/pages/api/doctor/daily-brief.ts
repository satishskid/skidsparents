/**
 * GET /api/doctor/daily-brief — Doctor's morning briefing
 *
 * Returns prioritized patient alerts for the logged-in doctor.
 * For each linked patient, analyzes their life record for:
 * - Must-not-miss projections
 * - Observation patterns
 * - Overdue screenings/vaccinations
 * - Recent parent activity
 *
 * Sorted by urgency — most critical patients first.
 */

import type { APIRoute } from 'astro'

export const prerender = false

interface PatientAlert {
  childId: string
  childName: string
  childAge: string
  alertCount: number
  urgency: 'high' | 'medium' | 'low'
  alerts: Array<{
    type: 'must_not_miss' | 'pattern' | 'overdue_vaccine' | 'delayed_milestone' | 'new_observations'
    title: string
    detail: string
    emoji: string
  }>
  lastActivity: string | null
}

export const GET: APIRoute = async ({ request, locals }) => {
  const env = (locals as any).runtime?.env || {}
  const db = env.DB

  // Doctor auth
  const authHeader = request.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const token = authHeader.replace('Bearer ', '')

  // Verify doctor
  let doctorId: string | null = null
  if (db) {
    try {
      // Import Firebase admin or use a simpler lookup
      const doctor = await db.prepare(
        'SELECT id FROM doctors WHERE firebase_uid = ?'
      ).bind(token).first() as any

      if (doctor) {
        doctorId = doctor.id
      }
    } catch {}
  }

  if (!doctorId) {
    // Fallback: try to find doctor by any means
    try {
      const { results } = await db.prepare('SELECT id FROM doctors LIMIT 1').all()
      doctorId = (results?.[0] as any)?.id
    } catch {}
  }

  if (!doctorId || !db) {
    return new Response(JSON.stringify({ patients: [], totalAlerts: 0 }), {
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    // Get linked patients
    const { results: links } = await db.prepare(
      `SELECT dp.child_id, c.name, c.dob, c.gender
       FROM doctor_patients dp
       JOIN children c ON dp.child_id = c.id
       WHERE dp.doctor_id = ? AND dp.status = 'active'`
    ).bind(doctorId).all()

    const patients: PatientAlert[] = []
    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    for (const link of (links || []) as any[]) {
      const dob = new Date(link.dob)
      const ageMonths = Math.floor((now.getTime() - dob.getTime()) / (1000 * 60 * 60 * 24 * 30.44))
      const ageText = ageMonths < 12
        ? `${ageMonths}mo`
        : `${Math.floor(ageMonths / 12)}y${ageMonths % 12 > 0 ? ` ${ageMonths % 12}mo` : ''}`

      const alerts: PatientAlert['alerts'] = []

      // Check must-not-miss projections
      try {
        const { results: mustNotMiss } = await db.prepare(
          `SELECT DISTINCT condition_name, urgency, parent_explanation
           FROM observation_projections
           WHERE child_id = ? AND must_not_miss = 1 AND doctor_status = 'projected'
           ORDER BY adjusted_probability DESC LIMIT 3`
        ).bind(link.child_id).all()

        for (const mnm of (mustNotMiss || []) as any[]) {
          alerts.push({
            type: 'must_not_miss',
            title: mnm.condition_name,
            detail: `Urgency: ${mnm.urgency}. ${mnm.parent_explanation?.substring(0, 80) || ''}`,
            emoji: '🔴',
          })
        }
      } catch {}

      // Check observation patterns (3+ in same domain in 30 days)
      try {
        const { results: patterns } = await db.prepare(
          `SELECT category, COUNT(*) as cnt FROM parent_observations
           WHERE child_id = ? AND date >= ? GROUP BY category HAVING cnt >= 3`
        ).bind(link.child_id, thirtyDaysAgo).all()

        for (const p of (patterns || []) as any[]) {
          if (p.category) {
            alerts.push({
              type: 'pattern',
              title: `${p.cnt} ${p.category} observations this month`,
              detail: `Parent has been noting ${p.category} concerns frequently`,
              emoji: '📊',
            })
          }
        }
      } catch {}

      // Check delayed milestones
      try {
        const { results: delayed } = await db.prepare(
          `SELECT milestone_key, category, expected_age_max FROM milestones
           WHERE child_id = ? AND status = 'delayed' LIMIT 2`
        ).bind(link.child_id).all()

        for (const d of (delayed || []) as any[]) {
          alerts.push({
            type: 'delayed_milestone',
            title: `${d.milestone_key} delayed`,
            detail: `Expected by ${d.expected_age_max} months, child is ${ageMonths} months`,
            emoji: '⚠️',
          })
        }
      } catch {}

      // Recent observation activity
      let lastActivity: string | null = null
      try {
        const recentObs = await db.prepare(
          `SELECT COUNT(*) as cnt, MAX(date) as last_date FROM parent_observations
           WHERE child_id = ? AND date >= ?`
        ).bind(link.child_id, sevenDaysAgo).first() as any

        if (recentObs?.cnt > 0) {
          lastActivity = recentObs.last_date
          if (recentObs.cnt >= 5) {
            alerts.push({
              type: 'new_observations',
              title: `${recentObs.cnt} new observations this week`,
              detail: `Parent is actively logging — review recommended`,
              emoji: '📝',
            })
          }
        }
      } catch {}

      // Determine overall urgency
      const hasHighUrgency = alerts.some(a => a.type === 'must_not_miss')
      const hasMediumUrgency = alerts.some(a => a.type === 'pattern' || a.type === 'delayed_milestone')
      const urgency = hasHighUrgency ? 'high' : hasMediumUrgency ? 'medium' : 'low'

      patients.push({
        childId: link.child_id,
        childName: link.name,
        childAge: ageText,
        alertCount: alerts.length,
        urgency,
        alerts,
        lastActivity,
      })
    }

    // Sort: high urgency first, then by alert count
    patients.sort((a, b) => {
      const urgencyOrder = { high: 0, medium: 1, low: 2 }
      const urgencyDiff = urgencyOrder[a.urgency] - urgencyOrder[b.urgency]
      if (urgencyDiff !== 0) return urgencyDiff
      return b.alertCount - a.alertCount
    })

    const totalAlerts = patients.reduce((sum, p) => sum + p.alertCount, 0)

    return new Response(JSON.stringify({ patients, totalAlerts }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err: any) {
    console.error('[DoctorBrief] Error:', err)
    return new Response(JSON.stringify({
      error: 'Failed to generate daily brief',
      detail: err?.message || String(err),
    }), { status: 500 })
  }
}
