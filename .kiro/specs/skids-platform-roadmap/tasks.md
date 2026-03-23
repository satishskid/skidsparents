# Implementation Plan: SKIDS Platform Roadmap

## Overview

Incremental build-out of the three remaining pillars of the SKIDS marketplace. Each phase builds on the previous — schema first, then payments, then booking, then the teleconsult session room (highest-priority clinical surface), then provider portal, admin extensions, and finally the marketing site.

## Tasks

- [x] 1. Phase 1 — DB schema additions and migrations
  - [x] 1.1 Add new columns to `providers` table in `src/lib/db/schema.ts`
    - Add `firebaseUid` (text, unique), `status` (enum: pending_review | active | suspended), `feeStructureJson` (text), `medicalRegNumber` (text)
    - _Requirements: 3.1, 3.7_

  - [x] 1.2 Add new columns to `serviceOrders` table in `src/lib/db/schema.ts`
    - Add `slotId` (text, FK → provider_slots), `commissionPctSnapshot` (real), `razorpayOrderId` (text), `whatsappStatus` (enum: pending | sent | delivered | failed), `brand` (text, default 'skids'), `sessionUrl` (text), `sessionStartedAt` (text), `sessionEndedAt` (text)
    - _Requirements: 6.2, 6.6, 7.7, 9.2, 12.4_

  - [x] 1.3 Add `providerSlots` table to `src/lib/db/schema.ts`
    - Fields: id, providerId (FK), slotType (enum: recurring | one_off | blocked), dayOfWeek (int nullable), date (text nullable), startTime, endTime, serviceId (FK nullable), isBooked (boolean), orderId (text nullable), createdAt
    - _Requirements: 5.1, 5.2, 5.3_

  - [x] 1.4 Add `providerCredentials` table to `src/lib/db/schema.ts`
    - Fields: id, providerId (FK), fileUrl, fileType (enum: pdf | image), docType, uploadedAt
    - _Requirements: 3.3_

  - [x] 1.5 Add `sessionNotes` table to `src/lib/db/schema.ts`
    - Fields: id, orderId (FK), providerId (FK), noteText, createdAt
    - _Requirements: 4.5, 4.6_

  - [x] 1.6 Add `prescriptions` table to `src/lib/db/schema.ts`
    - Fields: id, orderId (FK), childId (FK), providerId (FK), medicationsJson, educationJson, nutritionJson, behaviouralJson, followUpJson, issuedAt, whatsappSent (boolean)
    - _Requirements: 4.5, 4.6_

  - [x] 1.7 Add `auditLog` table to `src/lib/db/schema.ts`
    - Fields: id, actorId, actionType (enum of all admin actions), targetType (enum: provider | order | phr), targetId, previousValueJson, newValueJson, reason, createdAt
    - No UPDATE or DELETE operations must ever be issued against this table
    - _Requirements: 11.1, 11.2, 11.3_

  - [x] 1.8 Write migration SQL file `migrations/0003_platform_roadmap.sql`
    - ALTER TABLE statements for providers and service_orders column additions
    - CREATE TABLE statements for provider_slots, provider_credentials, session_notes, prescriptions, audit_log
    - _Requirements: 1.1–1.7 above_

  - [ ]* 1.9 Write property test for commission snapshot immutability (Property 4)
    - **Property 4: Commission snapshot immutability**
    - Create order with commissionPctSnapshot, update provider commission_pct, re-query order — snapshot must be unchanged
    - **Validates: Requirements 9.2**

