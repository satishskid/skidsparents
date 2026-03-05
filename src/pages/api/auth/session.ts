/**
 * POST /api/auth/session — Verify Firebase token + upsert parent in D1
 * Called after client-side login to ensure parent record exists.
 */

import type { APIRoute } from 'astro'
import { verifyIdToken, extractBearerToken } from '@/lib/firebase/server'

export const prerender = false

export const POST: APIRoute = async ({ request, locals }) => {
  const runtime = (locals as any).runtime
  const env = runtime?.env || {}

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
    const existing = await db
      .prepare('SELECT id FROM parents WHERE firebase_uid = ?')
      .bind(decoded.uid)
      .first()

    let parentId: string
    let isNew = false

    if (existing) {
      parentId = (existing as any).id
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

    return new Response(JSON.stringify({ parentId, isNew }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err: any) {
    if (err.message?.includes('no such table')) {
      return new Response(
        JSON.stringify({ error: 'parents table not created yet. Click Init DB in /admin.' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }
    console.error('[Auth] Session error:', err)
    return new Response(JSON.stringify({ error: 'Session creation failed' }), { status: 500 })
  }
}
