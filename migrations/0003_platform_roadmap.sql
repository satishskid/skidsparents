-- Migration: 0003_platform_roadmap
-- Phase 1 schema additions for SKIDS Platform Roadmap

-- ─── providers: new columns ───────────────────────────
ALTER TABLE providers ADD COLUMN firebase_uid TEXT UNIQUE;
ALTER TABLE providers ADD COLUMN status TEXT DEFAULT 'pending_review';
ALTER TABLE providers ADD COLUMN fee_structure_json TEXT;
ALTER TABLE providers ADD COLUMN medical_reg_number TEXT;

-- ─── service_orders: new columns ─────────────────────
ALTER TABLE service_orders ADD COLUMN slot_id TEXT;
ALTER TABLE service_orders ADD COLUMN commission_pct_snapshot REAL;
ALTER TABLE service_orders ADD COLUMN razorpay_order_id TEXT;
ALTER TABLE service_orders ADD COLUMN whatsapp_status TEXT DEFAULT 'pending';
ALTER TABLE service_orders ADD COLUMN brand TEXT DEFAULT 'skids';
ALTER TABLE service_orders ADD COLUMN session_url TEXT;
ALTER TABLE service_orders ADD COLUMN session_started_at TEXT;
ALTER TABLE service_orders ADD COLUMN session_ended_at TEXT;

-- ─── provider_slots ───────────────────────────────────
CREATE TABLE IF NOT EXISTS provider_slots (
  id TEXT PRIMARY KEY,
  provider_id TEXT NOT NULL REFERENCES providers(id),
  slot_type TEXT NOT NULL, -- 'recurring' | 'one_off' | 'blocked'
  day_of_week INTEGER,     -- 0=Sun … 6=Sat; NULL for one_off/blocked
  date TEXT,               -- ISO date for one_off slots
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  service_id TEXT REFERENCES services(id),
  is_booked INTEGER DEFAULT 0,
  order_id TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- ─── provider_credentials ─────────────────────────────
CREATE TABLE IF NOT EXISTS provider_credentials (
  id TEXT PRIMARY KEY,
  provider_id TEXT NOT NULL REFERENCES providers(id),
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL, -- 'pdf' | 'image'
  doc_type TEXT NOT NULL,
  uploaded_at TEXT DEFAULT (datetime('now'))
);

-- ─── session_notes ────────────────────────────────────
CREATE TABLE IF NOT EXISTS session_notes (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES service_orders(id),
  provider_id TEXT NOT NULL REFERENCES providers(id),
  note_text TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

-- ─── prescriptions ────────────────────────────────────
CREATE TABLE IF NOT EXISTS prescriptions (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES service_orders(id),
  child_id TEXT NOT NULL REFERENCES children(id),
  provider_id TEXT NOT NULL REFERENCES providers(id),
  medications_json TEXT,
  education_json TEXT,
  nutrition_json TEXT,
  behavioural_json TEXT,
  follow_up_json TEXT,
  issued_at TEXT DEFAULT (datetime('now')),
  whatsapp_sent INTEGER DEFAULT 0
);

-- ─── audit_log ────────────────────────────────────────
-- Append-only: no UPDATE or DELETE should ever be issued against this table
CREATE TABLE IF NOT EXISTS audit_log (
  id TEXT PRIMARY KEY,
  actor_id TEXT NOT NULL,
  action_type TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  previous_value_json TEXT,
  new_value_json TEXT,
  reason TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