- [x] 2. Phase 2 — Razorpay payment integration

  - [x] 2.1 Implement pure utility functions in `src/lib/payments.ts`
    - `verifyRazorpaySignature(secret, body, sig): Promise<boolean>` — HMAC-SHA256 using Web Crypto API
    - `calculateProviderPayout(amountCents, commissionPct): number`
    - `calculateCommission(amountCents, commissionPct): number`
    - `isValidOrderTransition(from, to): boolean` — enforces pending→confirmed→scheduled→in_progress→completed; cancelled reachable from any non-completed state
    - _Requirements: 6.5, 8.7, 9.1, 9.4_

  - [ ]* 2.2 Write property test for order lifecycle transitions (Property 1)
    - **Property 1: Order lifecycle is strictly sequential**
    - Use `fc.constantFrom` over all status pairs; assert `isValidOrderTransition` matches the valid transition set
    - **Validates: Requirements 8.7**

  - [ ]* 2.3 Write property test for commission round-trip integrity (Property 3)
    - **Property 3: Commission round-trip financial integrity**
    - For arbitrary `amountCents` (1–10,000,000) and `commissionPct` (0–50): `payout + commission === amountCents`
    - **Validates: Requirements 9.4**

  - [ ]* 2.4 Write property test for Razorpay webhook signature verification (Property 7)
    - **Property 7: Razorpay webhook HMAC verification**
    - Valid sig on original body → true; same sig on tampered body → false
    - **Validates: Requirements 6.5**

  - [x] 2.5 Implement `POST /api/payments/create-order` in `src/pages/api/payments/create-order.ts`
    - Authenticate parent via `getParentId`; validate serviceId, childId, providerId, slotId in request body
    - Call Razorpay Orders API (`POST https://api.razorpay.com/v1/orders`) with `amount`, `currency: 'INR'`, `receipt`
    - Insert `service_orders` row (status=pending, razorpay_order_id, commission_pct_snapshot copied from provider, brand='skids')
    - Return `{ razorpayOrderId, amount, currency, serviceOrderId, keyId }`
    - _Requirements: 6.1, 6.2, 7.7, 9.2_

  - [x] 2.6 Implement `POST /api/payments/verify` in `src/pages/api/payments/verify.ts`
    - Authenticate parent; verify HMAC signature of `razorpay_payment_id|razorpay_order_id` using `RAZORPAY_KEY_SECRET`
    - Update order status pending→confirmed, store `payment_id` and `amount_cents`
    - Trigger WhatsApp confirmation to parent via BHASH API (order ID, service name, child name, scheduled time)
    - Emit `purchase_initiated` analytics event with brand=skids, service_slug, amount_cents, child_age_months
    - _Requirements: 6.3, 6.5, 6.6, 6.7, 7.7, 13.5_

  - [x] 2.7 Implement `POST /api/payments/webhook` in `src/pages/api/payments/webhook.ts`
    - No auth header — verify Razorpay HMAC from raw body + `x-razorpay-signature`
    - Idempotent: if order already confirmed, return 200 without re-processing
    - On valid payment.captured event: same confirm logic as verify endpoint
    - _Requirements: 6.3, 6.5_

  - [x] 2.8 Implement `POST /api/payments/refund` in `src/pages/api/payments/refund.ts`
    - ADMIN_KEY auth; call Razorpay Refunds API for full `amount_cents`; write audit_log entry
    - _Requirements: 8.5, 8.6_

  - [x] 2.9 Checkpoint — Ensure all tests pass, ask the user if questions arise.

