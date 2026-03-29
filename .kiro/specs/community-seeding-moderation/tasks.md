# Implementation Plan: Community Seeding & Moderation

## Overview

Extend the existing forum schema with moderation metadata, implement admin seeding and moderation endpoints, update public forum APIs to respect post status and ordering, and build the admin moderation panel.

## Tasks

- [x] 1. Database migration and schema update
  - Create `migrations/0008_community_moderation.sql` with `ALTER TABLE forum_posts ADD COLUMN` statements for `status`, `pinned`, `source`, `blog_slug`, and the composite index
  - Update `src/lib/db/schema.ts` to add `status`, `pinned`, `source`, `blogSlug` fields to the `forumPosts` Drizzle table definition
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 2. Blog-to-group mapping utility
  - [x] 2.1 Implement `mapBlogToGroup(category: string, tags: string[]): string` in `src/lib/community/mapBlogToGroup.ts` using the keyword priority table from the design
    - _Requirements: 2.2_

  - [ ]* 2.2 Write property test for blog-to-group mapping
    - **Property 1: Blog-to-group mapping correctness**
    - **Validates: Requirements 2.2**
    - File: `src/__tests__/community/mapBlogToGroup.test.ts`

- [x] 3. Blog seeding endpoint
  - [x] 3.1 Implement `src/pages/api/admin/community/seed-from-blog.ts` — fetch Blog_API, map each article, skip existing `blog_slug`, insert approved pinned posts, return `{ seeded, skipped, total }`
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_

  - [ ]* 3.2 Write property test for seeded post field invariants
    - **Property 2: Seeded post field invariants**
    - **Validates: Requirements 2.3**
    - File: `src/__tests__/community/seedPost.test.ts`

  - [ ]* 3.3 Write property test for seeding idempotence
    - **Property 3: Seeding idempotence**
    - **Validates: Requirements 2.4**
    - File: `src/__tests__/community/seedIdempotent.test.ts`

  - [ ]* 3.4 Write property test for seed response count invariant
    - **Property 4: Seed response count invariant (`seeded + skipped === total`)**
    - **Validates: Requirements 2.6**
    - File: `src/__tests__/community/seedCount.test.ts`

  - [ ]* 3.5 Write unit tests for seeder error conditions
    - Test HTTP 502 when Blog_API is unreachable
    - Test HTTP 401 when ADMIN_KEY is missing or invalid
    - _Requirements: 2.5, 2.7_

- [ ] 4. Checkpoint — ensure migration applies cleanly and seeder unit tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Update `POST /api/forum/posts` to default to pending status
  - Modify `src/pages/api/forum/posts.ts` POST handler to insert with `status = 'pending'` and skip `post_count` increment
  - Return HTTP 201 with the post object including `status: 'pending'`
  - Return HTTP 401 when parent is not authenticated
  - _Requirements: 3.1, 3.2, 3.3, 3.5_

  - [ ]* 5.1 Write property test for parent post defaults to pending
    - **Property 5: Parent post defaults to pending**
    - **Validates: Requirements 3.1, 3.2**
    - File: `src/__tests__/community/postStatus.test.ts`

  - [ ]* 5.2 Write property test for pending post does not increment post_count
    - **Property 6: Pending post does not increment group post_count**
    - **Validates: Requirements 3.3**
    - File: `src/__tests__/community/postCount.test.ts`

- [x] 6. Update `GET /api/forum/posts` for visibility, ordering, and status flags
  - Modify `src/pages/api/forum/posts.ts` GET handler to:
    - Return only `approved` posts for unauthenticated callers
    - Return `approved` + own `pending` + own `rejected` posts for authenticated parents
    - Add `isPending: true` flag on pending posts returned to author
    - Add `isRejected: true` flag on rejected posts returned to author
    - Order: pinned posts first (ascending `created_at`), then non-pinned approved (descending `created_at`)
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 7.1, 7.2, 10.1, 10.2, 10.3_

  - [ ]* 6.1 Write property test for unauthenticated GET returns only approved posts
    - **Property 7: Unauthenticated GET returns only approved posts**
    - **Validates: Requirements 4.1, 4.5**
    - File: `src/__tests__/community/postVisibility.test.ts`

  - [ ]* 6.2 Write property test for authenticated GET returns approved plus own posts
    - **Property 8: Authenticated GET returns approved posts plus own pending and rejected posts**
    - **Validates: Requirements 4.2, 7.1**
    - File: `src/__tests__/community/postVisibility.test.ts`

  - [ ]* 6.3 Write property test for post ordering invariant
    - **Property 9: Post ordering invariant**
    - **Validates: Requirements 4.4, 10.1, 10.2, 10.3**
    - File: `src/__tests__/community/postOrdering.test.ts`

  - [ ]* 6.4 Write property test for status flags on posts returned to author
    - **Property 15: Status flags on posts returned to author**
    - **Validates: Requirements 4.3, 7.2**
    - File: `src/__tests__/community/postFlags.test.ts`

