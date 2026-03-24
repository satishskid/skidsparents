-- Migration: 0007_pricing_tiers
-- Adds pricing_tiers and parent_subscriptions tables for admin-controlled tiered pricing

CREATE TABLE IF NOT EXISTS pricing_tiers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  currency TEXT NOT NULL DEFAULT 'INR',
  amount_cents INTEGER NOT NULL DEFAULT 0,
  amount_yearly_cents INTEGER NOT NULL DEFAULT 0,
  features_json TEXT NOT NULL DEFAULT '[]',
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS parent_subscriptions (
  id TEXT PRIMARY KEY,
  parent_id TEXT NOT NULL REFERENCES parents(id),
  tier_id TEXT NOT NULL REFERENCES pricing_tiers(id),
  status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','expired','cancelled')),
  started_at TEXT DEFAULT (datetime('now')),
  expires_at TEXT,
  payment_id TEXT,
  billing_cycle TEXT NOT NULL DEFAULT 'monthly' CHECK(billing_cycle IN ('monthly','yearly')),
  features_snapshot_json TEXT NOT NULL DEFAULT '[]',
  created_at TEXT DEFAULT (datetime('now'))
);

-- Seed free tier (id='free' so it can be identified by amount_cents=0 check)
INSERT OR IGNORE INTO pricing_tiers (id, name, description, currency, amount_cents, amount_yearly_cents, features_json, is_active)
VALUES (
  'free',
  'Free',
  'Basic access for all parents',
  'INR',
  0,
  0,
  '["pdf_export","health_score_basic"]',
  1
);