- [x] 3. Phase 3 — Booking flow (parent side)

  - [x] 3.1 Implement `GET /api/bookings/providers` in `src/pages/api/bookings/providers.ts`
    - Authenticate parent; accept `serviceId` query param; return verified providers with available slots
    - _Requirements: 7.3_

  - [x] 3.2 Implement `GET /api/bookings/slots` in `src/pages/api/bookings/slots.ts`
    - Authenticate parent; accept `serviceId`, `providerId`, `date` query params
    - Return non-booked, non-blocked slots for that provider+service on that date
    - _Requirements: 5.4, 7.3_

  - [ ]* 3.3 Write property test for slot exclusivity (Property 8)
    - **Property 8: Slot exclusivity after booking**
    - Book a slot with order-1; attempt to book same slot with order-2 → must return 409
    - **Validates: Requirements 5.3**

  - [x] 3.4 Implement `GET /api/bookings/orders` in `src/pages/api/bookings/orders.ts`
    - Authenticate parent; return all service_orders for that parent with service and provider details joined
    - _Requirements: 7.6_

  - [x] 3.5 Implement `GET /api/session/:orderId/token` in `src/pages/api/session/[orderId]/token.ts`
    - Authenticate parent via `getParentId`; verify order belongs to parent and status is `in_progress`
    - Generate LiveKit JWT for parent using `LIVEKIT_API_KEY` + `LIVEKIT_API_SECRET`; room = `skids-{orderId}`
    - Return `{ token, roomName, livekitUrl }`
    - _Requirements: 7.6_

  - [x] 3.5 Build `BookingFlow` React component in `src/components/services/BookingFlow.tsx`
    - 5-step wizard: ServiceSelector → ChildSelector → ProviderSlotPicker → OrderSummary → PaymentGate
    - `ServiceSelector`: fetch `/api/services`, render ServiceCard grid (name, price INR, delivery type, category)
    - `ChildSelector`: fetch `/api/children`, render ChildCard list
    - `ProviderSlotPicker`: fetch `/api/bookings/providers` + `/api/bookings/slots`, render ProviderCard + SlotCalendar
    - `OrderSummary`: display service, child, provider, slot, price; T&C checkbox
    - `PaymentGate`: call `/api/payments/create-order`, load Razorpay JS SDK, open modal; on success call `/api/payments/verify`; on failure show retry
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

  - [x] 3.6 Create Astro page `src/pages/book.astro`
    - SSR page mounting `<BookingFlow client:load />`; requires Firebase auth (redirect to login if unauthenticated)
    - _Requirements: 7.1_

  - [x] 3.7 Create Astro page `src/pages/session/[orderId].astro`
    - Parent-facing session join page; calls `GET /api/session/:orderId/token` to get a LiveKit JWT for the parent
    - Mounts `<ParentSessionRoom client:load />` which connects to LiveKit room `skids-{orderId}`
    - Shows "Waiting for doctor to start session" state when order status is not `in_progress`
    - _Requirements: 7.6_

  - [x] 3.8 Checkpoint — Ensure all tests pass, ask the user if questions arise.

