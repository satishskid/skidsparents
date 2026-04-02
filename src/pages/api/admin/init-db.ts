/**
 * POST /api/admin/init-db — Create all tables if they don't exist
 * Safe to call multiple times (IF NOT EXISTS).
 */

import type { APIRoute } from 'astro'
import { getEnv } from '@/lib/runtime/env'

export const prerender = false

function checkAuth(request: Request, env: Env): boolean {
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
  v3_child_id TEXT,
  v3_campaign_code TEXT,
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

const CREATE_PRODUCTS_TABLE = `
CREATE TABLE IF NOT EXISTS products (
  slug TEXT PRIMARY KEY,
  brand TEXT NOT NULL,
  emoji TEXT NOT NULL DEFAULT '📦',
  tagline TEXT,
  description TEXT,
  status TEXT DEFAULT 'building',
  visible INTEGER DEFAULT 1,
  wonder_fact TEXT,
  why_it_matters TEXT,
  how_it_works_json TEXT,
  what_you_get_json TEXT,
  stats_json TEXT,
  faqs_json TEXT,
  age_range TEXT,
  cta_label TEXT,
  gradient TEXT DEFAULT 'from-gray-500 to-gray-600',
  sort_order INTEGER DEFAULT 99,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
`

const CREATE_CAMPAIGNS_TABLE = `
CREATE TABLE IF NOT EXISTS campaigns (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  product_slug TEXT NOT NULL,
  campaign_code TEXT NOT NULL UNIQUE,
  whatsapp_template TEXT,
  utm_source TEXT DEFAULT 'whatsapp',
  utm_medium TEXT DEFAULT 'campaign',
  utm_campaign TEXT,
  is_active INTEGER DEFAULT 1,
  leads_count INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
`

const CREATE_DOCTORS_TABLE = `
CREATE TABLE IF NOT EXISTS doctors (
  id TEXT PRIMARY KEY,
  firebase_uid TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL DEFAULT '',
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  specialty TEXT DEFAULT 'pediatrician',
  role TEXT DEFAULT 'primary',
  clinic_name TEXT,
  city TEXT,
  license_number TEXT,
  is_active INTEGER DEFAULT 1,
  ai_preference TEXT DEFAULT 'chips',
  ai_model_provider TEXT,
  ai_api_key_encrypted TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
`

const CREATE_DOCTOR_PATIENTS_TABLE = `
CREATE TABLE IF NOT EXISTS doctor_patients (
  id TEXT PRIMARY KEY,
  doctor_id TEXT NOT NULL REFERENCES doctors(id),
  child_id TEXT NOT NULL REFERENCES children(id),
  relationship TEXT DEFAULT 'primary',
  linked_by TEXT DEFAULT 'doctor',
  status TEXT DEFAULT 'active',
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(doctor_id, child_id)
);
`

const CREATE_PROTOCOLS_TABLE = `
CREATE TABLE IF NOT EXISTS protocols (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  age_range TEXT,
  trigger_conditions TEXT,
  steps_json TEXT NOT NULL,
  is_active INTEGER DEFAULT 1,
  version INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
`

const CREATE_PROTOCOL_ASSIGNMENTS_TABLE = `
CREATE TABLE IF NOT EXISTS protocol_assignments (
  id TEXT PRIMARY KEY,
  protocol_id TEXT NOT NULL REFERENCES protocols(id),
  child_id TEXT NOT NULL REFERENCES children(id),
  doctor_id TEXT NOT NULL REFERENCES doctors(id),
  status TEXT DEFAULT 'active',
  current_step INTEGER DEFAULT 0,
  steps_completed_json TEXT DEFAULT '[]',
  notes TEXT,
  started_at TEXT DEFAULT (datetime('now')),
  completed_at TEXT,
  updated_at TEXT DEFAULT (datetime('now')),
  UNIQUE(protocol_id, child_id)
);
`

// ── SKIDS Life Record — Probabilistic Projection Tables ──

const CREATE_OBSERVATION_PROJECTIONS_TABLE = `
CREATE TABLE IF NOT EXISTS observation_projections (
  id TEXT PRIMARY KEY,
  observation_id TEXT NOT NULL,
  child_id TEXT NOT NULL REFERENCES children(id),
  observation_text TEXT NOT NULL,
  condition_name TEXT NOT NULL,
  icd10 TEXT,
  domain TEXT NOT NULL,
  category TEXT NOT NULL,
  base_probability REAL NOT NULL,
  adjusted_probability REAL NOT NULL,
  urgency TEXT NOT NULL DEFAULT 'routine',
  must_not_miss INTEGER DEFAULT 0,
  parent_explanation TEXT,
  modifiers_json TEXT,
  evidence_for_json TEXT,
  evidence_against_json TEXT,
  parent_next_steps_json TEXT,
  doctor_exam_points_json TEXT,
  rule_out_before_json TEXT,
  citation TEXT,
  doctor_status TEXT DEFAULT 'projected',
  doctor_notes TEXT,
  doctor_id TEXT,
  refined_at TEXT,
  confidence REAL,
  created_at TEXT DEFAULT (datetime('now'))
);
`

const CREATE_PROJECTION_RESULTS_TABLE = `
CREATE TABLE IF NOT EXISTS projection_results (
  id TEXT PRIMARY KEY,
  observation_id TEXT NOT NULL,
  child_id TEXT NOT NULL REFERENCES children(id),
  observation_text TEXT NOT NULL,
  child_age_months INTEGER NOT NULL,
  projections_count INTEGER DEFAULT 0,
  domains_detected_json TEXT,
  clarifying_questions_json TEXT,
  confidence REAL,
  computed_at TEXT DEFAULT (datetime('now'))
);
`

const CREATE_DOCTOR_REFINEMENTS_TABLE = `
CREATE TABLE IF NOT EXISTS doctor_refinements (
  id TEXT PRIMARY KEY,
  projection_id TEXT NOT NULL REFERENCES observation_projections(id),
  doctor_id TEXT NOT NULL REFERENCES doctors(id),
  child_id TEXT NOT NULL REFERENCES children(id),
  condition_name TEXT NOT NULL,
  action TEXT NOT NULL,
  clinical_findings TEXT,
  adjusted_probability REAL,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
`

const CREATE_BIRTH_HISTORY_TABLE = `
CREATE TABLE IF NOT EXISTS birth_history (
  id TEXT PRIMARY KEY,
  child_id TEXT NOT NULL UNIQUE REFERENCES children(id),
  gestational_weeks INTEGER,
  delivery_mode TEXT,
  birth_weight_grams INTEGER,
  nicu_stay INTEGER DEFAULT 0,
  nicu_days INTEGER,
  apgar_score INTEGER,
  complications_json TEXT,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
`

const CREATE_FAMILY_HISTORY_TABLE = `
CREATE TABLE IF NOT EXISTS family_history (
  id TEXT PRIMARY KEY,
  child_id TEXT NOT NULL REFERENCES children(id),
  condition TEXT NOT NULL,
  relation TEXT,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
`

const CREATE_SCREENING_RESULTS_TABLE = `
CREATE TABLE IF NOT EXISTS screening_results (
  id TEXT PRIMARY KEY,
  child_id TEXT NOT NULL REFERENCES children(id),
  screening_type TEXT NOT NULL,
  date TEXT NOT NULL,
  result TEXT NOT NULL,
  findings_json TEXT,
  provider TEXT,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
`

const CREATE_DIET_RECORDS_TABLE = `
CREATE TABLE IF NOT EXISTS diet_records (
  id TEXT PRIMARY KEY,
  child_id TEXT NOT NULL REFERENCES children(id),
  date TEXT NOT NULL,
  breastfed INTEGER,
  formula_fed INTEGER,
  solids_started INTEGER,
  food_diversity INTEGER,
  iron_supplement INTEGER,
  vitamin_d INTEGER,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
`

const CREATE_ACTIVE_CONDITIONS_TABLE = `
CREATE TABLE IF NOT EXISTS active_conditions (
  id TEXT PRIMARY KEY,
  child_id TEXT NOT NULL REFERENCES children(id),
  condition_name TEXT NOT NULL,
  icd10 TEXT,
  diagnosed_date TEXT,
  status TEXT DEFAULT 'active',
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
`

const CREATE_MEDICATIONS_TABLE = `
CREATE TABLE IF NOT EXISTS medications (
  id TEXT PRIMARY KEY,
  child_id TEXT NOT NULL REFERENCES children(id),
  medication_name TEXT NOT NULL,
  dosage TEXT,
  frequency TEXT,
  start_date TEXT,
  end_date TEXT,
  prescriber TEXT,
  status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT (datetime('now'))
);
`

// ── Daily Experience tables ──

const CREATE_DAILY_INSIGHTS_TABLE = `
CREATE TABLE IF NOT EXISTS daily_insights (
  id TEXT PRIMARY KEY,
  child_id TEXT NOT NULL,
  date TEXT NOT NULL,
  insights_json TEXT NOT NULL,
  generated_at TEXT DEFAULT (datetime('now')),
  UNIQUE(child_id, date)
);
`

const CREATE_NOTIFICATIONS_TABLE = `
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  parent_id TEXT NOT NULL,
  child_id TEXT,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  action_url TEXT,
  action_data TEXT,
  read INTEGER DEFAULT 0,
  dismissed INTEGER DEFAULT 0,
  expires_at TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
`

const CREATE_NUDGE_DISMISSALS_TABLE = `
CREATE TABLE IF NOT EXISTS nudge_dismissals (
  id TEXT PRIMARY KEY,
  parent_id TEXT NOT NULL,
  nudge_key TEXT NOT NULL,
  dismissed_at TEXT DEFAULT (datetime('now')),
  UNIQUE(parent_id, nudge_key)
);
`

const CREATE_PARENT_SETTINGS_TABLE = `
CREATE TABLE IF NOT EXISTS parent_settings (
  parent_id TEXT PRIMARY KEY,
  notifications_enabled INTEGER DEFAULT 1,
  nudge_milestones INTEGER DEFAULT 1,
  nudge_observation_gaps INTEGER DEFAULT 1,
  nudge_patterns INTEGER DEFAULT 1,
  nudge_celebrations INTEGER DEFAULT 1,
  voice_notes_enabled INTEGER DEFAULT 0,
  vernacular_language TEXT,
  updated_at TEXT DEFAULT (datetime('now'))
);
`

// ── Growth & Intervention Engine tables ──

const CREATE_GROWTH_TRACKS_TABLE = `
CREATE TABLE IF NOT EXISTS growth_tracks (
  id TEXT PRIMARY KEY,
  domain TEXT NOT NULL,
  age_min_months INTEGER NOT NULL,
  age_max_months INTEGER NOT NULL,
  title TEXT NOT NULL,
  what_to_expect TEXT NOT NULL,
  parent_guidance_json TEXT NOT NULL,
  coaching_playbook_json TEXT NOT NULL,
  milestones_json TEXT,
  red_flags_json TEXT,
  parental_coping_json TEXT,
  evidence_base TEXT,
  region TEXT DEFAULT 'global',
  protocol_authority TEXT DEFAULT 'WHO',
  is_active INTEGER DEFAULT 1,
  version INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);
`

const CREATE_GROWTH_TRACK_PROGRESS_TABLE = `
CREATE TABLE IF NOT EXISTS growth_track_progress (
  id TEXT PRIMARY KEY,
  child_id TEXT NOT NULL REFERENCES children(id),
  track_id TEXT NOT NULL REFERENCES growth_tracks(id),
  status TEXT DEFAULT 'active',
  parent_engagement_score REAL DEFAULT 0,
  insights_viewed INTEGER DEFAULT 0,
  coach_sessions INTEGER DEFAULT 0,
  flagged_for_ped INTEGER DEFAULT 0,
  started_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  UNIQUE(child_id, track_id)
);
`

const CREATE_INTERVENTION_PROTOCOLS_TABLE = `
CREATE TABLE IF NOT EXISTS intervention_protocols (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  subspecialty TEXT NOT NULL,
  condition_name TEXT,
  icd10 TEXT,
  region TEXT NOT NULL DEFAULT 'global',
  protocol_authority TEXT NOT NULL,
  description TEXT,
  evidence_base TEXT,
  age_range_min INTEGER,
  age_range_max INTEGER,
  default_duration_days INTEGER NOT NULL,
  default_frequency TEXT NOT NULL,
  tasks_json TEXT NOT NULL,
  coaching_playbook_json TEXT NOT NULL,
  escalation_rules_json TEXT NOT NULL,
  customizable_params_json TEXT,
  prevalence_notes TEXT,
  genetic_considerations TEXT,
  dietary_context TEXT,
  is_active INTEGER DEFAULT 1,
  version INTEGER DEFAULT 1,
  parent_locale TEXT DEFAULT 'en',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
`

const CREATE_INTERVENTION_ASSIGNMENTS_TABLE = `
CREATE TABLE IF NOT EXISTS intervention_assignments (
  id TEXT PRIMARY KEY,
  intervention_protocol_id TEXT NOT NULL REFERENCES intervention_protocols(id),
  child_id TEXT NOT NULL REFERENCES children(id),
  doctor_id TEXT NOT NULL REFERENCES doctors(id),
  status TEXT DEFAULT 'active',
  start_date TEXT NOT NULL,
  end_date TEXT,
  custom_params_json TEXT,
  child_region TEXT,
  child_ethnic_origin TEXT,
  doctor_notes TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  UNIQUE(intervention_protocol_id, child_id, status)
);
`

const CREATE_INTERVENTION_TASKS_TABLE = `
CREATE TABLE IF NOT EXISTS intervention_tasks (
  id TEXT PRIMARY KEY,
  assignment_id TEXT NOT NULL REFERENCES intervention_assignments(id),
  child_id TEXT NOT NULL REFERENCES children(id),
  task_date TEXT NOT NULL,
  task_key TEXT NOT NULL,
  title TEXT NOT NULL,
  instructions TEXT NOT NULL,
  duration_minutes INTEGER,
  sequence_in_day INTEGER DEFAULT 1,
  status TEXT DEFAULT 'pending',
  completed_at TEXT,
  parent_note TEXT,
  media_url TEXT,
  media_type TEXT,
  difficulty_rating INTEGER,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
`

const CREATE_INTERVENTION_STREAKS_TABLE = `
CREATE TABLE IF NOT EXISTS intervention_streaks (
  id TEXT PRIMARY KEY,
  assignment_id TEXT NOT NULL REFERENCES intervention_assignments(id) UNIQUE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  total_done INTEGER DEFAULT 0,
  total_skipped INTEGER DEFAULT 0,
  total_partial INTEGER DEFAULT 0,
  compliance_pct REAL DEFAULT 0,
  last_completed_date TEXT,
  updated_at TEXT DEFAULT (datetime('now'))
);
`

const CREATE_INTERVENTION_ESCALATIONS_TABLE = `
CREATE TABLE IF NOT EXISTS intervention_escalations (
  id TEXT PRIMARY KEY,
  assignment_id TEXT NOT NULL REFERENCES intervention_assignments(id),
  child_id TEXT NOT NULL REFERENCES children(id),
  doctor_id TEXT NOT NULL REFERENCES doctors(id),
  escalation_type TEXT NOT NULL,
  severity TEXT DEFAULT 'info',
  title TEXT NOT NULL,
  detail TEXT,
  source TEXT DEFAULT 'system',
  status TEXT DEFAULT 'open',
  resolved_at TEXT,
  doctor_response TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
`

const CREATE_INTERVENTION_CHAT_SESSIONS_TABLE = `
CREATE TABLE IF NOT EXISTS intervention_chat_sessions (
  id TEXT PRIMARY KEY,
  assignment_id TEXT NOT NULL REFERENCES intervention_assignments(id),
  parent_id TEXT NOT NULL REFERENCES parents(id),
  child_id TEXT NOT NULL REFERENCES children(id),
  messages_json TEXT DEFAULT '[]',
  boundary_hits INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
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
  `CREATE INDEX IF NOT EXISTS idx_products_visible ON products(visible)`,
  `CREATE INDEX IF NOT EXISTS idx_products_status ON products(status)`,
  `CREATE INDEX IF NOT EXISTS idx_campaigns_slug ON campaigns(product_slug)`,
  `CREATE INDEX IF NOT EXISTS idx_campaigns_code ON campaigns(campaign_code)`,
  `CREATE INDEX IF NOT EXISTS idx_doctors_firebase ON doctors(firebase_uid)`,
  `CREATE INDEX IF NOT EXISTS idx_doctors_specialty ON doctors(specialty)`,
  `CREATE INDEX IF NOT EXISTS idx_doctor_patients_doctor ON doctor_patients(doctor_id)`,
  `CREATE INDEX IF NOT EXISTS idx_doctor_patients_child ON doctor_patients(child_id)`,
  `CREATE INDEX IF NOT EXISTS idx_doctor_patients_status ON doctor_patients(status)`,
  `CREATE INDEX IF NOT EXISTS idx_protocols_slug ON protocols(slug)`,
  `CREATE INDEX IF NOT EXISTS idx_protocols_category ON protocols(category)`,
  `CREATE INDEX IF NOT EXISTS idx_assignments_child ON protocol_assignments(child_id)`,
  `CREATE INDEX IF NOT EXISTS idx_assignments_doctor ON protocol_assignments(doctor_id)`,
  `CREATE INDEX IF NOT EXISTS idx_assignments_status ON protocol_assignments(status)`,
  // Life Record indexes
  `CREATE INDEX IF NOT EXISTS idx_obs_proj_observation ON observation_projections(observation_id)`,
  `CREATE INDEX IF NOT EXISTS idx_obs_proj_child ON observation_projections(child_id)`,
  `CREATE INDEX IF NOT EXISTS idx_obs_proj_domain ON observation_projections(domain)`,
  `CREATE INDEX IF NOT EXISTS idx_obs_proj_status ON observation_projections(doctor_status)`,
  `CREATE INDEX IF NOT EXISTS idx_obs_proj_must_not_miss ON observation_projections(must_not_miss)`,
  `CREATE INDEX IF NOT EXISTS idx_proj_results_child ON projection_results(child_id)`,
  `CREATE INDEX IF NOT EXISTS idx_proj_results_obs ON projection_results(observation_id)`,
  `CREATE INDEX IF NOT EXISTS idx_doctor_refinements_proj ON doctor_refinements(projection_id)`,
  `CREATE INDEX IF NOT EXISTS idx_doctor_refinements_doctor ON doctor_refinements(doctor_id)`,
  `CREATE INDEX IF NOT EXISTS idx_doctor_refinements_child ON doctor_refinements(child_id)`,
  `CREATE INDEX IF NOT EXISTS idx_birth_history_child ON birth_history(child_id)`,
  `CREATE INDEX IF NOT EXISTS idx_family_history_child ON family_history(child_id)`,
  `CREATE INDEX IF NOT EXISTS idx_screening_results_child ON screening_results(child_id)`,
  `CREATE INDEX IF NOT EXISTS idx_screening_results_type ON screening_results(screening_type)`,
  `CREATE INDEX IF NOT EXISTS idx_diet_records_child ON diet_records(child_id)`,
  `CREATE INDEX IF NOT EXISTS idx_active_conditions_child ON active_conditions(child_id)`,
  `CREATE INDEX IF NOT EXISTS idx_active_conditions_status ON active_conditions(status)`,
  `CREATE INDEX IF NOT EXISTS idx_medications_child ON medications(child_id)`,
  `CREATE INDEX IF NOT EXISTS idx_medications_status ON medications(status)`,
  // Daily Experience indexes
  `CREATE INDEX IF NOT EXISTS idx_daily_insights_child ON daily_insights(child_id)`,
  `CREATE INDEX IF NOT EXISTS idx_daily_insights_date ON daily_insights(date)`,
  `CREATE INDEX IF NOT EXISTS idx_notifications_parent ON notifications(parent_id)`,
  `CREATE INDEX IF NOT EXISTS idx_notifications_child ON notifications(child_id)`,
  `CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read)`,
  `CREATE INDEX IF NOT EXISTS idx_nudge_dismissals_parent ON nudge_dismissals(parent_id)`,
  `CREATE INDEX IF NOT EXISTS idx_observations_date ON parent_observations(date)`,
  `CREATE INDEX IF NOT EXISTS idx_observations_category ON parent_observations(category)`,
  // Growth & Intervention Engine indexes
  `CREATE INDEX IF NOT EXISTS idx_growth_tracks_domain ON growth_tracks(domain)`,
  `CREATE INDEX IF NOT EXISTS idx_growth_tracks_age ON growth_tracks(age_min_months, age_max_months)`,
  `CREATE INDEX IF NOT EXISTS idx_growth_track_progress_child ON growth_track_progress(child_id)`,
  `CREATE INDEX IF NOT EXISTS idx_growth_track_progress_status ON growth_track_progress(status)`,
  `CREATE INDEX IF NOT EXISTS idx_int_protocols_slug ON intervention_protocols(slug)`,
  `CREATE INDEX IF NOT EXISTS idx_int_protocols_category ON intervention_protocols(category)`,
  `CREATE INDEX IF NOT EXISTS idx_int_protocols_subspecialty ON intervention_protocols(subspecialty)`,
  `CREATE INDEX IF NOT EXISTS idx_int_protocols_region ON intervention_protocols(region)`,
  `CREATE INDEX IF NOT EXISTS idx_int_assignments_child ON intervention_assignments(child_id)`,
  `CREATE INDEX IF NOT EXISTS idx_int_assignments_doctor ON intervention_assignments(doctor_id)`,
  `CREATE INDEX IF NOT EXISTS idx_int_assignments_status ON intervention_assignments(status)`,
  `CREATE INDEX IF NOT EXISTS idx_int_tasks_assignment ON intervention_tasks(assignment_id)`,
  `CREATE INDEX IF NOT EXISTS idx_int_tasks_child_date ON intervention_tasks(child_id, task_date)`,
  `CREATE INDEX IF NOT EXISTS idx_int_tasks_status ON intervention_tasks(status)`,
  `CREATE INDEX IF NOT EXISTS idx_int_escalations_doctor ON intervention_escalations(doctor_id)`,
  `CREATE INDEX IF NOT EXISTS idx_int_escalations_status ON intervention_escalations(status)`,
  `CREATE INDEX IF NOT EXISTS idx_int_escalations_assignment ON intervention_escalations(assignment_id)`,
  `CREATE INDEX IF NOT EXISTS idx_int_chat_assignment ON intervention_chat_sessions(assignment_id)`,
]

export const GET: APIRoute = async (ctx) => {
  return handleInit(ctx.request, ctx.locals)
}

export const POST: APIRoute = async ({ request, locals }) => {
  return handleInit(request, locals)
}

async function handleInit(request: Request, locals: App.Locals) {
  const env = getEnv(locals)

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
    await db.prepare(CREATE_PRODUCTS_TABLE).run()
    await db.prepare(CREATE_CAMPAIGNS_TABLE).run()
    await db.prepare(CREATE_DOCTORS_TABLE).run()
    await db.prepare(CREATE_DOCTOR_PATIENTS_TABLE).run()
    await db.prepare(CREATE_PROTOCOLS_TABLE).run()
    await db.prepare(CREATE_PROTOCOL_ASSIGNMENTS_TABLE).run()
    // Life Record tables
    await db.prepare(CREATE_OBSERVATION_PROJECTIONS_TABLE).run()
    await db.prepare(CREATE_PROJECTION_RESULTS_TABLE).run()
    await db.prepare(CREATE_DOCTOR_REFINEMENTS_TABLE).run()
    await db.prepare(CREATE_BIRTH_HISTORY_TABLE).run()
    await db.prepare(CREATE_FAMILY_HISTORY_TABLE).run()
    await db.prepare(CREATE_SCREENING_RESULTS_TABLE).run()
    await db.prepare(CREATE_DIET_RECORDS_TABLE).run()
    await db.prepare(CREATE_ACTIVE_CONDITIONS_TABLE).run()
    await db.prepare(CREATE_MEDICATIONS_TABLE).run()
    // Daily Experience tables
    await db.prepare(CREATE_DAILY_INSIGHTS_TABLE).run()
    await db.prepare(CREATE_NOTIFICATIONS_TABLE).run()
    await db.prepare(CREATE_NUDGE_DISMISSALS_TABLE).run()
    await db.prepare(CREATE_PARENT_SETTINGS_TABLE).run()
    // Growth & Intervention Engine tables
    await db.prepare(CREATE_GROWTH_TRACKS_TABLE).run()
    await db.prepare(CREATE_GROWTH_TRACK_PROGRESS_TABLE).run()
    await db.prepare(CREATE_INTERVENTION_PROTOCOLS_TABLE).run()
    await db.prepare(CREATE_INTERVENTION_ASSIGNMENTS_TABLE).run()
    await db.prepare(CREATE_INTERVENTION_TASKS_TABLE).run()
    await db.prepare(CREATE_INTERVENTION_STREAKS_TABLE).run()
    await db.prepare(CREATE_INTERVENTION_ESCALATIONS_TABLE).run()
    await db.prepare(CREATE_INTERVENTION_CHAT_SESSIONS_TABLE).run()
    for (const stmt of INDEX_STATEMENTS) {
      await db.prepare(stmt).run()
    }

    // ── V3 Bridge columns (safe to run multiple times) ──
    try {
      await db.prepare(`ALTER TABLE children ADD COLUMN v3_child_id TEXT`).run()
    } catch { /* column already exists */ }
    try {
      await db.prepare(`ALTER TABLE children ADD COLUMN v3_campaign_code TEXT`).run()
    } catch { /* column already exists */ }
    try {
      await db.prepare(`CREATE INDEX IF NOT EXISTS idx_children_v3 ON children(v3_child_id)`).run()
    } catch { /* index already exists */ }

    // ── Observation table column additions for daily experience ──
    try {
      await db.prepare(`ALTER TABLE parent_observations ADD COLUMN media_url TEXT`).run()
    } catch { /* column already exists */ }
    try {
      await db.prepare(`ALTER TABLE parent_observations ADD COLUMN media_type TEXT`).run()
    } catch { /* column already exists */ }
    try {
      await db.prepare(`ALTER TABLE parent_observations ADD COLUMN source TEXT DEFAULT 'active'`).run()
    } catch { /* column already exists */ }

    // ── Doctor table column additions for protocol authority ──
    try {
      await db.prepare(`ALTER TABLE doctors ADD COLUMN default_protocol_authority TEXT DEFAULT 'IAP'`).run()
    } catch { /* column already exists */ }

    return new Response(
      JSON.stringify({ success: true, message: 'All 39 tables ready (18 core + 9 life record + 4 daily experience + 8 growth & intervention) + columns migrated' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (e: unknown) {
    console.error('[Admin] Init DB error:', e)
    const message = e instanceof Error ? e.message : String(e)
    return new Response(
      JSON.stringify({ error: 'Failed to init DB', detail: message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
