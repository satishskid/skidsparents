-- Migration: Community Moderation Columns
-- Adds status, pinned, source, blog_slug to forum_posts

ALTER TABLE forum_posts ADD COLUMN status TEXT NOT NULL DEFAULT 'approved'
  CHECK(status IN ('pending', 'approved', 'rejected'));
ALTER TABLE forum_posts ADD COLUMN pinned INTEGER NOT NULL DEFAULT 0;
ALTER TABLE forum_posts ADD COLUMN source TEXT DEFAULT NULL;
ALTER TABLE forum_posts ADD COLUMN blog_slug TEXT DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_forum_posts_status
  ON forum_posts(group_id, status, pinned, created_at);
