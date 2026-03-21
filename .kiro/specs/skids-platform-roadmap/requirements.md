# Requirements Document

## Introduction

The SKIDS Platform Roadmap covers the three remaining pillars needed to complete the SKIDS three-sided marketplace for pediatric thrive care. The existing `parent.skids.clinic` PWA (~70% complete) provides the parent-facing PHR, content engine, and lead capture. This spec defines what must be built to unlock revenue, attract providers, and grow the brand:

- **Pillar 1** — Thrive Care Marketing Site (`skids.clinic`): a public-facing brand and conversion site
- **Pillar 2** — Provider Marketplace Portal: independent practitioner onboarding, dashboard, and session management
- **Pillar 3** — Payment + Booking Flow: end-to-end service ordering with Razorpay, order lifecycle, and WhatsApp confirmations

The D2C Manager role (internal SKIDS ops) threads through all three pillars as the operational backbone.

---

## Glossary

- **Marketing_Site**: The public-facing website at `skids.clinic` — separate domain from the parent app
- **Parent_App**: The existing PWA at `parent.skids.clinic`
- **Provider**: An independent pediatric practitioner (doctor, therapist, specialist) who joins the SKIDS marketplace
- **Provider_Portal**: The web interface at which Providers manage their profile, availability, orders, and session notes
- **Parent**: A registered user of `parent.skids.clinic` with one or more child profiles
- **Child**: A child profile linked to a Parent, with an associated PHR
- **PHR**: Personal Health Record — the longitudinal health record for a Child stored in the SKIDS platform
- **D2C_Manager**: An internal SKIDS operations staff member who manages provider onboarding, order assignment, and platform quality
- **Service_Order**: A record representing a Parent's purchase of a Service for a Child, with a defined lifecycle
- **Order_Lifecycle**: The sequence of states a Service_Order passes through: `pending → confirmed → scheduled → in_progress → completed`
- **Razorpay**: The payment gateway used for all monetary transactions on the platform
- **BHASH_API**: The WhatsApp messaging API used for transactional notifications
- **Commission**: The percentage of a Service_Order's value retained by SKIDS; default 15%, configurable per Provider
- **H.A.B.I.T.S**: SKIDS daily habits framework — Healthy Eating, Active Movement, Balanced Stress, Inner Coaching, Timekeepers, Sufficient Sleep
- **Organ_Discovery**: SKIDS interactive content module covering 16 organ systems
- **Audit_Log**: An immutable record of D2C_Manager actions including actor, action, target, timestamp, and before/after state
- **Slot**: A specific date-time window a Provider has marked as available for a Service
- **Session_Note**: A Provider's clinical note attached to a completed or in-progress Service_Order
- **GMV**: Gross Merchandise Value — total value of all Service_Orders before commission deduction
- **UTM**: Urchin Tracking Module — URL parameters used for campaign attribution; all SKIDS campaigns use the prefix `skids_`

---

## Requirements

### Requirement 1: Thrive Care Marketing Site — Brand and Philosophy

**User Story:** As a prospective Indian parent or pediatric doctor visiting `skids.clinic`, I want to understand the SKIDS philosophy and value proposition, so that I can decide whether to sign up as a parent or join as a provider.

#### Acceptance Criteria

1. THE Marketing_Site SHALL be served from the `skids.clinic` domain, separate from `parent.skids.clinic`
2. THE Marketing_Site SHALL present the SKIDS philosophy — "Indian pediatrics is reactive; SKIDS is proactive thrive care" — as the primary hero message on the homepage
3. THE Marketing_Site SHALL display teaser content (daily blog excerpts, Organ_Discovery cards, H.A.B.I.T.S. framework overview) without requiring user authentication
4. THE Marketing_Site SHALL include a "I'm a Parent" CTA that navigates to `parent.skids.clinic` signup
5. THE Marketing_Site SHALL include a "I'm a Doctor" CTA that navigates to the Provider signup flow
6. WHEN a visitor arrives via a UTM-tagged URL, THE Marketing_Site SHALL preserve the UTM parameters through to the signup destination
7. THE Marketing_Site SHALL be statically renderable (prerender = true) for all public pages to ensure sub-2-second first contentful paint on Indian mobile networks
8. THE Marketing_Site SHALL display content in a mobile-first layout targeting urban Indian parents on Android devices

---

### Requirement 2: Thrive Care Marketing Site — Conversion Flows

**User Story:** As a prospective parent or doctor on `skids.clinic`, I want a clear, low-friction path to sign up, so that I can start using the platform without confusion about which product is for me.

