/**
 * POST /api/interventions/chat
 *
 * Protocol-scoped coaching chat. Answers ONLY from the intervention playbook.
 * Body: { assignmentId, message, childId }
 */

import type { APIRoute } from 'astro'
import { buildInterventionCoachPrompt } from '@/lib/ai/interventions/coach-prompt'
import { getDayNumber } from '@/lib/ai/interventions/task-generator'

export const prerender = false

export const POST: APIRoute = async ({ request, locals }) => {
  const runtime = (locals as any).runtime
  const env = runtime?.env || {}
  const db = env.DB
  const ai = env.AI

  if (!db) return jsonError('Database not available', 500)

  const parentId = await getParentId(request, env)
  if (!parentId) return jsonError('Unauthorized', 401)

  const body: any = await request.json()
  const { assignmentId, message, childId } = body

  if (!assignmentId || !message || !childId) {
    return jsonError('assignmentId, message, and childId required', 400)
  }

  // Get assignment + protocol
  const assignment = await db.prepare(
    `SELECT ia.*, ip.name as protocol_name, ip.coaching_playbook_json,
            ip.escalation_rules_json, ip.description as protocol_description,
            ip.evidence_base, ip.protocol_authority, ip.default_duration_days,
            ip.dietary_context, ip.genetic_considerations,
            d.name as doctor_name
     FROM intervention_assignments ia
     JOIN intervention_protocols ip ON ip.id = ia.intervention_protocol_id
     LEFT JOIN doctors d ON d.id = ia.doctor_id
     WHERE ia.id = ? AND ia.child_id = ?`
  ).bind(assignmentId, childId).first()

  if (!assignment) return jsonError('Assignment not found', 404)

  // Verify child ownership
  const child = await db.prepare(
    `SELECT id, name, dob FROM children WHERE id = ? AND parent_id = ?`
  ).bind(childId, parentId).first()
  if (!child) return jsonError('Child not found', 404)

  const dob = new Date(child.dob as string)
  const now = new Date()
  const ageMonths = (now.getFullYear() - dob.getFullYear()) * 12 + (now.getMonth() - dob.getMonth())
  const ageText = ageMonths < 12 ? `${ageMonths} months` :
    `${Math.floor(ageMonths / 12)}y ${ageMonths % 12}mo`

  // Get recent tasks
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const recentTasks = await db.prepare(
    `SELECT * FROM intervention_tasks
     WHERE assignment_id = ? AND task_date >= ?
     ORDER BY task_date DESC`
  ).bind(assignmentId, sevenDaysAgo.toISOString().split('T')[0]).all()

  // Get streak
  const streak = await db.prepare(
    `SELECT * FROM intervention_streaks WHERE assignment_id = ?`
  ).bind(assignmentId).first()

  // Get/create chat session
  let chatSession = await db.prepare(
    `SELECT * FROM intervention_chat_sessions
     WHERE assignment_id = ? AND parent_id = ?
     ORDER BY updated_at DESC LIMIT 1`
  ).bind(assignmentId, parentId).first()

  let previousMessages: any[] = []
  let chatSessionId: string

  if (chatSession) {
    chatSessionId = chatSession.id as string
    previousMessages = safeParseJSON(chatSession.messages_json) || []
  } else {
    chatSessionId = generateId()
    await db.prepare(
      `INSERT INTO intervention_chat_sessions
       (id, assignment_id, parent_id, child_id, messages_json, boundary_hits)
       VALUES (?, ?, ?, ?, '[]', 0)`
    ).bind(chatSessionId, assignmentId, parentId, childId).run()
  }

  // Build protocol-bound system prompt
  const dayNumber = getDayNumber(
    assignment.start_date as string,
    now.toISOString().split('T')[0]
  )

  const systemPrompt = buildInterventionCoachPrompt(
    {
      name: assignment.protocol_name,
      description: assignment.protocol_description,
      evidenceBase: assignment.evidence_base,
      protocolAuthority: assignment.protocol_authority,
      defaultDurationDays: assignment.default_duration_days,
      coachingPlaybook: safeParseJSON(assignment.coaching_playbook_json) || {},
      dietaryContext: assignment.dietary_context,
      geneticConsiderations: assignment.genetic_considerations,
    } as any,
    {
      id: assignmentId,
      customParams: safeParseJSON(assignment.custom_params_json) || {},
      childEthnicOrigin: assignment.child_ethnic_origin,
    } as any,
    child.name as string,
    ageText,
    (assignment.doctor_name as string) || 'your doctor',
    (recentTasks?.results || []) as any[],
    streak as any,
    dayNumber
  )

  // Call Workers AI
  let aiResponse = "I'm here to help with your intervention. What would you like to know?"

  if (ai) {
    try {
      const aiMessages = [
        { role: 'system', content: systemPrompt },
        ...previousMessages.slice(-10),
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
      console.error('[InterventionChat] AI error:', err)
    }
  }

  // Detect boundary hit
  const responseLower = aiResponse.toLowerCase()
  const boundaryHit = (
    (responseLower.includes('doctor') || responseLower.includes('pediatrician')) &&
    (responseLower.includes('discuss') || responseLower.includes('beyond') ||
     responseLower.includes('flagging') || responseLower.includes('contact'))
  )

  // Update chat session
  const newMessages = [
    ...previousMessages,
    { role: 'user', content: message, timestamp: now.toISOString() },
    { role: 'assistant', content: aiResponse, timestamp: now.toISOString(), boundaryHit },
  ]

  const newBoundaryHits = (chatSession?.boundary_hits as number || 0) + (boundaryHit ? 1 : 0)

  await db.prepare(
    `UPDATE intervention_chat_sessions SET
       messages_json = ?, boundary_hits = ?, updated_at = datetime('now')
     WHERE id = ?`
  ).bind(JSON.stringify(newMessages), newBoundaryHits, chatSessionId).run()

  return new Response(
    JSON.stringify({
      response: aiResponse,
      boundaryHit,
      conversationId: chatSessionId,
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  )
}

function safeParseJSON(str: any): any {
  if (!str) return null
  try { return JSON.parse(str) } catch { return str }
}

function generateId(): string {
  const hex = () => Math.random().toString(16).substring(2, 10)
  return `${hex()}${hex()}`
}

function jsonError(message: string, status: number) {
  return new Response(JSON.stringify({ error: message }), {
    status, headers: { 'Content-Type': 'application/json' },
  })
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
  } catch { return null }
}
