/**
 * POST /api/growth-tracks/chat
 *
 * Growth-track-scoped coaching chat. Answers from the track's playbook only.
 * Distinct from intervention coaching — this is "growing the child" not "treating a condition."
 *
 * Body: { childId, message, trackDomain? }
 */

import type { APIRoute } from 'astro'
import { buildGrowthCoachPrompt } from '@/lib/ai/interventions/coach-prompt'

export const prerender = false

export const POST: APIRoute = async ({ request, locals }) => {
  const runtime = (locals as any).runtime
  const env = runtime?.env || {}
  const db = env.DB
  const ai = env.AI

  if (!db) {
    return new Response(JSON.stringify({ error: 'Database not available' }), { status: 500 })
  }

  // Auth
  const parentId = await getParentId(request, env)
  if (!parentId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const body: any = await request.json()
  const { childId, message, trackDomain } = body

  if (!childId || !message) {
    return new Response(JSON.stringify({ error: 'childId and message required' }), { status: 400 })
  }

  // Get child info
  const child = await db.prepare(
    `SELECT id, name, dob FROM children WHERE id = ? AND parent_id = ?`
  ).bind(childId, parentId).first()

  if (!child) {
    return new Response(JSON.stringify({ error: 'Child not found' }), { status: 404 })
  }

  const dob = new Date(child.dob as string)
  const now = new Date()
  const ageMonths = (now.getFullYear() - dob.getFullYear()) * 12 + (now.getMonth() - dob.getMonth())
  const ageText = ageMonths < 12 ? `${ageMonths} months` :
    `${Math.floor(ageMonths / 12)}y ${ageMonths % 12}mo`

  // Get active tracks
  let trackQuery = `SELECT * FROM growth_tracks
    WHERE age_min_months <= ? AND age_max_months > ? AND is_active = 1`
  const binds: any[] = [ageMonths, ageMonths]

  if (trackDomain) {
    trackQuery += ` AND domain = ?`
    binds.push(trackDomain)
  }

  const tracks = await db.prepare(trackQuery).bind(...binds).all()
  const trackResults = tracks?.results || []

  if (trackResults.length === 0) {
    return new Response(
      JSON.stringify({
        response: "I don't have specific developmental guidance loaded for this age yet. Please discuss your question with your pediatrician.",
        boundaryHit: true,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  }

  // Parse track playbooks
  const parsedTracks = trackResults.map((t: any) => ({
    ...t,
    coachingPlaybook: safeParseJSON(t.coaching_playbook_json) || {},
    parentGuidance: safeParseJSON(t.parent_guidance_json) || {},
    parentalCoping: safeParseJSON(t.parental_coping_json) || {},
    title: t.title,
    whatToExpect: t.what_to_expect,
  }))

  // Build system prompt
  const systemPrompt = buildGrowthCoachPrompt(
    parsedTracks as any[],
    child.name as string,
    ageText
  )

  // Get conversation history (reuse chatbot_conversations or a simple session)
  const conversationKey = `growth_${childId}_${parentId}`
  let previousMessages: any[] = []

  try {
    const conv = await db.prepare(
      `SELECT messages_json FROM chatbot_conversations
       WHERE parent_id = ? AND child_id = ? AND conversation_type = 'growth'
       ORDER BY updated_at DESC LIMIT 1`
    ).bind(parentId, childId).first()

    if (conv?.messages_json) {
      previousMessages = JSON.parse(conv.messages_json as string).slice(-10)
    }
  } catch { /* no previous conversation */ }

  // Call Workers AI
  let aiResponse = "I'm here to help! Could you tell me more about what you're experiencing?"

  if (ai) {
    try {
      const aiMessages = [
        { role: 'system', content: systemPrompt },
        ...previousMessages,
        { role: 'user', content: message },
      ]

      const result: any = await ai.run('@cf/meta/llama-3.1-8b-instruct', {
        messages: aiMessages,
        max_tokens: 512,
      })

      if (result?.response) {
        aiResponse = result.response
      }
    } catch (err) {
      console.error('[GrowthChat] AI error:', err)
    }
  }

  // Check if boundary was hit (AI mentions "pediatrician" or "doctor" in redirect context)
  const boundaryHit = aiResponse.toLowerCase().includes('pediatrician') &&
    (aiResponse.toLowerCase().includes('discuss') || aiResponse.toLowerCase().includes('beyond'))

  // Update engagement
  try {
    for (const track of trackResults as any[]) {
      await db.prepare(
        `INSERT INTO growth_track_progress (id, child_id, track_id, coach_sessions, started_at, updated_at)
         VALUES (?, ?, ?, 1, datetime('now'), datetime('now'))
         ON CONFLICT(child_id, track_id) DO UPDATE SET
           coach_sessions = coach_sessions + 1,
           updated_at = datetime('now')`
      ).bind(`gtp_${childId}_${track.id}`, childId, track.id).run()
    }
  } catch { /* non-critical */ }

  return new Response(
    JSON.stringify({
      response: aiResponse,
      boundaryHit,
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
