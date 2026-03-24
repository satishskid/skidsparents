-- Migration: 0005_push_subscriptions
-- Adds push_subscriptions table for FCM token storage

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id            TEXT PRIMARY KEY,
  parent_id     TEXT NOT NULL REFERENCES parents(id),
  fcm_token     TEXT NOT NULL,
  user_agent    TEXT,
  registered_at TEXT NOT NULL DEFAULT (datetime('now')),
  is_active     INTEGER NOT NULL DEFAULT 1
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_push_subscriptions_parent_token
  ON push_subscriptions(parent_id, fcm_token);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_parent_active
  ON push_subscriptions(parent_id, is_active);
