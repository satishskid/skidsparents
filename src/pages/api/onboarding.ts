/**
 * POST /api/onboarding — Life Record conversational onboarding
 * GET  /api/onboarding?childId=xxx — Get current onboarding state
 *
 * Instead of a 50-field form, the AI walks the parent through a warm
 * conversation — period by period — from birth to present, extracting
 * structured life record data from natural language.
 *
 * Flow:
 *   1. Client calls GET to get current state (or POST with action: 'start')
 *   2. Client shows the AI's question to the parent
 *   3. Parent types a natural answer
 *   4. Client POSTs the answer
 *   5. AI responds warmly + extracts structured data
 *   6. Data is persisted to life record tables
 *   7. Next question is returned
 *   8. Repeat until onboarding complete
 */

import type { APIRoute } from 'astro'
import { getParentId, verifyChildOwnership } from './children'
import {
  createOnboardingState,
  getCurrentQuestion,
  advanceState,
  shouldTriggerFollowUp,
  buildOnboardingSystemPrompt,
  parseExtractedData,
  persistExtractedData,
  getPhasesForChild,
  type OnboardingState,
} from '../../lib/ai/life-record/onboarding'

export const prerender = false

// ── GET: Retrieve onboarding state ──

export const GET: APIRoute = async ({ request, locals }) => {
  const env = (locals as any).runtime?.env || {}
  const parentId = await getParentId(request, env)
  if (!parentId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const url = new URL(request.url)
  const childId = url.searchParams.get('childId')
  if (!childId) {
    return new Response(JSON.stringify({ error: 'childId required' }), { status: 400 })
  }

  const owns = await verifyChildOwnership(parentId, childId, env.DB)
  if (!owns) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 })
  }

  try {
    // Check for existing onboarding state in chatbot_conversations
    const conv = await env.DB.prepare(
      "SELECT id, messages_json FROM chatbot_conversations WHERE child_id = ? AND parent_id = ? AND id LIKE 'onboard_%' ORDER BY updated_at DESC LIMIT 1"
    ).bind(childId, parentId).first()

    if (conv) {
      const state = JSON.parse((conv as any).messages_json) as OnboardingState
      const current = getCurrentQuestion(state)

      return new Response(JSON.stringify({
        state: {
          completionPercent: state.completionPercent,
          currentPhase: state.currentPhase,
          completedPhases: state.completedPhases,
          isComplete: current === null,
        },
        nextQuestion: current ? {
          phaseId: current.phase.id,
          phaseName: current.phase.name,
          phaseIntro: current.phase.intro.replace(/{name}/g, state.childName),
          questionId: current.question.id,
          question: current.question.question.replace(/{name}/g, state.childName),
          required: current.question.required,
          domain: current.question.domain,
        } : null,
        conversationId: (conv as any).id,
      }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // No onboarding started yet
    return new Response(JSON.stringify({
      state: null,
      message: 'Onboarding not started. POST with action: "start" to begin.',
    }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err: any) {
    console.error('[Onboarding] GET error:', err)
    return new Response(JSON.stringify({ error: 'Failed to get onboarding state' }), { status: 500 })
  }
}

// ── POST: Start onboarding or answer a question ──

export const POST: APIRoute = async ({ request, locals }) => {
  const env = (locals as any).runtime?.env || {}
  const parentId = await getParentId(request, env)
  if (!parentId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const body = await request.json() as {
    childId: string
    action: 'start' | 'answer' | 'skip'
    answer?: string
    conversationId?: string
  }

  if (!body.childId) {
    return new Response(JSON.stringify({ error: 'childId required' }), { status: 400 })
  }

  const owns = await verifyChildOwnership(parentId, body.childId, env.DB)
  if (!owns) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 })
  }

  const db = env.DB
  const ai = env.AI

  try {
    // ── START: Initialize onboarding ──
    if (body.action === 'start') {
      const child = await db.prepare('SELECT name, dob FROM children WHERE id = ?').bind(body.childId).first()
      if (!child) {
        return new Response(JSON.stringify({ error: 'Child not found' }), { status: 404 })
      }

      const dob = new Date((child as any).dob)
      const now = new Date()
      const ageMonths = Math.floor((now.getTime() - dob.getTime()) / (1000 * 60 * 60 * 24 * 30.44))
      const childName = (child as any).name

      const state = createOnboardingState(body.childId, childName, ageMonths)
      const current = getCurrentQuestion(state)

      if (!current) {
        return new Response(JSON.stringify({ error: 'No questions applicable' }), { status: 400 })
      }

      // Build the opening message
      const phases = getPhasesForChild(ageMonths)
      const totalPhases = phases.length
      const greeting = `Hi! I'm Dr. SKIDS, and I'm going to help you set up ${childName}'s health life record. 🩺\n\nThis will take about ${totalPhases * 2} minutes — I'll ask some simple questions about ${childName}'s journey from birth to now. Your answers help us give personalized health guidance.\n\nYou can skip any question you're unsure about. Ready? Let's start!\n\n${current.phase.intro.replace(/{name}/g, childName)}`

      state.conversationHistory = [
        { role: 'assistant', content: greeting },
      ]

      // Save state
      const conversationId = `onboard_${crypto.randomUUID()}`
      await db.prepare(
        `INSERT INTO chatbot_conversations (id, parent_id, child_id, messages_json, created_at, updated_at)
         VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))`
      ).bind(conversationId, parentId, body.childId, JSON.stringify(state)).run()

      return new Response(JSON.stringify({
        conversationId,
        aiMessage: greeting,
        nextQuestion: {
          phaseId: current.phase.id,
          phaseName: current.phase.name,
          questionId: current.question.id,
          question: current.question.question.replace(/{name}/g, childName),
          required: current.question.required,
          domain: current.question.domain,
        },
        state: {
          completionPercent: 0,
          totalPhases,
          currentPhase: 0,
          isComplete: false,
        },
      }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // ── ANSWER or SKIP: Process parent's response ──
    if (body.action === 'answer' || body.action === 'skip') {
      if (!body.conversationId) {
        return new Response(JSON.stringify({ error: 'conversationId required' }), { status: 400 })
      }
      if (body.action === 'answer' && !body.answer?.trim()) {
        return new Response(JSON.stringify({ error: 'answer required for action: answer' }), { status: 400 })
      }

      // Load state
      const conv = await db.prepare(
        'SELECT messages_json FROM chatbot_conversations WHERE id = ? AND parent_id = ?'
      ).bind(body.conversationId, parentId).first()

      if (!conv) {
        return new Response(JSON.stringify({ error: 'Onboarding session not found' }), { status: 404 })
      }

      let state = JSON.parse((conv as any).messages_json) as OnboardingState
      const current = getCurrentQuestion(state)

      if (!current) {
        return new Response(JSON.stringify({
          aiMessage: `${state.childName}'s life record is all set! 🎉 You've given us a great foundation. The more you use SKIDS, the smarter it gets.`,
          state: { completionPercent: 100, isComplete: true },
        }), { headers: { 'Content-Type': 'application/json' } })
      }

      let aiMessage: string
      let extractedData: Record<string, any> = {}

      if (body.action === 'skip') {
        // Skip this question
        aiMessage = "No problem, we can always come back to this later! Let's move on."
        state = advanceState(state, current.question.id, '[skipped]', {})
      } else {
        const parentAnswer = body.answer!.trim()

        // Add parent's answer to conversation history
        state.conversationHistory.push({ role: 'user', content: parentAnswer })

        // Check for follow-ups
        const followUp = current.question.followUps
          ? shouldTriggerFollowUp(parentAnswer, current.question.followUps)
          : null

        if (ai) {
          // Call AI for warm response + extraction
          const systemPrompt = buildOnboardingSystemPrompt(
            state.childName,
            state.childAgeMonths,
            current.phase,
            current.question,
            state.conversationHistory,
            state.extractedData
          )

          const aiMessages = [
            { role: 'system', content: systemPrompt },
            ...state.conversationHistory.slice(-6).map((m) => ({ role: m.role, content: m.content })),
          ]

          try {
            const aiResult = await ai.run('@cf/meta/llama-3.1-8b-instruct', {
              messages: aiMessages,
              max_tokens: 400,
            })

            const parsed = parseExtractedData(aiResult.response || '')
            aiMessage = parsed.conversationalResponse || "Thank you! Let me note that down."
            extractedData = parsed.extractedData
          } catch (aiErr) {
            console.error('[Onboarding] AI error:', aiErr)
            aiMessage = "Got it, thank you! Let me note that down."
          }
        } else {
          // No AI available — use basic response
          aiMessage = "Thank you! Let me note that down."
        }

        // Persist extracted data to DB
        if (Object.keys(extractedData).length > 0) {
          try {
            await persistExtractedData(db, state.childId, extractedData)
          } catch (persistErr) {
            console.error('[Onboarding] Persist error (non-blocking):', persistErr)
          }
        }

        // Advance state
        state = advanceState(state, current.question.id, parentAnswer, extractedData)

        // If there's a follow-up, prepend it
        if (followUp) {
          const followUpQ = followUp.question.replace(/{name}/g, state.childName)
          aiMessage += `\n\n${followUpQ}`
        }
      }

      // Get next question
      const next = getCurrentQuestion(state)
      let nextQuestion = null

      if (next) {
        // Check if we're entering a new phase
        const isNewPhase = next.phase.id !== current.phase.id
        if (isNewPhase) {
          const phaseIntro = next.phase.intro.replace(/{name}/g, state.childName)
          aiMessage += `\n\n${phaseIntro}`
        }

        nextQuestion = {
          phaseId: next.phase.id,
          phaseName: next.phase.name,
          questionId: next.question.id,
          question: next.question.question.replace(/{name}/g, state.childName),
          required: next.question.required,
          domain: next.question.domain,
        }
      } else {
        // Onboarding complete!
        state.completionPercent = 100
        aiMessage += `\n\n🎉 That's everything! ${state.childName}'s life record is now set up. The more you share observations going forward, the smarter the system gets at spotting what matters for ${state.childName}.`
      }

      // Save AI response to conversation
      state.conversationHistory.push({ role: 'assistant', content: aiMessage })

      // Persist state
      await db.prepare(
        "UPDATE chatbot_conversations SET messages_json = ?, updated_at = datetime('now') WHERE id = ?"
      ).bind(JSON.stringify(state), body.conversationId).run()

      return new Response(JSON.stringify({
        conversationId: body.conversationId,
        aiMessage,
        nextQuestion,
        extractedData: Object.keys(extractedData).length > 0 ? extractedData : undefined,
        state: {
          completionPercent: state.completionPercent,
          completedPhases: state.completedPhases,
          currentPhase: state.currentPhase,
          isComplete: next === null,
        },
      }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ error: 'action must be start, answer, or skip' }), { status: 400 })
  } catch (err: any) {
    console.error('[Onboarding] Error:', err)
    return new Response(JSON.stringify({ error: 'Onboarding error', detail: err?.message }), { status: 500 })
  }
}
