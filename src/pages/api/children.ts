/**
 * GET  /api/children — List children for authenticated parent
 * POST /api/children — Create a new child record
 */

import type { APIRoute } from 'astro'
import { verifyIdToken, extractBearerToken } from '@/lib/firebase/server'
import { getMilestonesForAge } from '@/lib/content/milestones'

export const prerender = false

async function seedMilestones(childId: string, ageMonths: number, db: any): Promise<void> {
  try {
    const milestones = getMilestonesForAge(ageMonths)
    for (const m of milestones) {
      // Check if already exists (idempotent)
      const existing = await db
        .prepare('SELECT id FROM milestones WHERE child_id = ? AND milestone_key = ?')
        .bind(childId, m.key)
        .first()
      if (!existing) {
        await db
          .prepare(
            `INSERT INTO milestones (id, child_id, milestone_key, title, category, status, expected_age_min, expected_age_max, updated_at)
             VALUES (?, ?, ?, ?, ?, 'not_started', ?, ?, datetime('now'))`
          )
          .bind(crypto.randomUUID(), childId, m.key, m.title, m.category, m.expectedAgeMin, m.expectedAgeMax)
          .run()
      }
    }
  } catch (err) {
    console.error('[Children] Milestone seeding error:', err)
    // Never throw — seeding failure must not block child creation
  }
}

export async function getParentId(request: Request, env: any): Promise<string | null> {
  const token = extractBearerToken(request)
  if (!token) return null
  const decoded = await verifyIdToken(token, env.FIREBASE_PROJECT_ID || 'skidsparent', env.KV)
  if (!decoded) return null
  const row = await env.DB?.prepare('SELECT id FROM parents WHERE firebase_uid = ?').bind(decoded.uid).first()
  return row ? (row as any).id : null
}

/** Verify that a child belongs to this parent */
export async function verifyChildOwnership(parentId: string, childId: string, db: any): Promise<boolean> {
  const row = await db.prepare('SELECT id FROM children WHERE id = ? AND parent_id = ?').bind(childId, parentId).first()
  return !!row
}

export const GET: APIRoute = async ({ request, locals }) => {
  const env = (locals as any).runtime?.env || {}
  const parentId = await getParentId(request, env)
  if (!parentId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  try {
    const { results } = await env.DB.prepare(
      'SELECT * FROM children WHERE parent_id = ? ORDER BY created_at DESC'
    ).bind(parentId).all()

    return new Response(JSON.stringify({ children: results || [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err: any) {
    if (err.message?.includes('no such table')) {
      return new Response(JSON.stringify({ children: [] }), { status: 200 })
    }
    return new Response(JSON.stringify({ error: 'Failed to fetch children' }), { status: 500 })
  }
}

export const POST: APIRoute = async ({ request, locals }) => {
  const env = (locals as any).runtime?.env || {}
  const parentId = await getParentId(request, env)
  if (!parentId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  try {
    const body = await request.json() as {
      name: string
      dob: string
      gender?: string
      blood_group?: string
      allergies?: string[]
    }

    if (!body.name || !body.dob) {
      return new Response(JSON.stringify({ error: 'name and dob are required' }), { status: 400 })
    }

    const id = crypto.randomUUID()
    await env.DB.prepare(
      `INSERT INTO children (id, parent_id, name, dob, gender, blood_group, allergies_json, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`
    ).bind(
      id,
      parentId,
      body.name,
      body.dob,
      body.gender || null,
      body.blood_group || null,
      body.allergies?.length ? JSON.stringify(body.allergies) : null
    ).run()

    // Compute ageMonths from dob
    const dob = new Date(body.dob)
    const now = new Date()
    const ageMonths = (now.getFullYear() - dob.getFullYear()) * 12 + (now.getMonth() - dob.getMonth())

    // Seed age-appropriate milestones (non-blocking on failure)
    await seedMilestones(id, ageMonths, env.DB)

    return new Response(JSON.stringify({ id, name: body.name, dob: body.dob }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err: any) {
    if (err.message?.includes('no such table')) {
      return new Response(
        JSON.stringify({ error: 'children table not created yet. Click Init DB in /admin.' }),
        { status: 500 }
      )
    }
    console.error('[Children] Create error:', err)
    return new Response(JSON.stringify({ error: 'Failed to create child' }), { status: 500 })
  }
}