- [x] 4. Phase 4 — Teleconsultation session room (highest priority clinical surface)

  - [x] 4.1 Implement provider auth helper `src/pages/api/provider/_auth.ts`
    - `getProviderId(request, env): Promise<string | null>` — mirrors `getParentId` pattern
    - Verify Firebase JWT, look up `providers` table by `firebase_uid` where `is_verified = 1`
    - Return null (→ 401) for unrecognised uid; return 403 body `{ error: 'Account pending review' }` for unverified provider
    - _Requirements: 3.5_

  - [x] 4.2 Implement `POST /api/provider/orders/:id/session/start` in `src/pages/api/provider/orders/[id]/session/start.ts`
    - Authenticate provider via `getProviderId`; verify order belongs to provider and status is `scheduled`
    - Generate LiveKit JWT access token for doctor using `LIVEKIT_API_KEY` + `LIVEKIT_API_SECRET`; room name = `skids-{orderId}`
    - Token grants: `canPublish: true, canSubscribe: true, roomJoin: true`; TTL = 2 hours
    - Store room name in `service_orders.session_url` (as `skids-{orderId}`); update order status `scheduled → in_progress`; record `session_started_at`
    - Return `{ roomName, token, livekitUrl: env.LIVEKIT_URL }`
    - Fallback: if token generation fails, return 200 with `{ token: null, fallback: true }` so doctor can paste a Google Meet link
    - _Requirements: 4.1, 8.7_

  - [x] 4.3 Implement `GET /api/provider/orders/:id/ai-brief` in `src/pages/api/provider/orders/[id]/ai-brief.ts`
    - Authenticate provider; verify active order; check KV cache (`ai-brief:{orderId}`) — return cached if present
    - Fetch child PHR (growth, milestones, vaccinations, observations) from D1
    - Build structured prompt and call AI router (`src/lib/ai/router.ts`) to generate clinical brief with DDx, red flags, vaccination gaps, nutrition note
    - Cache result in KV with TTL = session duration; return structured `{ childSummary, aiSuggestions }`
    - _Requirements: 4.3_

  - [x] 4.4 Implement `POST /api/provider/orders/:id/ai-assist` in `src/pages/api/provider/orders/[id]/ai-assist.ts`
    - Authenticate provider; accept `{ query: string }` body
    - Inject child PHR context + doctor's free-form query into AI router; stream or return response
    - _Requirements: 4.3_

  - [x] 4.5 Implement `POST /api/provider/orders/:id/prescription` in `src/pages/api/provider/orders/[id]/prescription.ts`
    - Authenticate provider; validate all 5 sections present (medications, education, nutrition, behavioural, followUp) — reject 400 if any missing
    - Insert row into `prescriptions` table; update order status `in_progress → completed`; record `session_ended_at`
    - Send WhatsApp prescription summary to parent via BHASH API; set `whatsapp_sent = true` on prescription row
    - _Requirements: 4.5, 4.6, 12.1_

  - [ ]* 4.6 Write property test for prescription completeness (Property 9)
    - **Property 9: Prescription completeness before order completion**
    - For arbitrary prescriptions missing any one of the 5 sections, the save endpoint must reject with 400; only all-5-present prescriptions may complete the order
    - **Validates: Requirements 4.5, 4.6**

  - [x] 4.7 Implement `GET /api/children/:childId/prescriptions` in `src/pages/api/children/[childId]/prescriptions.ts`
    - Authenticate parent via `getParentId`; verify child belongs to parent
    - Return all prescriptions for that child ordered by `issued_at` desc
    - _Requirements: 4.3_

  - [x] 4.8 Build `SessionRoom` React component in `src/components/teleconsult/SessionRoom.tsx`
    - Split layout: video left (`@livekit/components-react` `<LiveKitRoom>` + `<VideoConference>` using room token), clinical panel right
    - Fetch LiveKit token from `POST .../session/start` on mount; connect to `env.LIVEKIT_URL`
    - `<VideoConference>` renders pre-built controls (mute, camera, screen share, chat) — WhatsApp-style UX out of the box
    - Clinical panel tabs: PHR Summary, AI Assist, Prescription Builder
    - PHR Summary: fetch `/api/provider/phr/:childId` — display growth, milestones, vaccinations, flagged observations
    - AI Assist: display pre-fetched AI brief on load; free-form query input → `POST .../ai-assist` → stream response
    - Prescription Builder: 5 accordion sections (medications, education, nutrition, behavioural, follow-up); AI pre-fill buttons for nutrition and behavioural sections; drug name input with weight-based dose suggestion via AI assist
    - "End & Send Prescription" button → `POST .../prescription` → on success show confirmation toast
    - Mobile responsive: video top half, clinical panel scrollable bottom half
    - _Requirements: 4.1, 4.2, 4.3, 4.5, 4.6_

  - [x] 4.9 Create Astro page `src/pages/provider/orders/[id]/session.astro`
    - SSR; authenticate provider (redirect to `/provider/login` if not); mount `<SessionRoom client:load />`
    - _Requirements: 4.1_

  - [x] 4.10 Update `src/components/phr/RecordsTimeline.tsx` to display prescriptions
    - Fetch `/api/children/:childId/prescriptions`; render each prescription as a timeline card with all 5 sections expandable
    - Referrals in `followUp.referrals` render as links to SKIDS service pages (e.g. `/interventions/chatter`)
    - _Requirements: 4.3_

  - [x] 4.11 Checkpoint — Ensure all tests pass, ask the user if questions arise.

