/**
 * GET /api/growth-tracks/active?childId=xxx
 *
 * Returns active growth tracks for a child's current age.
 * Growth tracks are universal — every child gets them, automatically
 * activated by age period. No doctor prescription needed.
 */

import type { APIRoute } from 'astro'

export const prerender = false

export const GET: APIRoute = async ({ request, locals }) => {
  const runtime = (locals as any).runtime
  const env = runtime?.env || {}
  const db = env.DB

  if (!db) {
    return new Response(JSON.stringify({ error: 'Database not available' }), { status: 500 })
  }

  // Auth
  const parentId = await getParentId(request, env)
  if (!parentId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const url = new URL(request.url)
  const childId = url.searchParams.get('childId')
  if (!childId) {
    return new Response(JSON.stringify({ error: 'childId required' }), { status: 400 })
  }

  // Verify ownership
  const child = await db.prepare(
    `SELECT id, dob FROM children WHERE id = ? AND parent_id = ?`
  ).bind(childId, parentId).first()

  if (!child) {
    return new Response(JSON.stringify({ error: 'Child not found' }), { status: 404 })
  }

  // Calculate age in months
  const dob = new Date(child.dob as string)
  const now = new Date()
  const ageMonths = (now.getFullYear() - dob.getFullYear()) * 12 + (now.getMonth() - dob.getMonth())

  // Get active tracks for this age
  const tracks = await db.prepare(
    `SELECT * FROM growth_tracks
     WHERE age_min_months <= ? AND age_max_months > ? AND is_active = 1
     ORDER BY domain`
  ).bind(ageMonths, ageMonths).all()

  // Get progress for these tracks
  const trackIds = (tracks?.results || []).map((t: any) => t.id)
  let progress: any[] = []

  if (trackIds.length > 0) {
    const placeholders = trackIds.map(() => '?').join(',')
    const progressResult = await db.prepare(
      `SELECT * FROM growth_track_progress
       WHERE child_id = ? AND track_id IN (${placeholders})`
    ).bind(childId, ...trackIds).all()
    progress = progressResult?.results || []
  }

  // Merge tracks with progress
  const tracksWithProgress = (tracks?.results || []).map((track: any) => {
    const prog = progress.find((p: any) => p.track_id === track.id)
    return {
      ...track,
      parent_guidance_json: safeParseJSON(track.parent_guidance_json),
      coaching_playbook_json: safeParseJSON(track.coaching_playbook_json),
      milestones_json: safeParseJSON(track.milestones_json),
      red_flags_json: safeParseJSON(track.red_flags_json),
      parental_coping_json: safeParseJSON(track.parental_coping_json),
      progress: prog ? {
        status: prog.status,
        parentEngagementScore: prog.parent_engagement_score,
        insightsViewed: prog.insights_viewed,
        coachSessions: prog.coach_sessions,
        flaggedForPed: prog.flagged_for_ped,
      } : null,
    }
  })

  return new Response(
    JSON.stringify({
      tracks: tracksWithProgress,
      childAgeMonths: ageMonths,
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  )
}

function safeParseJSON(str: any): any {
  if (!str) return null
  try { return JSON.parse(str) } catch { return str }
}

async function getParentId(request: Request, env: any): Promise<string | null> {
  const auth = request.headers.get('Authorization')
  if (!auth?.startsWith('Bearer ')) return null
  const token = auth.substring(7)

  try {
    // Verify Firebase token
    const verifyUrl = `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${env.FIREBASE_API_KEY}`
    const res = await fetch(verifyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken: token }),
    })
    if (!res.ok) return null
    const data: any = await res.json()
    const uid = data?.users?.[0]?.localId
    if (!uid) return null

    const parent = await env.DB.prepare(
      'SELECT id FROM parents WHERE firebase_uid = ?'
    ).bind(uid).first()
    return parent?.id || null
  } catch {
    return null
  }
}
