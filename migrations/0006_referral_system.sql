-- Migration: 0006_referral_system
-- Adds referral_code and is_champion to parents; creates referrals table

ALTER TABLE parents ADD COLUMN referral_code TEXT UNIQUE;
ALTER TABLE parents ADD COLUMN is_champion INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS referrals (
  id                 TEXT PRIMARY KEY,
  referrer_parent_id TEXT NOT NULL REFERENCES parents(id),
  referee_parent_id  TEXT NOT NULL UNIQUE REFERENCES parents(id),
  created_at         TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_parent_id);
