# Requirements Document

## Introduction

The SKIDS Parent community page currently shows groups with 0 posts, making it feel empty and uninviting. This feature addresses two problems:

1. **Content seeding** — populate the community with real, useful content by converting existing blog articles into pinned discussion-starter posts in the most relevant group. This gives parents something to read and react to immediately on first visit.

2. **Moderated post flow** — when a parent submits a new post, it enters a pending state and is only visible to the author until an admin approves it. This protects the community from spam and inappropriate content while still giving parents immediate feedback that their post was received.

The system builds on the existing `forum_posts` / `forum_groups` schema and the external blog API at `https://9vhd0onw23.execute-api.ap-south-1.amazonaws.com/published-blogs`.

---

## Glossary

- **Seeder**: The admin-triggered process that reads blog articles and creates pinned forum posts from them.
- **Blog_API**: The external REST endpoint that returns published blog articles with fields `blogId`, `title`, `content`, `category`, `tags`, `thumbnail`, `author`, `createdAt`.
- **Forum_Post**: A row in the `forum_posts` table representing a discussion thread in a group.
- **Forum_Group**: A row in the `forum_groups` table representing an age-based or topic-based community group.
- **Seeded_Post**: A Forum_Post created by the Seeder, marked with `source = 'blog'`, `pinned = true`, `status = 'approved'`, `author_name = 'SKIDS Team'`.
- **Parent_Post**: A Forum_Post submitted by an authenticated parent via the CreatePostForm.
- **Moderation_Panel**: The admin UI at `/admin/community` where admins review, approve, or reject pending Parent_Posts.
- **Admin**: An authenticated staff member identified by the `ADMIN_KEY` environment variable.
- **Post_Status**: An enum field on Forum_Post with values `pending`, `approved`, `rejected`.
- **Post_Count**: The count of approved Forum_Posts displayed on a Forum_Group card.
- **Reaction**: A like or "helpful" mark on a Forum_Post, stored in `forum_likes`.

---

## Requirements

### Requirement 1: Database Schema Extension for Moderation

**User Story:** As a developer, I want the forum_posts table to carry moderation metadata, so that the system can distinguish seeded content from parent content and enforce the approval workflow.

#### Acceptance Criteria

1. THE Database SHALL add a `status` column to `forum_posts` with allowed values `pending`, `approved`, `rejected`, defaulting to `pending`.
2. THE Database SHALL add a `pinned` column to `forum_posts` as a boolean, defaulting to `false`.
3. THE Database SHALL add a `source` column to `forum_posts` as text, defaulting to `null`, accepting values `blog` or `null`.
4. THE Database SHALL add a `blog_slug` column to `forum_posts` as text, defaulting to `null`, to record which blog article a Seeded_Post was created from.
5. THE Database SHALL provide a migration file that adds these columns using `ALTER TABLE … ADD COLUMN IF NOT EXISTS` so the migration is safe to run on an existing database.

---

### Requirement 2: Blog Article Seeding Endpoint

**User Story:** As an admin, I want to trigger seeding from blog articles into community groups, so that the community has useful pinned content from day one.

#### Acceptance Criteria

1. WHEN a POST request is made to `/api/admin/community/seed-from-blog` with a valid `Authorization: Bearer <ADMIN_KEY>` header, THE Seeder SHALL fetch all published articles from the Blog_API.
2. WHEN the Blog_API returns articles, THE Seeder SHALL map each article to the single most relevant Forum_Group using the article's `category` and `tags` fields according to the mapping table defined in the design document.
3. WHEN a matching Forum_Group is found for an article, THE Seeder SHALL create a Seeded_Post in that group with `status = 'approved'`, `pinned = true`, `source = 'blog'`, `author_name = 'SKIDS Team'`, and `blog_slug` set to the article's `blogId`.
4. WHEN a Seeded_Post for a given `blog_slug` already exists in the database, THE Seeder SHALL skip that article and not create a duplicate (idempotent behaviour).
5. WHEN the Blog_API is unreachable or returns a non-200 response, THE Seeder SHALL return HTTP 502 with a descriptive error message.
6. WHEN seeding completes, THE Seeder SHALL return a JSON response containing `{ seeded: number, skipped: number, total: number }`.
7. WHEN a request to `/api/admin/community/seed-from-blog` is made without a valid `ADMIN_KEY`, THE Seeder SHALL return HTTP 401.