#### Acceptance Criteria

1. THE Marketing_Site SHALL present two distinct conversion paths: one for parents and one for providers, each with separate CTAs and landing sections
2. WHEN a visitor clicks "I'm a Parent", THE Marketing_Site SHALL redirect to `parent.skids.clinic` with UTM parameters `utm_source=skids_clinic&utm_campaign=skids_parent_cta`
3. WHEN a visitor clicks "I'm a Doctor", THE Marketing_Site SHALL redirect to the Provider signup page with UTM parameters `utm_source=skids_clinic&utm_campaign=skids_provider_cta`
4. THE Marketing_Site SHALL capture visitor email or phone via a lead form before redirect, storing the lead with `brand=skids` in the leads table
5. WHEN a lead form is submitted, THE Marketing_Site SHALL send a WhatsApp message via BHASH_API to the provided phone number within 60 seconds confirming receipt
6. IF the BHASH_API is unavailable, THEN THE Marketing_Site SHALL store the pending WhatsApp message and retry delivery within 5 minutes

---

### Requirement 3: Provider Signup and Onboarding

**User Story:** As a pediatric doctor or specialist, I want to register on the SKIDS platform and complete my professional profile, so that I can start receiving service orders from parents.

#### Acceptance Criteria

1. THE Provider_Portal SHALL provide a signup form collecting: full name, medical registration number, specialization(s), city, contact email, contact phone (+91 format), and fee structure per service type
2. WHEN a Provider submits the signup form, THE Provider_Portal SHALL create a provider record with `is_verified = false` and status `pending_review`
3. THE Provider_Portal SHALL allow a Provider to upload credential documents (PDF or image, max 10 MB each) during onboarding
4. WHEN a Provider completes onboarding, THE Provider_Portal SHALL notify the D2C_Manager via email and in the admin dashboard that a new provider is awaiting approval
5. WHILE a Provider's `is_verified = false`, THE Provider_Portal SHALL display the provider's profile in read-only mode and prevent the provider from receiving new Service_Orders
6. THE Provider_Portal SHALL support the following specialization types: teleconsult, speech therapy, occupational therapy, behavioral assessment, nutrition counseling, physiotherapy
7. THE Provider_Portal SHALL store the Provider's commission percentage, defaulting to 15%, editable only by the D2C_Manager

---

### Requirement 4: Provider Dashboard — Order and Session Management

**User Story:** As a verified Provider, I want a dashboard showing my incoming orders and patient context, so that I can deliver sessions efficiently and maintain clinical notes.

#### Acceptance Criteria

1. WHILE a Provider is authenticated, THE Provider_Portal SHALL display all Service_Orders assigned to that Provider, grouped by status
2. WHEN a Service_Order is assigned to a Provider, THE Provider_Portal SHALL send a WhatsApp notification via BHASH_API to the Provider's registered phone within 60 seconds
3. THE Provider_Portal SHALL allow a Provider to view the PHR of a Child only when an active Service_Order (status not `cancelled` or `completed`) exists between that Provider and that Child
4. IF a Provider attempts to access a Child's PHR without an active Service_Order, THEN THE Provider_Portal SHALL return a 403 error and log the access attempt
5. THE Provider_Portal SHALL allow a Provider to add a Session_Note to a Service_Order when the order status is `in_progress` or `completed`
6. THE Provider_Portal SHALL allow a Provider to mark a Service_Order as `completed` after adding a Session_Note
7. THE Provider_Portal SHALL display the Provider's earnings summary: total sessions completed, gross earnings, commission deducted, and net payout — calculated deterministically from Service_Order records

---

### Requirement 5: Provider Availability and Slot Management

**User Story:** As a verified Provider, I want to manage my availability calendar, so that parents can only book me during times I have confirmed as open.

#### Acceptance Criteria

1. THE Provider_Portal SHALL allow a Provider to define recurring weekly availability Slots (day of week, start time, end time, timezone = IST)
2. THE Provider_Portal SHALL allow a Provider to block specific dates or Slots as unavailable
3. WHEN a Parent books a Slot, THE Provider_Portal SHALL mark that Slot as unavailable for further bookings
4. THE Provider_Portal SHALL expose available Slots via an API endpoint consumed by the booking flow in the Parent_App
5. IF a Provider has no available Slots for a given Service in the next 7 days, THEN THE Provider_Portal SHALL surface a low-availability alert to the D2C_Manager

---

