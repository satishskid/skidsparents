/**
 * POST /api/admin/init-db — Create the leads table if it doesn't exist
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

const CREATE_INDEXES = `
CREATE INDEX IF NOT EXISTS idx_leads_brand ON leads(brand);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created ON leads(created_at);
CREATE INDEX IF NOT EXISTS idx_leads_phone ON leads(phone);
`

export const POST: APIRoute = async ({ request, locals }) => {
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
    await db.exec(CREATE_LEADS_TABLE)
    await db.exec(CREATE_INDEXES)

    return new Response(
      JSON.stringify({ success: true, message: 'Leads table ready' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('[Admin] Init DB error:', err)
    return new Response(JSON.stringify({ error: 'Failed to init DB' }), { status: 500 })
  }
}
