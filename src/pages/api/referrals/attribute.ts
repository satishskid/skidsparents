/**
 * POST /api/referrals/attribute — Record a referral attribution
 */
import type { APIRoute } from 'astro'
import { getParentId } from '@/pages/api/children'
import { getEnv } from '@/lib/runtime/env'

export const prerender = false

export const POST: APIRoute = async ({ request, locals }) => {
  const env = getEnv(locals)
  const callerId = await getParentId(request, env)
  if (!callerId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401, headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const body = await request.json() as { referralCode?: string; refereeParentId?: string }
    const { referralCode, refereeParentId } = body

    if (!referralCode || !refereeParentId) {
      return new Response(JSON.stringify({ error: 'referralCode and refereeParentId are required' }), {
        status: 400, headers: { 'Content-Type': 'application/json' },
      })
    }

    // Caller must be the referee
    if (callerId !== refereeParentId) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403, headers: { 'Content-Type': 'application/json' },
      })
    }

    // Look up referrer by code
    interface ParentRow { id: string }
    const referrer = await env.DB.prepare(
      'SELECT id FROM parents WHERE referral_code = ?'
    ).bind(referralCode).first<ParentRow>()

    if (!referrer) {
      return new Response(JSON.stringify({ error: 'Referral code not found' }), {
        status: 404, headers: { 'Content-Type': 'application/json' },
      })
    }

    // Prevent self-referral
    if (referrer.id === refereeParentId) {
      return new Response(JSON.stringify({ error: 'Self-referral not allowed' }), {
        status: 400, headers: { 'Content-Type': 'application/json' },
      })
    }

    // Insert referral (unique constraint on referee_parent_id catches duplicates)
    try {
      const id = crypto.randomUUID()
      await env.DB.prepare(
        `INSERT INTO referrals (id, referrer_parent_id, referee_parent_id, created_at)
         VALUES (?, ?, ?, datetime('now'))`
      ).bind(id, referrer.id, refereeParentId).run()
    } catch (e: unknown) {
      if (e instanceof Error && e.message.includes('UNIQUE')) {
        return new Response(JSON.stringify({ error: 'Already attributed' }), {
          status: 409, headers: { 'Content-Type': 'application/json' },
        })
      }
      throw e
    }

    // Set is_champion on referrer (only if not already champion)
    const updateResult = await env.DB.prepare(
      'UPDATE parents SET is_champion = 1 WHERE id = ? AND is_champion = 0'
    ).bind(referrer.id).run()

    const isNewChampion = (updateResult.meta?.changes ?? 0) > 0

    return new Response(JSON.stringify({ ok: true, isNewChampion }), {
      status: 200, headers: { 'Content-Type': 'application/json' },
    })
  } catch (e: unknown) {
    console.error('[referrals/attribute] error:', e)
    return new Response(JSON.stringify({ error: 'Attribution failed' }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    })
  }
}