### Requirement 6: Payment Integration — Razorpay

**User Story:** As a Parent, I want to pay for a service securely using UPI, card, or net banking, so that my booking is confirmed and my child's care is scheduled.

#### Acceptance Criteria

1. THE Parent_App SHALL initiate a Razorpay payment order using `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` from Cloudflare secrets when a Parent proceeds to checkout
2. WHEN a Razorpay payment is initiated, THE Parent_App SHALL create a Service_Order with status `pending` and store the Razorpay order ID in the `payment_id` field
3. WHEN Razorpay confirms payment success via webhook, THE Parent_App SHALL update the Service_Order status from `pending` to `confirmed`
4. IF Razorpay reports a payment failure, THEN THE Parent_App SHALL retain the Service_Order at status `pending` and display a retry option to the Parent
5. THE Parent_App SHALL verify the Razorpay webhook signature before processing any status update
6. THE Parent_App SHALL record the confirmed payment amount in `amount_cents` on the Service_Order in INR paise
7. WHEN a Service_Order status changes to `confirmed`, THE Parent_App SHALL send a WhatsApp confirmation to the Parent via BHASH_API within 60 seconds containing the order ID, service name, child name, and scheduled time
8. IF the Service_Order status is not `confirmed`, THEN THE Parent_App SHALL not allow the order to transition to `scheduled`, `in_progress`, or `completed`

---

### Requirement 7: Service Booking Flow

**User Story:** As a Parent, I want to browse services, select a provider and time slot, and complete payment in a single flow, so that I can book care for my child without friction.

#### Acceptance Criteria

1. THE Parent_App SHALL present a service catalogue listing all active services from the `services` table with name, price in INR, delivery type, and category
2. WHEN a Parent selects a Service, THE Parent_App SHALL prompt the Parent to select which Child the service is for
3. WHEN a Child is selected, THE Parent_App SHALL display available Providers for that Service along with their available Slots
4. WHEN a Parent selects a Provider and Slot, THE Parent_App SHALL display an order summary (service, child, provider, slot, price in INR) before payment
5. WHEN a Parent confirms the order summary, THE Parent_App SHALL initiate the Razorpay payment flow
6. WHEN payment is confirmed, THE Parent_App SHALL display a booking confirmation screen with order ID and next steps
7. THE Parent_App SHALL tag every Service_Order with `brand=skids` in all analytics tracking events
8. WHEN a booking is confirmed, THE Parent_App SHALL send a WhatsApp message to the Parent via BHASH_API with a summary including order ID, service name, provider name, child name, and scheduled date-time

---

### Requirement 8: Order Lifecycle Management

**User Story:** As a D2C_Manager, I want to view and manage all service orders across the platform, so that I can ensure every order is fulfilled and no parent is left waiting.

#### Acceptance Criteria

1. THE Parent_App admin dashboard SHALL display all Service_Orders with filters by status, service type, provider, and date range
2. THE Parent_App admin dashboard SHALL allow the D2C_Manager to reassign a Service_Order to a different Provider when the order status is `confirmed` or `scheduled`
3. THE Parent_App admin dashboard SHALL allow the D2C_Manager to manually update a Service_Order status with a mandatory reason field
4. WHEN the D2C_Manager performs any action on a Service_Order, THE Parent_App SHALL write an entry to the Audit_Log containing: actor (D2C_Manager ID), action type, Service_Order ID, previous status, new status, reason, and timestamp
5. THE Parent_App admin dashboard SHALL allow the D2C_Manager to cancel a Service_Order, triggering a refund initiation via Razorpay and a WhatsApp notification to the Parent
6. WHEN a Service_Order is cancelled after payment, THE Parent_App SHALL initiate a Razorpay refund for the full `amount_cents` within 5 minutes of cancellation
7. THE Parent_App SHALL enforce the Order_Lifecycle sequence: a Service_Order SHALL only transition to the next valid status (`pending → confirmed → scheduled → in_progress → completed`) except for `cancelled`, which is reachable from any non-completed state

---

### Requirement 9: Commission Calculation and Auditability

**User Story:** As a D2C_Manager, I want provider commission to be calculated deterministically from order records, so that payouts are accurate and auditable without manual reconciliation.

#### Acceptance Criteria

