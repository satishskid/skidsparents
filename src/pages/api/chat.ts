/**
 * POST /api/chat — AI chatbot endpoint
 * Accepts: { message, childId?, conversationId? }
 * Returns: { response, conversationId }
 */

import type { APIRoute } from 'astro'
import { getParentId, verifyChildOwnership } from '@/pages/api/children'
import { detectTopics, getRelevantContent } from '@/lib/ai/context'
import { buildSystemPrompt, type ChildProfile, type ChatContext } from '@/lib/ai/prompt'
import { isPremiumParent, checkRateLimit, routeToModel, type AIMessage } from '@/lib/ai/router'
import { getEnv } from '@/lib/runtime/env'

export const prerender = false

interface ConversationMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export const POST: APIRoute = async ({ request, locals }) => {
  const env = getEnv(locals)
  const parentId = await getParentId(request, env)
  if (!parentId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const db = env.DB
  const ai = env.AI

  // ── Determine tier + rate limit ──
  const kv = env.KV
  const premium = await isPremiumParent(parentId, db)
  const tier = premium ? 'premium' : 'free'

  const { allowed, remaining } = await checkRateLimit(parentId, tier, kv)
  if (!allowed) {
    const msg = premium
      ? 'You\'ve reached the premium limit of 60 questions per minute. Please wait a moment.'
      : 'You\'ve reached the free limit of 20 questions per minute. Upgrade to premium for higher limits.'
    return new Response(
      JSON.stringify({ error: msg, upgradeAvailable: !premium }),
      { status: 429, headers: { 'Content-Type': 'application/json', 'X-RateLimit-Remaining': '0' } }
    )
  }

  let body: { message: string; childId?: string; conversationId?: string; mode?: 'onboarding' | 'standard' }
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

      interface ChildRow { name: string; dob: string; gender: string | null }
      const child = await db.prepare(
        'SELECT name, dob, gender FROM children WHERE id = ?'
      ).bind(body.childId).first<ChildRow>()

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
      interface ConvRow { messages_json: string }
      const conv = await db.prepare(
        'SELECT messages_json FROM chatbot_conversations WHERE id = ? AND parent_id = ?'
      ).bind(conversationId, parentId).first<ConvRow>()

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

    // Load vaccination history
    let vaccinationHistory: string[] = []
    if (body.childId && db) {
      try {
        const { results: vax } = await db.prepare(
          'SELECT vaccine_name, administered_date FROM vaccination_records WHERE child_id = ? ORDER BY administered_date DESC LIMIT 5'
        ).bind(body.childId).all()
        vaccinationHistory = (vax || []).map((v: any) => `${v.vaccine_name}${v.administered_date ? ` on ${v.administered_date}` : ''}`)
      } catch {}
    }

    // Load latest growth record
    let latestGrowth: { height?: number; weight?: number; date?: string } | undefined
    if (body.childId && db) {
      try {
        interface GrowthRow { height_cm: number | null; weight_kg: number | null; date: string | null }
        const growth = await db.prepare(
          'SELECT height_cm, weight_kg, date FROM growth_records WHERE child_id = ? ORDER BY date DESC LIMIT 1'
        ).bind(body.childId).first<GrowthRow>()
        if (growth) {
          latestGrowth = {
            height: growth.height_cm ?? undefined,
            weight: growth.weight_kg ?? undefined,
            date: growth.date ?? undefined,
          }
        }
      } catch {}
    }

    // ── 5. Build system prompt ──
    const chatContext: ChatContext = {
      childProfile,
      relevantContent,
      achievedMilestones: achievedMilestones.length > 0 ? achievedMilestones : undefined,
      recentObservations: recentObservations.length > 0 ? recentObservations : undefined,
      vaccinationHistory: vaccinationHistory.length > 0 ? vaccinationHistory : undefined,
      latestGrowth,
      mode: body.mode,
    }
    const systemPrompt = buildSystemPrompt(chatContext)

    // ── 6. Build messages array ──
    const aiMessages: AIMessage[] = [
      { role: 'system', content: systemPrompt },
      ...previousMessages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      { role: 'user', content: userMessage },
    ]

    // ── 7. Route to appropriate model based on tier ──
    let aiResult: { text: string; model: string; tier: string }
    try {
      aiResult = await routeToModel(aiMessages, tier, env)
    } catch (modelErr) {
      console.error('[Chat] All models failed:', modelErr)
      return new Response(
        JSON.stringify({ response: "I'm having a moment — please try again in a few seconds. If this keeps happening, you can reach us on WhatsApp.", conversationId }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const responseText = aiResult.text || 'I apologize, I was unable to generate a response. Please try again.'

    // During onboarding, save each parent message as a health observation
    if (body.mode === 'onboarding' && body.childId && db && userMessage.length > 5) {
      try {
        await db.prepare(
          `INSERT INTO parent_observations (id, child_id, date, category, observation_text, concern_level, created_at)
           VALUES (?, ?, date('now'), 'Health', ?, 'none', datetime('now'))`
        ).bind(crypto.randomUUID(), body.childId, userMessage).run()
      } catch {}
    }

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
      JSON.stringify({ response: responseText, conversationId, model: aiResult.model, tier: aiResult.tier }),
      { status: 200, headers: { 'Content-Type': 'application/json', 'X-RateLimit-Remaining': String(remaining) } }
    )
  } catch (e: unknown) {
    console.error('[Chat] Error:', e)
    const message = e instanceof Error ? e.message : String(e)
    return new Response(
      JSON.stringify({ error: 'Failed to generate response', detail: message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
