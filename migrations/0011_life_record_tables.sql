-- Life Record Tables for SKIDS Bayesian Projection Engine
-- These tables feed context-builder.ts which assembles LifeRecordContext
-- for the probability engine. The richer the data, the more accurate projections.

-- Birth history — captures prenatal and perinatal context
CREATE TABLE IF NOT EXISTS birth_history (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  child_id TEXT NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  gestational_weeks INTEGER,
  delivery_mode TEXT DEFAULT 'normal', -- normal, cesarean, assisted
  birth_weight INTEGER, -- grams
  birth_length REAL, -- cm
  head_circumference REAL, -- cm
  apgar_score INTEGER,
  nicu_stay INTEGER DEFAULT 0, -- boolean 0/1
  nicu_days INTEGER DEFAULT 0,
  complications TEXT DEFAULT '[]', -- JSON array of strings
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_birth_history_child ON birth_history(child_id);

-- Family history — conditions in biological relatives
CREATE TABLE IF NOT EXISTS family_history (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  child_id TEXT NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  condition TEXT NOT NULL,
  relation TEXT NOT NULL, -- mother, father, sibling, maternal_grandmother, etc.
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_family_history_child ON family_history(child_id);

-- Active conditions — ongoing diagnoses
CREATE TABLE IF NOT EXISTS active_conditions (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  child_id TEXT NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  condition_name TEXT NOT NULL,
  icd10 TEXT,
  status TEXT DEFAULT 'active', -- active, resolved, monitoring
  diagnosed_date TEXT,
  diagnosed_by TEXT,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_active_conditions_child ON active_conditions(child_id);

-- Medications — current and past
CREATE TABLE IF NOT EXISTS medications (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  child_id TEXT NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  medication_name TEXT NOT NULL,
  dosage TEXT,
  frequency TEXT,
  status TEXT DEFAULT 'active', -- active, completed, discontinued
  start_date TEXT,
  end_date TEXT,
  prescribed_by TEXT,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_medications_child ON medications(child_id);

-- Screening results — developmental, vision, hearing, etc.
CREATE TABLE IF NOT EXISTS screening_results (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  child_id TEXT NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  screening_type TEXT NOT NULL, -- e.g., 'vision', 'hearing', 'developmental', 'dental'
  date TEXT NOT NULL,
  result TEXT NOT NULL, -- e.g., 'normal', 'pass', 'refer', 'abnormal'
  findings TEXT DEFAULT '{}', -- JSON object with detailed findings
  screened_by TEXT,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_screening_results_child ON screening_results(child_id);

-- Diet records — nutritional status snapshots
CREATE TABLE IF NOT EXISTS diet_records (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  child_id TEXT NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  breastfed INTEGER DEFAULT 0, -- boolean
  formula_fed INTEGER DEFAULT 0,
  solids_started INTEGER DEFAULT 0,
  food_diversity TEXT, -- JSON array of food groups consumed
  iron_supplement INTEGER DEFAULT 0,
  vitamin_d INTEGER DEFAULT 0,
  calcium_supplement INTEGER DEFAULT 0,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_diet_records_child ON diet_records(child_id);

-- Growth tracks — intervention/monitoring tracks assigned to child
CREATE TABLE IF NOT EXISTS growth_tracks (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  domain TEXT NOT NULL, -- e.g., 'motor', 'language', 'vision'
  title TEXT NOT NULL,
  description TEXT,
  age_period TEXT, -- e.g., '0-6 months'
  age_min_months INTEGER DEFAULT 0,
  age_max_months INTEGER DEFAULT 216,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Growth track progress — child's progress on assigned tracks
CREATE TABLE IF NOT EXISTS growth_track_progress (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  track_id TEXT NOT NULL REFERENCES growth_tracks(id) ON DELETE CASCADE,
  child_id TEXT NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'active', -- active, completed, paused, abandoned
  parent_engagement_score REAL DEFAULT 0,
  flagged_for_ped INTEGER DEFAULT 0,
  started_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_gtp_track_child ON growth_track_progress(track_id, child_id);
CREATE INDEX IF NOT EXISTS idx_gtp_child ON growth_track_progress(child_id);

-- Intervention protocols — standardized intervention definitions
CREATE TABLE IF NOT EXISTS intervention_protocols (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  name TEXT NOT NULL,
  category TEXT, -- e.g., 'home_activity', 'therapy', 'medical'
  condition_name TEXT, -- linked condition
  description TEXT,
  duration_weeks INTEGER,
  frequency TEXT, -- e.g., 'daily', '3x/week'
  instructions TEXT, -- JSON
  created_at TEXT DEFAULT (datetime('now'))
);

-- Intervention assignments — protocols assigned to children
CREATE TABLE IF NOT EXISTS intervention_assignments (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  child_id TEXT NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  intervention_protocol_id TEXT NOT NULL REFERENCES intervention_protocols(id),
  status TEXT DEFAULT 'active', -- active, completed, paused, abandoned
  start_date TEXT DEFAULT (date('now')),
  end_date TEXT,
  assigned_by TEXT,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_ia_child ON intervention_assignments(child_id);

-- Intervention streaks — compliance tracking
CREATE TABLE IF NOT EXISTS intervention_streaks (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  assignment_id TEXT NOT NULL REFERENCES intervention_assignments(id) ON DELETE CASCADE,
  compliance_pct REAL DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  total_done INTEGER DEFAULT 0,
  total_skipped INTEGER DEFAULT 0,
  last_activity_date TEXT,
  updated_at TEXT DEFAULT (datetime('now'))
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_is_assignment ON intervention_streaks(assignment_id);

-- Intervention escalations — when things aren't improving
CREATE TABLE IF NOT EXISTS intervention_escalations (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  child_id TEXT NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  escalation_type TEXT NOT NULL, -- 'low_compliance', 'no_improvement', 'regression', 'doctor_flag'
  severity TEXT DEFAULT 'moderate', -- low, moderate, high, critical
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active', -- active, acknowledged, resolved
  source TEXT, -- what triggered it
  created_at TEXT DEFAULT (datetime('now')),
  resolved_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_ie_child ON intervention_escalations(child_id);

-- Add WHO z-score column to growth_records if not present
-- (context-builder reads who_zscore_json from growth records)
ALTER TABLE growth_records ADD COLUMN who_zscore_json TEXT DEFAULT '{}';
