# Requirements Document

## Introduction

The Referral System enables parents on SKIDS Parent (`parent.skids.clinic`) to share the platform with friends and family via a unique referral link. Word-of-mouth is the primary growth channel for Indian health apps. The system generates a unique referral code per parent, creates shareable links with UTM tracking, attributes new signups to referrers, and rewards referrers with a "SKIDS Champion" badge. WhatsApp is the primary sharing channel given the Indian context. This is an MVP — no monetary rewards, no tiered incentives.

## Glossary

- **Referral_System**: The end-to-end feature covering code generation, link sharing, attribution, stats display, and badge reward.
- **Referrer**: An existing authenticated parent who shares their referral link.
- **Referee**: A new user who signs up via a referral link.
- **Referral_Code**: A unique alphanumeric string (8 characters) stored in the `parents.referralCode` column, identifying a Referrer.
- **Referral_Link**: A URL of the form `https://parent.skids.clinic/ref/<code>` that redirects to the signup flow with attribution preserved.
- **Attribution**: The act of recording which Referrer caused a Referee's signup.
- **SKIDS_Champion**: A badge/status granted to a Referrer once at least one Referee completes signup.
- **ReferralBanner**: The React component (`src/components/auth/ReferralBanner.tsx`) that displays the Referral_Link and share options to the Referrer.
- **Referral_Stats**: The count of referrals sent and signups completed, shown to the Referrer.
- **WhatsApp_Share**: A pre-filled WhatsApp message containing the Referral_Link, opened via `wa.me` deep link.
- **UTM_Params**: URL query parameters (`utm_source`, `utm_medium`, `utm_campaign`) appended to the Referral_Link for analytics. Campaigns must start with `skids_`.
- **Referrals_Table**: A new D1 database table (`referrals`) that records each attribution event.

---

## Requirements

### Requirement 1: Referral Code Generation

**User Story:** As a parent, I want a unique referral code automatically assigned to my account, so that I can share it without any manual setup.

#### Acceptance Criteria

1. WHEN a parent account is created and `parents.referralCode` is null, THE Referral_System SHALL generate a unique 8-character alphanumeric referral code and persist it to `parents.referralCode`.
2. THE Referral_System SHALL guarantee that no two parents share the same referral code.
3. WHEN a parent already has a non-null `referralCode`, THE Referral_System SHALL preserve the existing code and not regenerate it.
4. THE Referral_System SHALL generate the referral code deterministically from the parent's Firebase UID using a consistent hashing strategy, so that the code is stable across sessions before it is persisted.

---

### Requirement 2: Referral Link Construction

**User Story:** As a parent, I want a shareable link that includes my referral code and UTM tracking, so that my referrals are correctly attributed and measurable.

#### Acceptance Criteria

1. THE Referral_System SHALL construct the Referral_Link in the format `https://parent.skids.clinic/ref/<code>`.
2. THE Referral_System SHALL append UTM parameters to the Referral_Link: `utm_source=referral`, `utm_medium=whatsapp` (for WhatsApp shares), `utm_medium=copy` (for copy-link), and `utm_campaign=skids_referral`.
3. WHEN the Referral_Link is constructed, THE Referral_System SHALL ensure `utm_campaign` starts with `skids_`.

---

### Requirement 3: Referral Landing and Attribution

**User Story:** As a new user arriving via a referral link, I want the platform to remember who referred me, so that the referrer gets credit for my signup.

#### Acceptance Criteria

1. WHEN a user visits `https://parent.skids.clinic/ref/<code>`, THE Referral_System SHALL validate the code against the `parents.referralCode` column.
2. WHEN the referral code is valid, THE Referral_System SHALL store the code in the browser session (e.g. `sessionStorage`) and redirect the user to the signup/login page.
3. IF the referral code is invalid or not found, THEN THE Referral_System SHALL redirect the user to the signup/login page without storing any attribution data.
4. WHEN a Referee completes Firebase Auth signup and a parent record is created, THE Referral_System SHALL write a row to the `referrals` table recording the Referee's `parentId`, the Referrer's `parentId`, and the timestamp.
5. THE Referral_System SHALL attribute a Referee to at most one Referrer — if a `referrals` row already exists for the Referee's `parentId`, THE Referral_System SHALL not create a duplicate.
6. WHEN attribution is recorded, THE Referral_System SHALL update the Referrer's `SKIDS_Champion` status if the Referrer does not already hold it.

---

### Requirement 4: Referral Stats Display

**User Story:** As a parent, I want to see how many people I've referred and how many have signed up, so that I know the impact of my sharing.

#### Acceptance Criteria