- [x] 5. Phase 5 — Provider portal

  - [x] 5.1 Implement `POST /api/provider/signup` in `src/pages/api/provider/signup.ts`
    - No auth required; collect name, medicalRegNumber, specializations, city, contactEmail, contactPhone, feeStructureJson
    - Insert provider row with `is_verified = false`, `status = 'pending_review'`; notify admin via existing BHASH pattern
    - _Requirements: 3.1, 3.2, 3.4_

  - [x] 5.2 Implement `GET /api/provider/me` and provider order/earnings routes
    - `GET /api/provider/me` — return provider profile for authenticated provider
    - `GET /api/provider/orders` — orders assigned to this provider, grouped by status
    - `GET /api/provider/earnings` — aggregate: total sessions, gross earnings, commission deducted, net payout (all from service_orders)
    - `POST /api/provider/orders/:id/note` — insert session_notes row; order must be in_progress or completed
    - `POST /api/provider/orders/:id/complete` — transition in_progress → completed; requires at least one session_note
    - _Requirements: 4.1, 4.5, 4.6, 4.7_

  - [x] 5.3 Implement PHR access gate `GET /api/provider/phr/:childId` in `src/pages/api/provider/phr/[childId].ts`
    - Authenticate provider; check for active order (status not in cancelled/completed) linking provider to child
    - If no active order: return 403 `{ error: 'No active order for this patient' }` + write audit_log entry with `action_type = 'phr_access_denied'`
    - If active: return child PHR summary (growth latest, milestones, vaccinations, flagged observations)
    - _Requirements: 4.3, 4.4_

  - [ ]* 5.4 Write property test for PHR access gate (Property 5)
    - **Property 5: PHR access requires active order**
    - For arbitrary provider+child pairs with order status in {cancelled, completed} → 403; status in {confirmed, scheduled, in_progress} → 200
    - **Validates: Requirements 4.3, 4.4**

  - [x] 5.5 Implement slot management routes in `src/pages/api/provider/slots/`
    - `GET /api/provider/slots` — return provider's own slots
    - `POST /api/provider/slots` — create recurring or one_off slot; validate no overlap with existing non-blocked slots
    - `DELETE /api/provider/slots/:id` — block/delete slot only if `is_booked = false`; return 409 if already booked
    - _Requirements: 5.1, 5.2_

  - [x] 5.6 Implement `POST /api/provider/credentials` in `src/pages/api/provider/credentials.ts`
    - Authenticate provider; reject files > 10 MB with 413 before touching R2
    - Upload to R2 under `credentials/{providerId}/{uuid}.{ext}`; insert `provider_credentials` row
    - _Requirements: 3.3_

  - [x] 5.7 Build `ProviderApp` React component tree in `src/components/provider/`
    - `ProviderDashboard.tsx` — OrderList grouped by status (each OrderCard shows service, child name, scheduled_at, status); EarningsSummary widget
    - `OrderDetail.tsx` — PatientContext (PHR summary from `/api/provider/phr/:childId`), SessionNoteForm (textarea + submit), "Start Session" button → calls session/start then navigates to session room
    - `AvailabilityManager.tsx` — WeeklySlotGrid (7-day grid, click to add/block slot), BlockedDatePicker
    - `ProviderProfile.tsx` — read-only profile fields; CredentialUpload (file input → `/api/provider/credentials`)
    - _Requirements: 3.5, 4.1, 4.2, 4.5, 5.1, 5.2_

  - [x] 5.8 Create Astro pages for provider portal under `src/pages/provider/`
    - `index.astro` — mounts `<ProviderDashboard client:load />`
    - `orders/[id].astro` — mounts `<OrderDetail client:load />`
    - `availability.astro` — mounts `<AvailabilityManager client:load />`
    - `profile.astro` — mounts `<ProviderProfile client:load />`
    - `signup.astro` — unauthenticated; mounts `<ProviderSignupForm client:load />`
    - `login.astro` — Firebase Auth login for providers
    - All authenticated pages redirect to `/provider/login` if no valid provider session
    - _Requirements: 3.1, 3.5, 4.1_

  - [x] 5.9 Checkpoint — Ensure all tests pass, ask the user if questions arise.

