-- Migration: Make parent_id nullable for system posts
-- Allows blog posts and admin posts to have NULL parent_id

-- SQLite doesn't support ALTER COLUMN directly, so we need to:
-- 1. Create a new table with the modified schema
-- 2. Copy data
-- 3. Drop old table
-- 4. Rename new table

-- Create new table with nullable parent_id
CREATE TABLE forum_posts_new (
  id TEXT PRIMARY KEY,
  group_id TEXT NOT NULL REFERENCES forum_groups(id),
  parent_id TEXT REFERENCES parents(id),  -- Now nullable
  author_name TEXT NOT NULL,
  is_anonymous INTEGER DEFAULT 0,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  is_hidden INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'approved' CHECK(status IN ('pending', 'approved', 'rejected')),
  pinned INTEGER NOT NULL DEFAULT 0,
  source TEXT DEFAULT NULL,
  blog_slug TEXT DEFAULT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Copy all existing data
INSERT INTO forum_posts_new 
SELECT id, group_id, parent_id, author_name, is_anonymous, title, content, 
       likes, comment_count, is_hidden, status, pinned, source, blog_slug, 
       created_at, updated_at
FROM forum_posts;

-- Drop old table
DROP TABLE forum_posts;

-- Rename new table
ALTER TABLE forum_posts_new RENAME TO forum_posts;

-- Recreate index
CREATE INDEX IF NOT EXISTS idx_forum_posts_status
  ON forum_posts(group_id, status, pinned, created_at);
