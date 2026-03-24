/**
 * POST /api/auth/session — Verify Firebase token + upsert parent in D1
 * Called after client-side login to ensure parent record exists.
 */

import type { APIRoute } from 'astro'
import { verifyIdToken, extractBearerToken } from '@/lib/firebase/server'
import { getEnv } from '@/lib/runtime/env'
import { generateReferralCode } from '@/lib/referral/generateCode'

export const prerender = false

export const POST: APIRoute = async ({ request, locals }) => {
  const env = getEnv(locals)

  const token = extractBearerToken(request)
  if (!token) {
    return new Response(JSON.stringify({ error: 'Missing auth token' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const decoded = await verifyIdToken(token, env.FIREBASE_PROJECT_ID || 'skidsparent', env.KV)
  if (!decoded) {
    return new Response(JSON.stringify({ error: 'Invalid token' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const db = env.DB
  if (!db) {
    return new Response(JSON.stringify({ error: 'Database not available' }), { status: 500 })
  }

  try {
    // Check if parent exists
    interface ParentIdRow { id: string }
    const existing = await db
      .prepare('SELECT id FROM parents WHERE firebase_uid = ?')
      .bind(decoded.uid)
      .first<ParentIdRow>()

    let parentId: string
    let isNew = false

    if (existing) {
      parentId = existing.id
      // Update profile info from Google
      await db
        .prepare('UPDATE parents SET name = ?, email = ?, avatar_url = ? WHERE firebase_uid = ?')
        .bind(decoded.name || '', decoded.email || '', decoded.picture || '', decoded.uid)
        .run()
    } else {
      parentId = crypto.randomUUID()
      isNew = true
      await db
        .prepare(
          'INSERT INTO parents (id, firebase_uid, name, email, avatar_url, created_at) VALUES (?, ?, ?, ?, ?, datetime(\'now\'))'
        )
        .bind(parentId, decoded.uid, decoded.name || '', decoded.email || '', decoded.picture || '')
        .run()
    }

    // Generate referral code for new parents (idempotent — AND referral_code IS NULL guard)
    if (isNew) {
      const code = await generateReferralCode(decoded.uid)
      await db
        .prepare('UPDATE parents SET referral_code = ? WHERE id = ? AND referral_code IS NULL')
        .bind(code, parentId)
        .run()
    }

    // Fire-and-forget: generate notifications for this parent on login
    const origin = new URL(request.url).origin
    fetch(`${origin}/api/notifications/generate`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {}) // intentionally non-blocking

    // Fire-and-forget: attribute referral if code present in request body
    if (isNew) {
      try {
        const body = await request.clone().json() as { referralCode?: string }
        const referralCode = body?.referralCode
        if (referralCode) {
          fetch(`${origin}/api/referrals/attribute`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ referralCode, refereeParentId: parentId }),
          }).catch(() => {})
        }
      } catch {
        // body may not be JSON — ignore
      }
    }

    return new Response(JSON.stringify({ parentId, isNew }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (e: unknown) {
    if (e instanceof Error && e.message.includes('no such table')) {
      return new Response(
        JSON.stringify({ error: 'parents table not created yet. Click Init DB in /admin.' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }
    console.error('[Auth] Session error:', e)
    return new Response(JSON.stringify({ error: 'Session creation failed' }), { status: 500 })
  }
}
