-- Migration: Community & Social Sharing Tables
-- Run: wrangler d1 execute skids-parent-db --file=migrations/0002_community_tables.sql

CREATE TABLE IF NOT EXISTS forum_groups (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('age-based', 'topic-based')),
  description TEXT,
  emoji TEXT,
  member_count INTEGER DEFAULT 0,
  post_count INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS forum_posts (
  id TEXT PRIMARY KEY,
  group_id TEXT NOT NULL REFERENCES forum_groups(id),
  parent_id TEXT NOT NULL REFERENCES parents(id),
  author_name TEXT NOT NULL,
  is_anonymous INTEGER DEFAULT 0,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  is_hidden INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS forum_comments (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL REFERENCES forum_posts(id),
  parent_id TEXT NOT NULL REFERENCES parents(id),
  author_name TEXT NOT NULL,
  is_anonymous INTEGER DEFAULT 0,
  content TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  is_hidden INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS forum_likes (
  id TEXT PRIMARY KEY,
  parent_id TEXT NOT NULL REFERENCES parents(id),
  target_type TEXT NOT NULL CHECK(target_type IN ('post', 'comment')),
  target_id TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(parent_id, target_type, target_id)
);

CREATE TABLE IF NOT EXISTS forum_reports (
  id TEXT PRIMARY KEY,
  parent_id TEXT NOT NULL REFERENCES parents(id),
  target_type TEXT NOT NULL CHECK(target_type IN ('post', 'comment')),
  target_id TEXT NOT NULL,
  reason TEXT,
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'reviewed', 'dismissed')),
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS social_shares (
  id TEXT PRIMARY KEY,
  parent_id TEXT REFERENCES parents(id),
  platform TEXT NOT NULL CHECK(platform IN ('whatsapp', 'instagram', 'facebook', 'twitter', 'linkedin', 'medium', 'copy')),
  content_type TEXT NOT NULL CHECK(content_type IN ('blog', 'organ', 'habit', 'milestone', 'growth', 'intervention')),
  content_id TEXT NOT NULL,
  share_url TEXT NOT NULL,
  utm_campaign TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS whatsapp_subscriptions (
  id TEXT PRIMARY KEY,
  parent_id TEXT NOT NULL REFERENCES parents(id),
  phone TEXT NOT NULL,
  is_subscribed INTEGER DEFAULT 1,
  subscription_type TEXT NOT NULL DEFAULT 'daily_tip' CHECK(subscription_type IN ('daily_tip', 'weekly_digest', 'personalized')),
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  UNIQUE(parent_id, subscription_type)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_forum_posts_group ON forum_posts(group_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_comments_post ON forum_comments(post_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_forum_likes_target ON forum_likes(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_social_shares_parent ON social_shares(parent_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_whatsapp_subs_subscribed ON whatsapp_subscriptions(is_subscribed, subscription_type);
