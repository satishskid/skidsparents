# Implementation Plan: Referral System

## Overview

Implement the end-to-end referral system: D1 migration, Drizzle schema, code generation, link construction, landing page, session attribution hook, API routes, and UI wiring.

## Tasks

- [x] 1. Create D1 migration for referral system
  - Create `migrations/0006_referral_system.sql`
  - Add `referral_code TEXT UNIQUE` and `is_champion INTEGER NOT NULL DEFAULT 0` columns to `parents`
  - Create `referrals` table with `id`, `referrer_parent_id` (FK → parents), `referee_parent_id` (FK → parents, UNIQUE), `created_at`
  - Add index `idx_referrals_referrer` on `referrals(referrer_parent_id)`
  - _Requirements: 8.1, 8.2, 8.3_

- [x] 2. Update Drizzle schema
  - [x] 2.1 Add `referralCode` and `isChampion` columns to the `parents` table in `src/lib/db/schema.ts`
    - `referralCode: text('referral_code').unique()`
    - `isChampion: integer('is_champion', { mode: 'boolean' }).default(false)`
    - _Requirements: 1.1, 6.1_
  - [x] 2.2 Add `referrals` table export to `src/lib/db/schema.ts`
    - Mirror the migration: UUID PK, referrer FK, referee FK (unique), createdAt
    - Add `'referral'` to the `contentType` enum in `social_shares`
    - _Requirements: 8.1, 8.2, 5.6_

- [x] 3. Implement referral code generation
  - [x] 3.1 Create `src/lib/referral/generateCode.ts` exporting `generateReferralCode(firebaseUid: string): Promise<string>`
    - SHA-256 hash of UID via `crypto.subtle.digest`
    - Take first 5 bytes, reduce to BigInt, encode base36, pad to 8 chars, slice to 8
    - _Requirements: 1.1, 1.4_
  - [ ]* 3.2 Write property tests for `generateReferralCode` in `src/lib/referral/generateCode.test.ts`
    - **Property 1: Code format** — for any UID string, result matches `/^[0-9a-z]{8}$/`
    - **Validates: Requirements 1.1**
    - **Property 2: Code uniqueness** — for any array of distinct UIDs, generated codes contain no duplicates
    - **Validates: Requirements 1.2**
    - **Property 3: Code determinism** — calling twice with same UID returns identical code
    - **Validates: Requirements 1.3, 1.4**

- [x] 4. Implement referral link construction
  - [x] 4.1 Create `src/lib/referral/buildLink.ts` exporting `buildReferralLink(code: string, medium: 'whatsapp' | 'copy'): string`
    - Base URL `https://parent.skids.clinic/ref/<code>`
    - Append `utm_source=referral`, `utm_medium=<medium>`, `utm_campaign=skids_referral`
    - _Requirements: 2.1, 2.2, 2.3_
  - [ ]* 4.2 Write property tests for `buildReferralLink` in `src/lib/referral/buildLink.test.ts`
    - **Property 4: UTM link construction correctness** — path is `/ref/<code>`, utm_source=referral, utm_medium matches medium, utm_campaign starts with `skids_`
    - **Validates: Requirements 2.1, 2.2, 2.3**
    - **Property 11: WhatsApp message contains correct UTM link** — for any code, link with medium=whatsapp contains utm_medium=whatsapp and utm_campaign=skids_referral
    - **Validates: Requirements 5.5**

- [x] 5. Create referral landing page
  - Create `src/pages/ref/[code].astro` as an SSR page
  - Extract `code` from `Astro.params.code`
  - Query D1: `SELECT id FROM parents WHERE referral_code = ?`
  - If valid: set `Set-Cookie: referralCode=<code>; Path=/; SameSite=Lax; Max-Age=3600` and return HTML that writes `sessionStorage.setItem('referralCode', code)` then redirects to `/login`
  - If invalid: redirect to `/login` with no cookie or sessionStorage write
  - _Requirements: 3.1, 3.2, 3.3_

- [x] 6. Update `LoginForm.tsx` to forward referral code
  - In `src/components/auth/LoginForm.tsx`, read `sessionStorage.getItem('referralCode')` on mount
  - Include `referralCode` in the POST body sent to `/api/auth/session`
  - Clear `sessionStorage.referralCode` after the session POST succeeds
  - _Requirements: 3.2, 3.4_

- [x] 7. Update session API to generate code and trigger attribution
  - In `src/pages/api/auth/session.ts`, after a new parent record is inserted (`isNew = true`):
    - Call `generateReferralCode(decoded.uid)` and run `UPDATE parents SET referral_code = ? WHERE id = ? AND referral_code IS NULL`
    - Read `referralCode` from the request body; if present, fire-and-forget `POST /api/referrals/attribute` with Bearer token
  - _Requirements: 1.1, 1.3, 3.4_

