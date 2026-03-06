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

const CREATE_MILESTONES_TABLE = `
CREATE TABLE IF NOT EXISTS milestones (
  id TEXT PRIMARY KEY,
  child_id TEXT NOT NULL REFERENCES children(id),
  category TEXT NOT NULL,
  milestone_key TEXT NOT NULL,
  title TEXT NOT NULL,
  status TEXT DEFAULT 'not_started',
  observed_at TEXT,
  parent_notes TEXT,
  expected_age_min INTEGER,
  expected_age_max INTEGER,
  updated_at TEXT DEFAULT (datetime('now'))
);
`

const CREATE_HABITS_LOG_TABLE = `
CREATE TABLE IF NOT EXISTS habits_log (
  id TEXT PRIMARY KEY,
  child_id TEXT NOT NULL REFERENCES children(id),
  date TEXT NOT NULL,
  habit_type TEXT NOT NULL,
  value_json TEXT,
  streak_days INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);
`

const CREATE_GROWTH_RECORDS_TABLE = `
CREATE TABLE IF NOT EXISTS growth_records (
  id TEXT PRIMARY KEY,
  child_id TEXT NOT NULL REFERENCES children(id),
  date TEXT NOT NULL,
  height_cm REAL,
  weight_kg REAL,
  head_circ_cm REAL,
  bmi REAL,
  who_zscore_json TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
`

const CREATE_PARENT_OBSERVATIONS_TABLE = `
CREATE TABLE IF NOT EXISTS parent_observations (
  id TEXT PRIMARY KEY,
  child_id TEXT NOT NULL REFERENCES children(id),
  date TEXT NOT NULL,
  category TEXT,
  observation_text TEXT NOT NULL,
  concern_level TEXT DEFAULT 'none',
  ai_response TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
`

const CREATE_CHATBOT_CONVERSATIONS_TABLE = `
CREATE TABLE IF NOT EXISTS chatbot_conversations (
  id TEXT PRIMARY KEY,
  parent_id TEXT NOT NULL,
  child_id TEXT,
  messages_json TEXT DEFAULT '[]',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
`

const CREATE_HEALTH_RECORDS_TABLE = `
CREATE TABLE IF NOT EXISTS health_records (
  id TEXT PRIMARY KEY,
  child_id TEXT NOT NULL,
  record_type TEXT NOT NULL,
  title TEXT NOT NULL,
  record_date TEXT NOT NULL,
  provider_name TEXT,
  summary TEXT,
  data_json TEXT,
  source TEXT DEFAULT 'parent_manual',
  source_ref_id TEXT,
  file_url TEXT,
  concern_level TEXT DEFAULT 'none',
  ai_confidence REAL,
  created_at TEXT DEFAULT (datetime('now'))
);
`

const CREATE_UPLOADED_REPORTS_TABLE = `
CREATE TABLE IF NOT EXISTS uploaded_reports (
  id TEXT PRIMARY KEY,
  child_id TEXT NOT NULL,
  file_key TEXT NOT NULL,
  file_type TEXT,
  file_name TEXT,
  upload_date TEXT DEFAULT (datetime('now')),
  ai_extracted_json TEXT,
  provider_name TEXT,
  report_type TEXT
);
`

const CREATE_VACCINATION_RECORDS_TABLE = `
CREATE TABLE IF NOT EXISTS vaccination_records (
  id TEXT PRIMARY KEY,
  child_id TEXT NOT NULL,
  vaccine_name TEXT NOT NULL,
  dose TEXT,
  administered_date TEXT,
  provider TEXT,
  next_due TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
`

const CREATE_SCREENING_IMPORTS_TABLE = `
CREATE TABLE IF NOT EXISTS screening_imports (
  id TEXT PRIMARY KEY,
  child_id TEXT NOT NULL,
  source TEXT DEFAULT 'skids',
  campaign_code TEXT,
  imported_at TEXT DEFAULT (datetime('now')),
  screening_date TEXT,
  data_json TEXT,
  four_d_json TEXT,
  summary_text TEXT
);
`

const INDEX_STATEMENTS = [
  `CREATE INDEX IF NOT EXISTS idx_leads_brand ON leads(brand)`,
  `CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status)`,
  `CREATE INDEX IF NOT EXISTS idx_leads_created ON leads(created_at)`,
  `CREATE INDEX IF NOT EXISTS idx_leads_phone ON leads(phone)`,
  `CREATE INDEX IF NOT EXISTS idx_parents_firebase ON parents(firebase_uid)`,
  `CREATE INDEX IF NOT EXISTS idx_children_parent ON children(parent_id)`,
  `CREATE INDEX IF NOT EXISTS idx_milestones_child ON milestones(child_id)`,
  `CREATE INDEX IF NOT EXISTS idx_milestones_category ON milestones(category)`,
  `CREATE INDEX IF NOT EXISTS idx_habits_child_date ON habits_log(child_id, date)`,
  `CREATE INDEX IF NOT EXISTS idx_growth_child ON growth_records(child_id)`,
  `CREATE INDEX IF NOT EXISTS idx_observations_child ON parent_observations(child_id)`,
  `CREATE INDEX IF NOT EXISTS idx_chatbot_parent ON chatbot_conversations(parent_id)`,
  `CREATE INDEX IF NOT EXISTS idx_chatbot_child ON chatbot_conversations(child_id)`,
  `CREATE INDEX IF NOT EXISTS idx_health_records_child ON health_records(child_id)`,
  `CREATE INDEX IF NOT EXISTS idx_health_records_date ON health_records(record_date)`,
  `CREATE INDEX IF NOT EXISTS idx_health_records_type ON health_records(record_type)`,
  `CREATE INDEX IF NOT EXISTS idx_uploaded_reports_child ON uploaded_reports(child_id)`,
  `CREATE INDEX IF NOT EXISTS idx_vaccination_child ON vaccination_records(child_id)`,
  `CREATE INDEX IF NOT EXISTS idx_screening_child ON screening_imports(child_id)`,
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
    await db.prepare(CREATE_MILESTONES_TABLE).run()
    await db.prepare(CREATE_HABITS_LOG_TABLE).run()
    await db.prepare(CREATE_GROWTH_RECORDS_TABLE).run()
    await db.prepare(CREATE_PARENT_OBSERVATIONS_TABLE).run()
    await db.prepare(CREATE_CHATBOT_CONVERSATIONS_TABLE).run()
    await db.prepare(CREATE_HEALTH_RECORDS_TABLE).run()
    await db.prepare(CREATE_UPLOADED_REPORTS_TABLE).run()
    await db.prepare(CREATE_VACCINATION_RECORDS_TABLE).run()
    await db.prepare(CREATE_SCREENING_IMPORTS_TABLE).run()
    for (const stmt of INDEX_STATEMENTS) {
      await db.prepare(stmt).run()
    }

    return new Response(
      JSON.stringify({ success: true, message: 'All 12 tables ready' }),
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
