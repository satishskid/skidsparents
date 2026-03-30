/**
 * POST /api/chat-public — Unauthenticated AI chatbot endpoint
 * Provides general (non-personalized) answers to child health questions.
 * Rate-limited by IP address (5 requests per hour per IP).
 * Accepts: { message }
 * Returns: { response }
 */

import type { APIRoute } from 'astro'
import { detectTopics, getRelevantContent } from '@/lib/ai/context'
import { buildSystemPrompt } from '@/lib/ai/prompt'
import { routeToModel, type AIMessage } from '@/lib/ai/router'
import { getEnv } from '@/lib/runtime/env'

export const prerender = false

// Rate limit: 5 requests per hour per IP for unauthenticated users
const PUBLIC_RATE_LIMIT = 5
const PUBLIC_RATE_TTL = 3600 // 1 hour in seconds

async function checkPublicRateLimit(
  ip: string,
  kv: any
): Promise<{ allowed: boolean; remaining: number }> {
  if (!kv) return { allowed: true, remaining: PUBLIC_RATE_LIMIT }

  const key = `chat_public:${ip}`
  try {
    const current = await kv.get(key)
    const count = current ? parseInt(current, 10) : 0
    if (count >= PUBLIC_RATE_LIMIT) {
      return { allowed: false, remaining: 0 }
    }
    await kv.put(key, String(count + 1), { expirationTtl: PUBLIC_RATE_TTL })
    return { allowed: true, remaining: PUBLIC_RATE_LIMIT - count - 1 }
  } catch {
    // KV failure — allow through
    return { allowed: true, remaining: PUBLIC_RATE_LIMIT }
  }
}

export const POST: APIRoute = async ({ request, locals }) => {
  const env = getEnv(locals)

  // Get client IP for rate limiting
  const ip =
    request.headers.get('CF-Connecting-IP') ||
    request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim() ||
    'unknown'

  const kv = env.KV
  const { allowed, remaining } = await checkPublicRateLimit(ip, kv)

  if (!allowed) {
    return new Response(
      JSON.stringify({
        error: 'You\'ve asked a lot of questions! Sign in to get unlimited personalised answers.',
        limitReached: true,
      }),
      {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }

  let body: { message: string }
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
    // Detect topics and get relevant content (no child profile — general answers only)
    const topics = detectTopics(userMessage)
    const relevantContent = getRelevantContent(topics, undefined)

    // Build system prompt without child context
    const systemPrompt = buildSystemPrompt({ relevantContent })

    const aiMessages: AIMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ]

    // Always use free tier model for public endpoint
    let aiResult: { text: string; model: string; tier: string }
    try {
      aiResult = await routeToModel(aiMessages, 'free', env)
    } catch (modelErr) {
      console.error('[Chat Public] Model routing failed:', modelErr)
      return new Response(
        JSON.stringify({
          response:
            "Dr. SKIDS AI service is temporarily unavailable. Please try again shortly.",
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const responseText =
      aiResult.text || 'I wasn\'t able to respond. Please try again.'

    return new Response(
      JSON.stringify({ response: responseText }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Remaining': String(remaining),
        },
      }
    )
  } catch (e: unknown) {
    console.error('[Chat Public] Error:', e)
    const message = e instanceof Error ? e.message : String(e)
    return new Response(
      JSON.stringify({ error: 'Failed to generate response', detail: message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