1. THE ReferralBanner SHALL display the total number of referral links the Referrer has shared (share events recorded in `social_shares`).
2. THE ReferralBanner SHALL display the total number of Referees who completed signup via the Referrer's code (rows in `referrals` table).
3. WHEN the Referral_Stats are fetched, THE Referral_System SHALL return the counts within 2 seconds under normal load.
4. WHEN a Referrer has zero referrals, THE ReferralBanner SHALL display a count of zero without error.

---

### Requirement 5: ReferralBanner Share UI

**User Story:** As a parent, I want to see my referral link and share it easily from within the app, so that I can spread the word with minimal friction.

#### Acceptance Criteria

1. THE ReferralBanner SHALL display the Referrer's Referral_Link in a read-only text field.
2. THE ReferralBanner SHALL provide a "Copy Link" button that writes the Referral_Link (with `utm_medium=copy`) to the clipboard.
3. WHEN the "Copy Link" button is activated, THE ReferralBanner SHALL display a confirmation state (e.g. "Copied!") for 2500 milliseconds.
4. THE ReferralBanner SHALL provide a "Share on WhatsApp" button that opens `https://wa.me/?text=<encoded_message>` in a new tab.
5. WHEN the "Share on WhatsApp" button is activated, THE ReferralBanner SHALL include a pre-filled message containing the Referral_Link with `utm_medium=whatsapp` and a human-readable description of SKIDS Parent in the message body.
6. WHEN the "Share on WhatsApp" button is activated, THE Referral_System SHALL record a share event in the `social_shares` table with `platform=whatsapp`, `content_type` set to a referral content type, and `utm_campaign=skids_referral`.
7. WHEN the "Copy Link" button is activated, THE Referral_System SHALL record a share event in the `social_shares` table with `platform=copy` and `utm_campaign=skids_referral`.
8. IF the clipboard API is unavailable, THEN THE ReferralBanner SHALL fall back to a `document.execCommand('copy')` approach to copy the link.
9. THE ReferralBanner SHALL be rendered only when the parent is authenticated.

---

### Requirement 6: SKIDS Champion Badge

**User Story:** As a parent who has referred at least one person who signed up, I want to receive a "SKIDS Champion" badge on my profile, so that my contribution is recognised.

#### Acceptance Criteria

1. WHEN a Referrer's first Referee completes signup, THE Referral_System SHALL set a `isChampion` flag (or equivalent) on the Referrer's parent record.
2. WHEN a parent holds the SKIDS_Champion status, THE Referral_System SHALL display the "SKIDS Champion" badge in the parent's profile view.
3. WHEN a parent holds the SKIDS_Champion status, THE ReferralBanner SHALL display the badge alongside the Referral_Stats.
4. THE SKIDS_Champion status SHALL be permanent once granted — it SHALL NOT be revoked if a Referee later deletes their account.

---

### Requirement 7: Referral Attribution API

**User Story:** As the platform, I need a server-side API to record and query referral data, so that attribution is authoritative and not spoofable by the client.

#### Acceptance Criteria

1. THE Referral_System SHALL expose a `POST /api/referrals/attribute` endpoint that accepts `{ referralCode: string, refereeParentId: string }` and records the attribution.
2. WHEN `POST /api/referrals/attribute` is called, THE Referral_System SHALL verify the caller is authenticated as the Referee being attributed.
3. THE Referral_System SHALL expose a `GET /api/referrals/stats` endpoint that returns `{ referralCode, referralLink, signupCount, shareCount, isChampion }` for the authenticated parent.
4. IF `POST /api/referrals/attribute` is called with a referral code that does not match any parent, THEN THE Referral_System SHALL return HTTP 404 with a descriptive error message.
5. IF `POST /api/referrals/attribute` is called for a Referee who already has an attribution record, THEN THE Referral_System SHALL return HTTP 409 and not create a duplicate record.
6. WHEN `GET /api/referrals/stats` is called by an unauthenticated request, THE Referral_System SHALL return HTTP 401.

---

### Requirement 8: Referrals Database Table

**User Story:** As the platform, I need a `referrals` table to persist attribution data, so that referral relationships are durable and queryable.

#### Acceptance Criteria

1. THE Referral_System SHALL define a `referrals` table in the Drizzle ORM schema with columns: `id` (UUID PK), `referrerParentId` (FK → `parents.id`), `refereeParentId` (FK → `parents.id`, unique), `createdAt`.
2. THE Referral_System SHALL enforce a unique constraint on `refereeParentId` so that each Referee can only be attributed to one Referrer.
3. THE Referral_System SHALL provide a D1 migration file for the `referrals` table.
