/**
 * POST /api/chat — AI chatbot endpoint
 * Accepts: { message, childId?, conversationId? }
 * Returns: { response, conversationId }
 */

import type { APIRoute } from 'astro'
import { getParentId, verifyChildOwnership } from '@/pages/api/children'
import { detectTopics, getRelevantContent } from '@/lib/ai/context'
import { buildSystemPrompt, type ChildProfile, type ChatContext } from '@/lib/ai/prompt'

export const prerender = false

interface ConversationMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export const POST: APIRoute = async ({ request, locals }) => {
  const env = (locals as any).runtime?.env || {}
  const parentId = await getParentId(request, env)
  if (!parentId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const db = env.DB
  const ai = env.AI
  if (!ai) {
    return new Response(JSON.stringify({ error: 'AI not available' }), { status: 500 })
  }

  let body: { message: string; childId?: string; conversationId?: string }
  try {
    body = await request.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 })
  }

  if (!body.message?.trim()) {
    return new Response(JSON.stringify({ error: 'message is required' }), { status: 400 })
  }

  const userMessage = body.message.trim()

  try {
    // ── 1. Load child profile if childId provided ──
    let childProfile: ChildProfile | undefined
    let childAgeMonths: number | undefined

    if (body.childId && db) {
      // Verify ownership
      const owns = await verifyChildOwnership(parentId, body.childId, db)
      if (!owns) {
        return new Response(JSON.stringify({ error: 'Child not found' }), { status: 404 })
      }

      const child = await db.prepare(
        'SELECT name, dob, gender FROM children WHERE id = ?'
      ).bind(body.childId).first() as any

      if (child) {
        const dob = new Date(child.dob)
        const now = new Date()
        childAgeMonths = (now.getFullYear() - dob.getFullYear()) * 12 + (now.getMonth() - dob.getMonth())
        childProfile = {
          name: child.name,
          ageMonths: childAgeMonths,
          gender: child.gender || undefined,
        }
      }
    }

    // ── 2. Load conversation history ──
    let conversationId = body.conversationId
    let previousMessages: ConversationMessage[] = []

    if (conversationId && db) {
      const conv = await db.prepare(
        'SELECT messages_json FROM chatbot_conversations WHERE id = ? AND parent_id = ?'
      ).bind(conversationId, parentId).first() as any

      if (conv?.messages_json) {
        try {
          previousMessages = JSON.parse(conv.messages_json)
          // Keep last 10 messages for context
          if (previousMessages.length > 10) {
            previousMessages = previousMessages.slice(-10)
          }
        } catch {}
      }
    }

    // ── 3. Detect topics and get relevant content ──
    const topics = detectTopics(userMessage)
    const relevantContent = getRelevantContent(topics, childAgeMonths)

    // ── 4. Load child-specific context ──
    let achievedMilestones: string[] = []
    let recentObservations: string[] = []

    if (body.childId && db) {
      // Get achieved milestones
      try {
        const { results: milestones } = await db.prepare(
          "SELECT title FROM milestones WHERE child_id = ? AND status = 'achieved' ORDER BY updated_at DESC LIMIT 10"
        ).bind(body.childId).all()
        achievedMilestones = (milestones || []).map((m: any) => m.title)
      } catch {}

      // Get recent observations
      try {
        const { results: obs } = await db.prepare(
          'SELECT observation_text, concern_level FROM parent_observations WHERE child_id = ? ORDER BY created_at DESC LIMIT 5'
        ).bind(body.childId).all()
        recentObservations = (obs || []).map((o: any) => {
          const level = o.concern_level !== 'none' ? ` [${o.concern_level}]` : ''
          return `${o.observation_text}${level}`
        })
      } catch {}
    }

    // ── 5. Build system prompt ──
    const chatContext: ChatContext = {
      childProfile,
      relevantContent,
      achievedMilestones: achievedMilestones.length > 0 ? achievedMilestones : undefined,
      recentObservations: recentObservations.length > 0 ? recentObservations : undefined,
    }
    const systemPrompt = buildSystemPrompt(chatContext)

    // ── 6. Build messages array for Workers AI ──
    const aiMessages: { role: string; content: string }[] = [
      { role: 'system', content: systemPrompt },
    ]

    // Add conversation history
    for (const msg of previousMessages) {
      aiMessages.push({ role: msg.role, content: msg.content })
    }

    // Add current user message
    aiMessages.push({ role: 'user', content: userMessage })

    // ── 7. Call Workers AI ──
    const aiResponse = await ai.run('@cf/meta/llama-3.1-8b-instruct', {
      messages: aiMessages,
      max_tokens: 512,
    })

    const responseText = aiResponse.response || 'I apologize, I was unable to generate a response. Please try again.'

    // ── 8. Save conversation ──
    if (db) {
      const newMessages: ConversationMessage[] = [
        ...previousMessages,
        { role: 'user', content: userMessage, timestamp: new Date().toISOString() },
        { role: 'assistant', content: responseText, timestamp: new Date().toISOString() },
      ]
      const messagesJson = JSON.stringify(newMessages)

      if (conversationId) {
        // Update existing conversation
        await db.prepare(
          "UPDATE chatbot_conversations SET messages_json = ?, updated_at = datetime('now') WHERE id = ? AND parent_id = ?"
        ).bind(messagesJson, conversationId, parentId).run()
      } else {
        // Create new conversation
        conversationId = crypto.randomUUID()
        await db.prepare(
          `INSERT INTO chatbot_conversations (id, parent_id, child_id, messages_json, created_at, updated_at)
           VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))`
        ).bind(conversationId, parentId, body.childId || null, messagesJson).run()
      }
    }

    return new Response(
      JSON.stringify({ response: responseText, conversationId }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (err: any) {
    console.error('[Chat] Error:', err)
    return new Response(
      JSON.stringify({ error: 'Failed to generate response', detail: err?.message || String(err) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