- [x] 7. Update `GET /api/forum/groups` to count only approved posts
  - Modify `src/pages/api/forum/groups.ts` to compute `post_count` from a `COUNT` of `forum_posts` where `status = 'approved'` per group, rather than reading the stored column
  - _Requirements: 8.1_

  - [ ]* 7.1 Write property test for forum groups post_count reflects only approved posts
    - **Property 14: Forum groups post_count reflects only approved posts**
    - **Validates: Requirements 8.1**
    - File: `src/__tests__/community/groupCount.test.ts`

- [ ] 8. Checkpoint — ensure public forum API tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Admin moderation API endpoints
  - [x] 9.1 Implement `src/pages/api/admin/community/posts/index.ts`
    - GET: return all `pending` posts
    - POST: create a post with `status = 'approved'`, increment group `post_count`, return HTTP 201
    - Require valid `ADMIN_KEY`; return HTTP 401 otherwise
    - _Requirements: 5.2, 5.6, 11.1, 11.2, 11.3_

  - [x] 9.2 Implement `src/pages/api/admin/community/posts/[id]/approve.ts`
    - Set `status = 'approved'`, increment group `post_count` by 1, return HTTP 200 with updated post
    - Return HTTP 401 without valid `ADMIN_KEY`; HTTP 404 if post not found
    - _Requirements: 6.1, 6.3, 6.4_

  - [x] 9.3 Implement `src/pages/api/admin/community/posts/[id]/reject.ts`
    - Set `status = 'rejected'`, decrement group `post_count` by 1 (floor 0), return HTTP 200 with updated post
    - Return HTTP 401 without valid `ADMIN_KEY`; HTTP 404 if post not found
    - _Requirements: 6.2, 6.3, 6.4_

  - [ ]* 9.4 Write property test for approve sets status and increments post_count by exactly 1
    - **Property 10: Approve sets status and increments post_count by exactly 1**
    - **Validates: Requirements 6.1, 8.2**
    - File: `src/__tests__/community/moderation.test.ts`

  - [ ]* 9.5 Write property test for reject sets status and decrements post_count (floor 0)
    - **Property 11: Reject sets status and decrements post_count (floor 0)**
    - **Validates: Requirements 6.2, 8.3**
    - File: `src/__tests__/community/moderation.test.ts`

  - [ ]* 9.6 Write property test for admin-created post is immediately approved
    - **Property 12: Admin-created post is immediately approved**
    - **Validates: Requirements 5.6, 11.1**
    - File: `src/__tests__/community/adminPost.test.ts`

  - [ ]* 9.7 Write unit tests for approve/reject error conditions
    - Test HTTP 401 without ADMIN_KEY on both endpoints
    - Test HTTP 404 for unknown post ID on both endpoints
    - _Requirements: 6.3, 6.4_

- [x] 10. Block reactions on non-approved posts
  - Modify the forum likes/reactions API handler to check `status = 'approved'` before recording a reaction; return HTTP 403 with `{ error: 'Reactions are only allowed on approved posts' }` otherwise
  - _Requirements: 9.2, 9.3_

  - [ ]* 10.1 Write property test for reactions blocked on non-approved posts
    - **Property 13: Reactions blocked on non-approved posts**
    - **Validates: Requirements 9.2, 9.3**
    - File: `src/__tests__/community/reactions.test.ts`

- [-] 11. Admin moderation UI
  - [x] 11.1 Create `src/components/admin/CommunityModerationPanel.tsx`
    - Fetch and display pending posts (title, content preview, author name, group name, submission date)
    - Approve button calls `POST /api/admin/community/posts/:id/approve` and removes post from list
    - Reject button calls `POST /api/admin/community/posts/:id/reject` and removes post from list
    - Render "No pending posts" empty state when list is empty
    - Include form to create a new admin post in any group
    - _Requirements: 5.2, 5.3, 5.4, 5.5, 5.6_

  - [ ] 11.2 Create `src/pages/admin/community.astro`
    - Mount `CommunityModerationPanel` with admin auth guard
    - _Requirements: 5.1_

  - [ ]* 11.3 Write unit tests for CommunityModerationPanel
    - Test empty state renders "No pending posts"
    - Test pending post list renders required fields
    - Test admin panel accessible at /admin/community
    - _Requirements: 5.1, 5.2, 5.5_

- [x] 12. Update CreatePostForm confirmation message
  - Modify `src/components/community/CreatePostForm.tsx` to display "Your post has been submitted and is awaiting review." on successful submission
  - _Requirements: 3.4_

  - [ ]* 12.1 Write unit test for CreatePostForm confirmation message
    - Test that the "awaiting review" message renders after successful POST
    - _Requirements: 3.4_

- [x] 13. Update post card UI for rejected posts
  - Modify the community post card component to display "Your post was not approved" label when `isRejected: true` is present on a post returned to its author
  - _Requirements: 7.3_

- [x] 14. Final checkpoint — ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Install `fast-check` before writing property tests: `npm install --save-dev fast-check`
- Each property test should run with `numRuns: 100` and include the comment `// Feature: community-seeding-moderation, Property <N>: <property_text>`
- All admin endpoints reuse the existing `checkAuth` pattern from the codebase
- The migration is safe to run once; re-running is guarded by the Drizzle migration journal