---

### Requirement 3: Parent Post Submission with Pending Status

**User Story:** As a parent, I want to submit a post to a community group, so that I can share my experience or ask a question, knowing it will be reviewed before going live.

#### Acceptance Criteria

1. WHEN a parent submits a post via `POST /api/forum/posts`, THE Forum_Post SHALL be saved with `status = 'pending'`.
2. WHEN a post is saved with `status = 'pending'`, THE API SHALL return HTTP 201 with the created post object including a `status` field of `'pending'`.
3. WHEN a post is saved with `status = 'pending'`, THE Post_Count on the associated Forum_Group SHALL NOT be incremented.
4. WHEN the CreatePostForm receives a successful response, THE CreatePostForm SHALL display a confirmation message: "Your post has been submitted and is awaiting review."
5. IF a parent submits a post without being authenticated, THEN THE API SHALL return HTTP 401.

---

### Requirement 4: Post Visibility Rules

**User Story:** As a parent, I want to see my own pending posts while browsing my group, so that I know my submission was received, even before it is approved.

#### Acceptance Criteria

1. WHEN `GET /api/forum/posts` is called without authentication, THE API SHALL return only Forum_Posts with `status = 'approved'`.
2. WHEN `GET /api/forum/posts` is called by an authenticated parent, THE API SHALL return all `approved` Forum_Posts plus any `pending` Forum_Posts where `parent_id` matches the authenticated parent's ID.
3. WHEN a pending Forum_Post is returned to its author, THE API SHALL include a `isPending: true` field in the response object.
4. WHEN `GET /api/forum/posts` returns posts for a group, THE API SHALL order results with `pinned = true` posts first, then remaining posts ordered by `created_at` descending.
5. WHEN `GET /api/forum/posts` returns posts for a group, THE API SHALL exclude Forum_Posts with `status = 'rejected'` for all callers except admins.

---

### Requirement 5: Admin Moderation Panel

**User Story:** As an admin, I want a dedicated page to review pending parent posts, so that I can approve or reject them efficiently.

#### Acceptance Criteria

1. THE Moderation_Panel SHALL be accessible at `/admin/community` and require a valid `ADMIN_KEY` query parameter or `Authorization` header.
2. WHEN the Moderation_Panel loads, THE Moderation_Panel SHALL display all Forum_Posts with `status = 'pending'`, showing title, content preview, author name, group name, and submission date.
3. WHEN an admin clicks Approve on a pending post, THE Moderation_Panel SHALL call `POST /api/admin/community/posts/:id/approve`, set `status = 'approved'`, increment the Forum_Group's `post_count` by 1, and remove the post from the pending list.
4. WHEN an admin clicks Reject on a pending post, THE Moderation_Panel SHALL call `POST /api/admin/community/posts/:id/reject`, set `status = 'rejected'`, and remove the post from the pending list.
5. WHEN there are no pending posts, THE Moderation_Panel SHALL display a "No pending posts" empty state.
6. THE Moderation_Panel SHALL also allow admins to create a new post directly in any group, bypassing moderation, with the post saved as `status = 'approved'` immediately.

---

### Requirement 6: Post Approval and Rejection API

**User Story:** As an admin, I want API endpoints to approve or reject posts, so that the moderation panel can update post status reliably.

#### Acceptance Criteria

1. WHEN `POST /api/admin/community/posts/:id/approve` is called with a valid `ADMIN_KEY`, THE API SHALL set the Forum_Post's `status` to `'approved'`, increment the Forum_Group's `post_count` by 1, and return HTTP 200 with the updated post.
2. WHEN `POST /api/admin/community/posts/:id/reject` is called with a valid `ADMIN_KEY`, THE API SHALL set the Forum_Post's `status` to `'rejected'` and return HTTP 200 with the updated post.
3. IF either endpoint is called with an invalid or missing `ADMIN_KEY`, THEN THE API SHALL return HTTP 401.
4. IF either endpoint is called with a post ID that does not exist, THEN THE API SHALL return HTTP 404.