- [x] 6. Phase 6 — Admin extensions (D2C Manager layer)

  - [x] 6.1 Implement provider management admin routes in `src/pages/api/admin/`
    - `GET /api/admin/providers` — list all providers with status, specializations, city, commission_pct, order count
    - `POST /api/admin/providers/:id/approve` — set `is_verified = true`, `status = 'active'`; send WhatsApp to provider; write audit_log
    - `POST /api/admin/providers/:id/suspend` — set `is_verified = false`, `status = 'suspended'`; write audit_log
    - `PATCH /api/admin/providers/:id/commission` — update `commission_pct` (0–50 range validation); write audit_log with previous and new value
    - All routes: ADMIN_KEY bearer auth
    - _Requirements: 10.1, 10.2, 10.3, 9.5_

  - [x] 6.2 Implement order management admin routes in `src/pages/api/admin/`
    - `GET /api/admin/orders` — all orders with filters: status, serviceId, providerId, date range
    - `POST /api/admin/orders/:id/reassign` — update `provider_id`; only when status is confirmed or scheduled; write audit_log
    - `POST /api/admin/orders/:id/status` — manual status update with mandatory `reason`; enforce `isValidOrderTransition`; write audit_log
    - `POST /api/admin/orders/:id/cancel` — cancel order; trigger refund via `/api/payments/refund`; send WhatsApp to parent; write audit_log
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7_

  - [x] 6.3 Implement revenue and supply monitoring routes
    - `GET /api/admin/revenue` — return: total GMV, total commission, total provider payouts — all from completed service_orders; breakdown by service category and period
    - `GET /api/admin/supply` — for each active service type, count verified providers with non-booked slots in next 7 days; flag any service type with count < 2
    - _Requirements: 9.3, 10.4, 10.5, 13.4_

  - [ ]* 6.4 Write property test for supply alert threshold (Property 10)
    - **Property 10: Supply alert threshold**
    - For arbitrary sets of providers per service type: if verified providers with slots < 2, service must appear in alert list
    - **Validates: Requirements 10.5**

  - [x] 6.5 Implement `GET /api/admin/audit-log` in `src/pages/api/admin/audit-log.ts`
    - ADMIN_KEY auth; accept filters: actorId, actionType, targetType, targetId, date range
    - Return entries ordered by `created_at` desc; never expose via any public endpoint
    - _Requirements: 11.4, 11.5_

  - [ ]* 6.6 Write property test for audit log append-only invariant (Property 6)
    - **Property 6: Audit log is append-only**
    - Create audit log entry; attempt UPDATE and DELETE on that row; verify entry is unchanged and deletions are rejected
    - **Validates: Requirements 11.2**

  - [x] 6.7 Build admin React components in `src/components/admin/`
    - `ProviderManager.tsx` — table of all providers; approve/suspend buttons; commission edit inline; links to credential docs
    - `OrderManager.tsx` — filterable order table; reassign provider modal; manual status update modal (with reason field); cancel + refund action
    - `RevenueDashboard.tsx` — GMV total, commission earned, provider payouts; breakdown by service category; supply alert cards for under-served service types
    - `AuditLogViewer.tsx` — filterable audit log table; read-only; no edit/delete controls
    - _Requirements: 8.1–8.6, 9.3, 10.1–10.5, 11.4_

  - [x] 6.8 Create admin Astro pages extending `src/pages/admin/`
    - `providers.astro` — mounts `<ProviderManager client:load />`
    - `orders.astro` — mounts `<OrderManager client:load />`
    - `revenue.astro` — mounts `<RevenueDashboard client:load />`
    - `audit.astro` — mounts `<AuditLogViewer client:load />`
    - All pages: ADMIN_KEY session check (same pattern as existing admin pages)
    - _Requirements: 8.1, 9.3, 10.1, 11.4_

  - [x] 6.9 Implement WhatsApp retry worker in `cron-worker/index.ts`
    - Extend existing cron worker to query service_orders where `whatsapp_status = 'pending'` and `created_at < now - 5min`
    - Retry BHASH delivery up to 3 times with exponential backoff (1 min, 2 min, 4 min); update `whatsapp_status` to sent/failed
    - _Requirements: 12.3, 12.4_

  - [ ]* 6.10 Write property test for payment confirmation precedes scheduling (Property 2)
    - **Property 2: Payment confirmation precedes scheduling**
    - For arbitrary orders with status in {scheduled, in_progress, completed}: assert `payment_id !== null && amount_cents > 0`
    - **Validates: Requirements 6.8_

  - [x] 6.11 Checkpoint — Ensure all tests pass, ask the user if questions arise.

