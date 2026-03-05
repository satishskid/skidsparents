/**
 * POST /api/admin/init-db — Create all tables if they don't exist
 * Safe to call multiple times (IF NOT EXISTS).
 */

import type { APIRoute } from 'astro'

export const prerender = false

function checkAuth(request: Request, env: any): boolean {
  const adminKey = env.ADMIN_KEY
  if (!adminKey) return true
  const auth = request.headers.get('Authorization')
  if (!auth) return false
  return auth === `Bearer ${adminKey}` || auth === adminKey
}

const CREATE_LEADS_TABLE = `
CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  brand TEXT NOT NULL DEFAULT 'skids',
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  source TEXT,
  medium TEXT,
  campaign TEXT,
  funnel_stage TEXT,
  asset_code TEXT,
  center TEXT DEFAULT 'online',
  child_age_months INTEGER,
  notes TEXT,
  status TEXT DEFAULT 'new',
  assigned_to TEXT,
  utm_source TEXT,
  utm_campaign TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
`

const CREATE_PARENTS_TABLE = `
CREATE TABLE IF NOT EXISTS parents (
  id TEXT PRIMARY KEY,
  firebase_uid TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL DEFAULT '',
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  city TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
`

const CREATE_CHILDREN_TABLE = `
CREATE TABLE IF NOT EXISTS children (
  id TEXT PRIMARY KEY,
  parent_id TEXT NOT NULL REFERENCES parents(id),
  name TEXT NOT NULL,
  dob TEXT NOT NULL,
  gender TEXT,
  photo_url TEXT,
  blood_group TEXT,
  allergies_json TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
`

const INDEX_STATEMENTS = [
  `CREATE INDEX IF NOT EXISTS idx_leads_brand ON leads(brand)`,
  `CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status)`,
  `CREATE INDEX IF NOT EXISTS idx_leads_created ON leads(created_at)`,
  `CREATE INDEX IF NOT EXISTS idx_leads_phone ON leads(phone)`,
  `CREATE INDEX IF NOT EXISTS idx_parents_firebase ON parents(firebase_uid)`,
  `CREATE INDEX IF NOT EXISTS idx_children_parent ON children(parent_id)`,
]

export const GET: APIRoute = async (ctx) => {
  return handleInit(ctx.request, ctx.locals)
}

export const POST: APIRoute = async ({ request, locals }) => {
  return handleInit(request, locals)
}

async function handleInit(request: Request, locals: any) {
  const runtime = (locals as any).runtime
  const env = runtime?.env || {}

  if (!checkAuth(request, env)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const db = env.DB
  if (!db) {
    return new Response(JSON.stringify({ error: 'Database not available' }), { status: 500 })
  }

  try {
    await db.prepare(CREATE_LEADS_TABLE).run()
    await db.prepare(CREATE_PARENTS_TABLE).run()
    await db.prepare(CREATE_CHILDREN_TABLE).run()
    for (const stmt of INDEX_STATEMENTS) {
      await db.prepare(stmt).run()
    }

    return new Response(
      JSON.stringify({ success: true, message: 'All tables ready (leads, parents, children)' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (err: any) {
    console.error('[Admin] Init DB error:', err)
    return new Response(
      JSON.stringify({ error: 'Failed to init DB', detail: err?.message || String(err) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
