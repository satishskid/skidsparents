/**
 * AI model router for SKIDS Guide chat.
 *
 * Tier logic:
 *   free    → Workers AI (llama-3.1-8b) — 20 req/min
 *   premium → Gemini 1.5 Flash (preferred) or Claude 3 Haiku — 60 req/min
 *
 * Premium is determined by an active subscription in the DB.
 * Provider preference: if GEMINI_API_KEY is set, use Gemini; else Claude; else fall back to free.
 */

import { runWorkersAI, runGemini, runGroq, runClaude, type AIMessage, type AIResponse } from './providers'

export type { AIMessage, AIResponse }

// Rate limits per tier (requests per day)
const RATE_LIMITS: Record<string, number> = {
  free: 20,
  premium: 100,
}

/**
 * Check if a parent has an active premium subscription.
 */
export async function isPremiumParent(parentId: string, db: any): Promise<boolean> {
  if (!db) return false
  try {
    const sub = await db.prepare(
      "SELECT id FROM subscriptions WHERE parent_id = ? AND status = 'active' AND (expires_at IS NULL OR expires_at > datetime('now')) LIMIT 1"
    ).bind(parentId).first()
    return !!sub
  } catch {
    return false
  }
}

/**
 * Apply rate limiting via KV. Returns true if request is allowed.
 */
export async function checkRateLimit(
  parentId: string,
  tier: string,
  kv: any
): Promise<{ allowed: boolean; remaining: number }> {
  if (!kv) return { allowed: true, remaining: 999 }

  const limit = RATE_LIMITS[tier] ?? RATE_LIMITS.free
  const key = `chat_daily:${tier}:${parentId}`

  try {
    const current = await kv.get(key)
    const count = current ? parseInt(current, 10) : 0
    if (count >= limit) {
      return { allowed: false, remaining: 0 }
    }
    await kv.put(key, String(count + 1), { expirationTtl: 86400 })
    return { allowed: true, remaining: limit - count - 1 }
  } catch {
    // KV failure — allow through
    return { allowed: true, remaining: 999 }
  }
}

/**
 * Route to the appropriate AI model based on tier and available API keys.
 * Falls back gracefully: premium → free if premium APIs unavailable.
 */
export async function routeToModel(
  messages: AIMessage[],
  tier: string,
  env: Record<string, any>
): Promise<AIResponse> {
  const isPremium = tier === 'premium'

  if (isPremium) {
    // Try Gemini first (cheaper, faster)
    if (env.GEMINI_API_KEY) {
      try {
        return await runGemini(env.GEMINI_API_KEY, messages, 1200)
      } catch (err) {
        console.warn('[Router] Gemini failed, trying Claude:', err)
      }
    }

    // Try Claude
    if (env.ANTHROPIC_API_KEY) {
      try {
        return await runClaude(env.ANTHROPIC_API_KEY, messages, 1200)
      } catch (err) {
        console.warn('[Router] Claude failed, falling back to Workers AI:', err)
      }
    }

    // Both premium APIs failed — fall back to Workers AI with a note
    console.warn('[Router] All premium models unavailable, using Workers AI fallback')
  }

  // Free tier or premium fallback
  if (!env.AI) {
    throw new Error('No AI runtime available')
  }
  return await runWorkersAI(env.AI, messages, 900)
}
