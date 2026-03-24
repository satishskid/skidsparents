/**
 * GET /api/referrals/stats — Return referral stats for authenticated parent
 */
import type { APIRoute } from 'astro'
import { getParentId } from '@/pages/api/children'
import { getEnv } from '@/lib/runtime/env'
import { generateReferralCode } from '@/lib/referral/generateCode'
import { buildReferralLink } from '@/lib/referral/buildLink'

export const prerender = false

export const GET: APIRoute = async ({ request, locals }) => {
  const env = getEnv(locals)
  const parentId = await getParentId(request, env)
  if (!parentId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401, headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    interface ParentRow { referral_code: string | null; is_champion: number; firebase_uid: string }
    const parent = await env.DB.prepare(
      'SELECT referral_code, is_champion, firebase_uid FROM parents WHERE id = ?'
    ).bind(parentId).first<ParentRow>()

    if (!parent) {
      return new Response(JSON.stringify({ error: 'Parent not found' }), {
        status: 404, headers: { 'Content-Type': 'application/json' },
      })
    }

    let referralCode = parent.referral_code
    // Generate and persist on-the-fly if missing
    if (!referralCode) {
      referralCode = await generateReferralCode(parent.firebase_uid)
      await env.DB.prepare(
        'UPDATE parents SET referral_code = ? WHERE id = ? AND referral_code IS NULL'
      ).bind(referralCode, parentId).run()
    }

    interface CountRow { cnt: number }
    const signupResult = await env.DB.prepare(
      'SELECT COUNT(*) as cnt FROM referrals WHERE referrer_parent_id = ?'
    ).bind(parentId).first<CountRow>()

    const shareResult = await env.DB.prepare(
      `SELECT COUNT(*) as cnt FROM social_shares
       WHERE parent_id = ? AND content_type = 'referral'`
    ).bind(parentId).first<CountRow>()

    const referralLink = buildReferralLink(referralCode, 'copy')

    return new Response(JSON.stringify({
      referralCode,
      referralLink,
      signupCount: signupResult?.cnt ?? 0,
      shareCount: shareResult?.cnt ?? 0,
      isChampion: !!parent.is_champion,
    }), {
      status: 200, headers: { 'Content-Type': 'application/json' },
    })
  } catch (e: unknown) {
    console.error('[referrals/stats] error:', e)
    return new Response(JSON.stringify({ error: 'Failed to fetch stats' }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    })
  }
}