- [x] 7. Phase 7 — Marketing site (`skids.clinic`)

  - [x] 7.1 Scaffold `marketing/` Astro project in this monorepo
    - `marketing/astro.config.mjs` with `output: 'static'`, Tailwind CSS v4
    - `marketing/package.json` with Astro 5 + Tailwind dependencies
    - Shared content imports from `../src/lib/content/organs.ts` and `../src/lib/content/habits.ts` via path alias
    - _Requirements: 1.1, 1.7_

  - [x] 7.2 Build marketing site pages in `marketing/src/pages/`
    - `index.astro` — hero ("Indian pediatrics is reactive; SKIDS is proactive thrive care"), dual CTA (I'm a Parent / I'm a Doctor), philosophy section, teaser content row
    - `for-parents.astro` — parent value prop, PHR feature highlights, lead capture form
    - `for-doctors.astro` — provider value prop, earnings model, signup CTA
    - `blog/index.astro` — fetch blog excerpts from Blog API at build time (`getStaticPaths`)
    - `organs/index.astro` — Organ Discovery teasers from shared `organs.ts`
    - `habits.astro` — H.A.B.I.T.S. framework overview from shared `habits.ts`
    - All pages: mobile-first layout, `prerender = true`
    - _Requirements: 1.2, 1.3, 1.4, 1.5, 1.7, 1.8_

  - [x] 7.3 Build `LeadCaptureForm` React component in `marketing/src/components/LeadCaptureForm.tsx`
    - Collect name + phone (+91 format); read UTM params from `window.location.search`
    - `POST` to `https://parent.skids.clinic/api/lead` (cross-origin) with name, phone, utm_* fields, `brand: 'skids'`
    - On success: redirect to `parent.skids.clinic` or provider signup with UTM params preserved
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [x] 7.4 Implement UTM preservation across all marketing site CTAs
    - All internal links and CTA buttons append `utm_source=skids_clinic&utm_campaign=skids_parent_cta` (parent) or `skids_provider_cta` (provider)
    - Lead form POST body includes all `utm_*` fields from current URL
    - _Requirements: 1.6, 2.2, 2.3, 13.3_

  - [x] 7.5 Verify `POST /api/lead` on parent app accepts cross-origin requests from `skids.clinic`
    - Add `Access-Control-Allow-Origin: https://skids.clinic` header to `src/pages/api/lead.ts` response
    - Ensure lead row is written with `brand = 'skids'`
    - _Requirements: 2.4, 2.5_

  - [x] 7.6 Final checkpoint — Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at the end of each phase
- Property tests (Properties 1–10 from design.md) validate universal correctness guarantees
- Unit tests validate specific examples and edge cases
- LiveKit secrets already stored in Cloudflare Pages: `LIVEKIT_URL`, `LIVEKIT_API_KEY`
- **Still needed before Phase 4**: `wrangler pages secret put LIVEKIT_API_SECRET --project-name skidsparent`
- LiveKit npm packages needed: `npm install livekit-server-sdk @livekit/components-react @livekit/components-core livekit-client`
