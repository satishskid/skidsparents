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
import { extractObservationFromChat } from '@/lib/ai/observation-extractor'
import { buildLifeRecordContext } from '@/lib/ai/life-record/context-builder'
import { projectObservation, getParentSummary } from '@/lib/ai/life-record/probability-engine'

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
    const limit = tier === 'premium' ? 100 : 20
    const msg = tier === 'premium'
      ? `You've used all ${limit} of your premium questions today. Your quota resets at midnight IST.`
      : `You've used all ${limit} of your free questions today. Your quota resets at midnight IST.`
    return new Response(
      JSON.stringify({ error: msg, upgradeAvailable: tier !== 'premium', dailyLimit: limit }),
      { status: 429, headers: { 'Content-Type': 'application/json', 'X-RateLimit-Remaining': '0' } }
    )
  }

  let body: { message: string; childId?: string; conversationId?: string; mode?: 'onboarding' | 'standard'; insightContext?: string }
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
    let systemPrompt = buildSystemPrompt(chatContext)

    // Enrich with insight context if parent came from a daily insight card
    if (body.insightContext) {
      systemPrompt += `\n\nCONTEXT: The parent just read a daily insight about their child and wants to learn more. The insight was: "${body.insightContext}". Continue this topic naturally and provide helpful, personalized guidance based on the child's life record. Answer from your knowledge, NOT from internet search.`
    }

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
      console.error('[Chat] Model routing failed:', modelErr)
      const errorMsg = modelErr instanceof Error && modelErr.message === 'No AI runtime available'
        ? "Dr. SKIDS AI service is temporarily unavailable. Please try again shortly or contact support."
        : "I'm having a moment — please try again in a few seconds. If this keeps happening, you can reach us on WhatsApp."
      return new Response(
        JSON.stringify({ response: errorMsg, conversationId }),
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

    // ═══════════════════════════════════════════════════════
    // PASSIVE OBSERVATION EXTRACTION
    // If the parent's chat message contains an observation about
    // their child, silently extract and save it to the life record.
    // The parent never sees "observation saved" — invisible enrichment.
    // ═══════════════════════════════════════════════════════
    let passiveObservation = null
    if (body.childId && childAgeMonths !== undefined && db) {
      try {
        const extraction = extractObservationFromChat(userMessage, childAgeMonths)
        if (extraction && extraction.confidence >= 0.5) {
          // Save as passive observation
          const obsId = crypto.randomUUID()
          await db.prepare(
            `INSERT INTO parent_observations (id, child_id, date, category, observation_text, concern_level, source, created_at)
             VALUES (?, ?, ?, ?, ?, ?, 'passive', datetime('now'))`
          ).bind(
            obsId,
            body.childId,
            new Date().toISOString().split('T')[0],
            extraction.category,
            extraction.observationText,
            extraction.concernLevel
          ).run()

          // Fire projection in background (non-blocking)
          try {
            const lifeRecord = await buildLifeRecordContext(body.childId, db)
            const projResult = projectObservation(extraction.observationText, lifeRecord, obsId)

            // Store projection result
            const projResultId = crypto.randomUUID()
            await db.prepare(
              `INSERT INTO projection_results (id, observation_id, child_id, observation_text, child_age_months, projections_count, domains_detected_json, clarifying_questions_json, confidence, computed_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
            ).bind(
              projResultId, obsId, body.childId, extraction.observationText,
              childAgeMonths, projResult.projections.length,
              JSON.stringify(projResult.domainsDetected),
              JSON.stringify(projResult.clarifyingQuestions),
              projResult.confidence, projResult.computedAt
            ).run()

            for (const proj of projResult.projections) {
              await db.prepare(
                `INSERT INTO observation_projections (id, observation_id, child_id, observation_text, condition_name, icd10, domain, category, base_probability, adjusted_probability, urgency, must_not_miss, parent_explanation, modifiers_json, evidence_for_json, evidence_against_json, parent_next_steps_json, doctor_exam_points_json, rule_out_before_json, citation, doctor_status, confidence)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
              ).bind(
                crypto.randomUUID(), obsId, body.childId, extraction.observationText,
                proj.conditionName, proj.icd10 || null, proj.domain, proj.category,
                proj.baseProbability, proj.adjustedProbability, proj.urgency,
                proj.mustNotMiss ? 1 : 0, proj.parentExplanation,
                JSON.stringify(proj.modifiersApplied), JSON.stringify(proj.evidenceFor),
                JSON.stringify(proj.evidenceAgainst), JSON.stringify(proj.parentNextSteps),
                JSON.stringify(proj.doctorExamPoints), JSON.stringify(proj.ruleOutBefore),
                proj.citation || null, 'projected', projResult.confidence
              ).run()
            }
          } catch (projErr) {
            // Projection failure is non-blocking
            console.error('[Chat] Passive projection error (non-blocking):', projErr)
          }

          passiveObservation = {
            id: obsId,
            domain: extraction.domain,
            confidence: extraction.confidence,
          }
        }
      } catch (extractErr) {
        // Extraction failure is always non-blocking
        console.error('[Chat] Passive extraction error (non-blocking):', extractErr)
      }
    }

    return new Response(
      JSON.stringify({
        response: responseText,
        conversationId,
        model: aiResult.model,
        tier: aiResult.tier,
        dailyLimit: tier === 'premium' ? 100 : 20,
        _passiveObservation: passiveObservation,
      }),
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