---

### Requirement 7: Rejected Post Visibility for Author

**User Story:** As a parent, I want to know when my post was not approved, so that I understand why it is not visible to others.

#### Acceptance Criteria

1. WHEN `GET /api/forum/posts` is called by an authenticated parent, THE API SHALL include Forum_Posts with `status = 'rejected'` where `parent_id` matches the authenticated parent's ID.
2. WHEN a rejected Forum_Post is returned to its author, THE API SHALL include a `isRejected: true` field in the response object.
3. WHEN the group page renders a post card for the author and `isRejected` is true, THE UI SHALL display the label "Your post was not approved" on that post card.

---

### Requirement 8: Post Count Shows Only Approved Posts

**User Story:** As a parent browsing the community index, I want the post count on each group card to reflect only approved posts, so that the numbers are meaningful.

#### Acceptance Criteria

1. WHEN `GET /api/forum/groups` returns Forum_Groups, THE API SHALL compute `post_count` as the count of Forum_Posts with `status = 'approved'` for each group, rather than reading the stored `post_count` column directly.
2. WHEN a post transitions from `pending` to `approved`, THE System SHALL increment the stored `post_count` on the Forum_Group by 1.
3. WHEN a post transitions from `approved` to `rejected`, THE System SHALL decrement the stored `post_count` on the Forum_Group by 1 (floor 0).

---

### Requirement 9: Reactions Require No Moderation

**User Story:** As a parent, I want to react to posts (like / helpful) without waiting for approval, so that engagement feels immediate.

#### Acceptance Criteria

1. WHEN a parent submits a reaction via the forum likes API, THE System SHALL record the reaction immediately without any moderation step.
2. THE System SHALL allow reactions on Forum_Posts with `status = 'approved'` only.
3. IF a parent attempts to react to a Forum_Post that is not `approved`, THEN THE API SHALL return HTTP 403.

---

### Requirement 10: Group Page Post Ordering

**User Story:** As a parent viewing a group, I want to see pinned blog posts at the top followed by the newest approved parent posts, so that I always see curated content first.

#### Acceptance Criteria

1. WHEN `GET /api/forum/posts` returns posts for a group, THE API SHALL return Seeded_Posts (pinned = true) before non-pinned posts.
2. WHEN `GET /api/forum/posts` returns posts for a group, THE API SHALL order non-pinned approved posts by `created_at` descending (newest first).
3. WHEN `GET /api/forum/posts` returns posts for a group, THE API SHALL order pinned posts by `created_at` ascending (oldest first, so the most foundational articles appear at the top).

---

### Requirement 11: Admin Direct Post Creation

**User Story:** As an admin, I want to create posts directly in any group that are immediately visible, so that I can add announcements or curated content without going through the moderation queue.

#### Acceptance Criteria

1. WHEN `POST /api/admin/community/posts` is called with a valid `ADMIN_KEY`, `groupId`, `title`, and `content`, THE API SHALL create a Forum_Post with `status = 'approved'` and increment the Forum_Group's `post_count`.
2. WHEN an admin post is created, THE API SHALL return HTTP 201 with the created post object.
3. IF `POST /api/admin/community/posts` is called without a valid `ADMIN_KEY`, THEN THE API SHALL return HTTP 401.

---

### Requirement 12: Post Approval Email Notification (Optional)

**User Story:** As a parent, I want to receive an email when my post is approved, so that I know to go back and check the community discussion.

#### Acceptance Criteria

1. WHERE an email notification service is configured, WHEN a Forum_Post transitions to `status = 'approved'`, THE System SHALL send an email to the post author's registered email address notifying them that their post is now live.
2. WHERE an email notification service is configured, THE email SHALL include the post title and a direct link to the group page.
3. IF the parent has no email address on record, THEN THE System SHALL skip the email notification without error.