- [x] 8. Create `POST /api/referrals/attribute` route
  - Create `src/pages/api/referrals/attribute.ts` with `export const prerender = false`
  - Authenticate via `getParentId`; return 401 if missing
  - Accept `{ referralCode: string, refereeParentId: string }`; verify caller matches `refereeParentId`
  - Look up referrer: `SELECT id FROM parents WHERE referral_code = ?` → 404 if not found
  - Insert into `referrals`; catch unique constraint violation → return 409
  - `UPDATE parents SET is_champion = 1 WHERE id = referrerParentId AND is_champion = 0`; return `{ ok: true, isNewChampion: boolean }`
  - _Requirements: 7.1, 7.2, 7.4, 7.5, 3.4, 3.5, 3.6_
  - [ ]* 8.1 Write property tests for attribution in `src/pages/api/referrals/attribute.test.ts`
    - **Property 5: Attribution round-trip** — valid code + new referee → row exists in referrals with correct parent IDs
    - **Validates: Requirements 3.4, 7.1**
    - **Property 6: At-most-once attribution** — calling attribute twice for same referee → exactly one row, second call returns 409
    - **Validates: Requirements 3.5, 7.5, 8.2**
    - **Property 7: Champion status set on first attribution** — referrer without isChampion → is_champion=1 after first attribution
    - **Validates: Requirements 3.6, 6.1**
    - **Property 10: Share event recording** — share action inserts social_shares row with correct platform, content_type=referral, utm_campaign=skids_referral
    - **Validates: Requirements 5.6, 5.7**

- [x] 9. Create `GET /api/referrals/stats` route
  - Create `src/pages/api/referrals/stats.ts` with `export const prerender = false`
  - Authenticate via `getParentId` → 401 if missing
  - `SELECT referral_code, is_champion FROM parents WHERE id = ?`; if `referral_code` is null, generate and persist it on-the-fly
  - `SELECT COUNT(*) FROM referrals WHERE referrer_parent_id = ?`
  - `SELECT COUNT(*) FROM social_shares WHERE parent_id = ? AND content_type = 'referral'`
  - Return `{ referralCode, referralLink, signupCount, shareCount, isChampion }`
  - _Requirements: 7.3, 7.6, 4.1, 4.2, 4.4_
  - [ ]* 9.1 Write property tests for stats in `src/pages/api/referrals/stats.test.ts`
    - **Property 9: Stats accuracy** — signupCount equals referrals rows for referrer, shareCount equals social_shares rows with content_type=referral
    - **Validates: Requirements 4.1, 4.2, 7.3**

- [x] 10. Checkpoint — ensure all tests pass
  - Run `npx vitest --run` and confirm no failures before proceeding to UI wiring
  - Ask the user if any questions arise

- [x] 11. Wire `ReferralBanner.tsx` to real API
  - Replace stub state in `src/components/auth/ReferralBanner.tsx` with a `useEffect` that calls `GET /api/referrals/stats` with Bearer token on mount
  - Populate `referralCode`, `referralLink`, `signupCount`, `shareCount`, `isChampion` from response
  - "Copy Link" button: call `buildReferralLink(code, 'copy')`, write to clipboard (with `execCommand` fallback), show "Copied!" for 2500 ms, then POST to `/api/social-shares` with `platform=copy`, `content_type=referral`, `content_id=referralCode`, `utm_campaign=skids_referral`
  - "Share on WhatsApp" button: call `buildReferralLink(code, 'whatsapp')`, open `wa.me/?text=<encoded>` in new tab, POST to `/api/social-shares` with `platform=whatsapp`
  - Render Champion badge above share UI when `isChampion === true`
  - Render nothing when unauthenticated
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 4.1, 4.2, 4.4, 6.3_
  - [ ]* 11.1 Write property tests for champion permanence in `src/lib/db/referrals.test.ts`
    - **Property 8: Champion status permanence** — is_champion=1 is not reverted by deleting or modifying referrals rows
    - **Validates: Requirements 6.4**

- [x] 12. Update `UserProfile.tsx` to show SKIDS Champion badge
  - In `src/components/auth/UserProfile.tsx`, read `isChampion` from the parent record or pass it as a prop
  - Render a "SKIDS Champion" badge element when `isChampion === true`
  - _Requirements: 6.2_

- [x] 13. Write unit tests for `generateCode` and `buildLink`
  - In `src/lib/referral/generateCode.test.ts`, add unit tests:
    - Known UID → known code (snapshot / regression test)
    - Empty string UID does not throw
  - In `src/lib/referral/buildLink.test.ts`, add unit tests:
    - `medium=whatsapp` → URL contains `utm_medium=whatsapp`
    - `medium=copy` → URL contains `utm_medium=copy`
    - `utm_campaign` is always `skids_referral`
    - Path segment matches supplied code
  - _Requirements: 1.1, 1.4, 2.1, 2.2, 2.3_

- [x] 14. Final checkpoint — ensure all tests pass
  - Run `npx vitest --run` and confirm the full suite is green
  - Ask the user if any questions arise

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Property tests use `fast-check` with a minimum of 100 iterations per property
- Each property test must include the tag comment: `// Feature: referral-system, Property <N>: <description>`
- The `AND referral_code IS NULL` guard in the UPDATE makes code generation idempotent
- Attribution is fire-and-forget from the session API — silent failure is acceptable for MVP
