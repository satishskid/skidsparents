-- Pilot Program Tables

CREATE TABLE IF NOT EXISTS pilot_invitations (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  invite_code TEXT NOT NULL UNIQUE,
  parent_phone TEXT,
  parent_email TEXT,
  parent_name TEXT,
  child_qr_code TEXT,
  assigned_doctor_id TEXT REFERENCES doctors(id),
  assigned_manager_id TEXT,
  status TEXT DEFAULT 'pending',
  pilot_group TEXT DEFAULT 'wave_1',
  source TEXT DEFAULT 'screening',
  notes TEXT,
  accepted_at TEXT,
  parent_id TEXT REFERENCES parents(id),
  child_id TEXT REFERENCES children(id),
  created_at TEXT DEFAULT (datetime('now')),
  expires_at TEXT
);

CREATE TABLE IF NOT EXISTS pilot_groups (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  max_capacity INTEGER DEFAULT 50,
  current_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  default_doctor_id TEXT REFERENCES doctors(id),
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS pilot_engagement_log (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  parent_id TEXT NOT NULL,
  child_id TEXT,
  event_type TEXT NOT NULL,
  event_data_json TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS ped_applications (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  clinic_name TEXT,
  clinic_address TEXT,
  city TEXT DEFAULT 'Bangalore',
  lat REAL,
  lng REAL,
  specialty TEXT DEFAULT 'pediatrician',
  license_number TEXT,
  experience_years INTEGER,
  motivation TEXT,
  status TEXT DEFAULT 'applied',
  approved_doctor_id TEXT REFERENCES doctors(id),
  nearby_parent_count INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_pilot_inv_code ON pilot_invitations(invite_code);
CREATE INDEX IF NOT EXISTS idx_pilot_inv_status ON pilot_invitations(status);
CREATE INDEX IF NOT EXISTS idx_pilot_inv_phone ON pilot_invitations(parent_phone);
CREATE INDEX IF NOT EXISTS idx_pilot_inv_group ON pilot_invitations(pilot_group);
CREATE INDEX IF NOT EXISTS idx_pilot_inv_doctor ON pilot_invitations(assigned_doctor_id);
CREATE INDEX IF NOT EXISTS idx_pilot_groups_status ON pilot_groups(status);
CREATE INDEX IF NOT EXISTS idx_pilot_engage_parent ON pilot_engagement_log(parent_id);
CREATE INDEX IF NOT EXISTS idx_pilot_engage_type ON pilot_engagement_log(event_type);
CREATE INDEX IF NOT EXISTS idx_pilot_engage_created ON pilot_engagement_log(created_at);
CREATE INDEX IF NOT EXISTS idx_ped_app_status ON ped_applications(status);
CREATE INDEX IF NOT EXISTS idx_ped_app_city ON ped_applications(city);
CREATE INDEX IF NOT EXISTS idx_ped_app_phone ON ped_applications(phone);