1. WHEN a Service_Order reaches status `completed`, THE Parent_App SHALL calculate provider net payout as: `amount_cents × (1 - commission_pct / 100)`, using the `commission_pct` stored on the Provider record at the time of order creation
2. THE Parent_App SHALL store the commission percentage used for each Service_Order at the time of order creation, so that subsequent changes to the Provider's commission rate do not alter historical calculations
3. THE Parent_App admin dashboard SHALL display a revenue summary showing: total GMV, total commission earned, and total provider payouts — all derived from completed Service_Order records
4. FOR ALL completed Service_Orders, the sum of provider net payout and SKIDS commission SHALL equal the order `amount_cents` (round-trip financial integrity)
5. THE Parent_App admin dashboard SHALL allow the D2C_Manager to set a Provider's commission percentage to any value between 0 and 50, with the change recorded in the Audit_Log

---

### Requirement 10: D2C Manager — Provider Management

**User Story:** As a D2C_Manager, I want to approve, suspend, and configure providers from the admin dashboard, so that only qualified practitioners are active on the platform.

#### Acceptance Criteria

1. THE Parent_App admin dashboard SHALL display all Providers with their verification status, specializations, city, commission rate, and order count
2. WHEN the D2C_Manager approves a Provider, THE Parent_App SHALL set `is_verified = true` on the provider record and send a WhatsApp notification to the Provider via BHASH_API
3. WHEN the D2C_Manager suspends a Provider, THE Parent_App SHALL set `is_verified = false`, prevent new Service_Orders from being assigned to that Provider, and log the action in the Audit_Log
4. THE Parent_App admin dashboard SHALL display a supply monitoring view showing, for each active Service type, the count of verified Providers with available Slots in the next 7 days
5. WHEN a Service type has fewer than 2 verified Providers with available Slots, THE Parent_App admin dashboard SHALL surface a supply alert for that Service type

---

### Requirement 11: D2C Manager — Audit Logging

**User Story:** As a D2C_Manager and SKIDS compliance officer, I want every administrative action to be immutably logged, so that the platform can be audited and disputes resolved.

#### Acceptance Criteria

1. THE Parent_App SHALL write an Audit_Log entry for every D2C_Manager action including: provider approval, provider suspension, commission change, order reassignment, order status update, and order cancellation
2. THE Audit_Log SHALL be append-only; no Audit_Log entry SHALL be modified or deleted after creation
3. EACH Audit_Log entry SHALL contain: `id`, `actor_id` (D2C_Manager), `action_type`, `target_type`, `target_id`, `previous_value_json`, `new_value_json`, `reason`, and `created_at`
4. THE Parent_App admin dashboard SHALL allow the D2C_Manager to view the Audit_Log filtered by actor, action type, target, and date range
5. WHEN an Audit_Log entry is created, THE Parent_App SHALL not expose it via any public-facing API endpoint

---

### Requirement 12: WhatsApp Transactional Notifications

**User Story:** As a Parent or Provider, I want to receive WhatsApp messages for key order events, so that I am always informed without needing to check the app.

#### Acceptance Criteria

1. THE Parent_App SHALL send a WhatsApp message via BHASH_API for the following events: booking confirmed, session scheduled, session starting in 30 minutes, session completed, order cancelled, refund initiated
2. THE Parent_App SHALL send a WhatsApp message via BHASH_API to the Provider for the following events: new order assigned, session scheduled, order cancelled
3. WHEN a WhatsApp message fails to deliver, THE Parent_App SHALL retry delivery up to 3 times with exponential backoff before marking the notification as failed
4. THE Parent_App SHALL store the delivery status of each WhatsApp notification (sent, delivered, failed) linked to the associated Service_Order
5. ALL WhatsApp messages sent by the platform SHALL include the `skids` brand name in the message body

---

### Requirement 13: Analytics and Brand Tracking

**User Story:** As a D2C_Manager, I want all platform events to be tagged with the SKIDS brand, so that analytics and attribution are consistent across the three-sided marketplace.

#### Acceptance Criteria

1. THE Parent_App SHALL include `brand=skids` as a property in every analytics event emitted to GA4, PostHog, and Meta Pixel
2. THE Parent_App SHALL tag every Service_Order record with `brand=skids` at creation time
3. ALL UTM campaigns originating from SKIDS-owned surfaces SHALL use the prefix `skids_` in the `utm_campaign` parameter
4. THE Parent_App admin dashboard SHALL display a revenue dashboard showing: total orders by status, GMV by service category, commission earned by period, and provider utilization rate
5. WHEN a Service_Order is created, THE Parent_App SHALL emit a `purchase_initiated` event with `brand=skids`, `service_slug`, `amount_cents`, and `child_age_months` to the analytics pipeline
