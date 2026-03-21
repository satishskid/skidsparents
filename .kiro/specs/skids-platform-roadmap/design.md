# Design Document — SKIDS Platform Roadmap

## Overview

This document covers the technical design for the three remaining pillars of the SKIDS three-sided marketplace:

- **Pillar 1** — `skids.clinic` marketing site (brand + conversion)
- **Pillar 2** — Provider Portal (onboarding, dashboard, session management)
- **Pillar 3** — Payment + Booking Flow (Razorpay, order lifecycle, WhatsApp)
- **D2C Manager Layer** — Admin extensions for provider ops, revenue, and audit

The existing `parent.skids.clinic` Astro 5 / Cloudflare Pages app is the foundation. All new server-side logic follows the same patterns: Drizzle ORM over D1, Firebase Auth JWT verification via `getParentId`, ADMIN_KEY bearer for admin routes, BHASH API for WhatsApp, and Razorpay for payments.

---

## Architecture

```mermaid
graph TD
  subgraph Public["Public Internet"]
    V[Visitor / Parent]
    P[Provider]
    D[D2C Manager]
  end

  subgraph Marketing["skids.clinic (Astro SSG)"]
    MS[Marketing Site<br/>prerender=true]
    LF[Lead Form]
  end

  subgraph ParentApp["parent.skids.clinic (Astro SSR / CF Pages)"]
    subgraph ParentFacing["Parent-Facing"]
      BF[Booking Flow<br/>React multi-step]
      PHR[PHR / Child Dashboard]
    end
    subgraph ProviderFacing["Provider Portal /provider/*"]
      PP[Provider Dashboard<br/>React]
      SN[Session Notes]
      AV[Availability Manager]
    end
    subgraph AdminFacing["Admin /admin/*"]
      CRM[CRM Dashboard<br/>existing]
      ADM[Orders / Providers / Revenue<br/>new admin pages]
    end
    subgraph API["API Routes /api/*"]
      PAY[/api/payments/*]
      BOOK[/api/bookings/*]
      PROV[/api/provider/*]
      ADMA[/api/admin/*]
      WA[/api/whatsapp/*]
    end
  end

  subgraph CF["Cloudflare Edge"]
    D1[(D1 SQLite)]
    KV[(KV Cache)]
    R2[(R2 Storage)]
    WAI[Workers AI]
  end

  subgraph External["External Services"]
    FB[Firebase Auth]
    RZP[Razorpay]
    BHASH[BHASH WhatsApp API]
    NEO[Neodove CRM]
    BLOG[Blog API<br/>AWS Lambda]
  end

  V --> MS
  V --> ParentApp
  P --> ProviderFacing
  D --> AdminFacing

  MS --> LF --> ADMA
  BF --> PAY --> RZP
  PAY --> D1
  PAY --> BHASH
  PROV --> D1
  PROV --> R2
  ADMA --> D1
  API --> FB
  API --> KV
  API --> WAI
  LF --> NEO
  LF --> BHASH
```

### Deployment Topology

| Surface | Domain | Astro Mode | Repo |
|---|---|---|---|
| Marketing Site | `skids.clinic` | `prerender=true` (SSG) | New subfolder `marketing/` or separate repo |
| Parent App | `parent.skids.clinic` | SSR (CF Pages adapter) | This repo |
| Provider Portal | `parent.skids.clinic/provider/*` | SSR | This repo (new routes) |
| Admin Extensions | `parent.skids.clinic/admin/*` | SSR | This repo (extend existing) |

The Provider Portal lives within the same Astro app as the Parent App to share the D1 database binding, KV, R2, and secrets. A separate subdomain (`provider.skids.clinic`) can be added later via a CF Pages custom domain pointing to the same deployment.

---

## Components and Interfaces

### Pillar 1 — Marketing Site

The marketing site is a standalone Astro project (subfolder `marketing/` in this monorepo, or a separate repo) with `output: 'static'`. It has no server-side runtime — all data is fetched at build time or via client-side fetch.

**Page structure:**
```
marketing/src/pages/
  index.astro          # Hero + philosophy + dual CTA
  for-parents.astro    # Parent value prop + lead form
  for-doctors.astro    # Provider value prop + signup CTA
  blog/index.astro     # Blog excerpts (fetched from Blog API at build)
  organs/index.astro   # Organ discovery teasers (from shared content files)
  habits.astro         # H.A.B.I.T.S. overview
```

**Shared content:** `src/lib/content/organs.ts` and `src/lib/content/habits.ts` are imported directly (same monorepo). Blog excerpts are fetched from the external Blog API at build time.

**Lead form component** (`LeadCaptureForm.tsx`):
- Collects name + phone (or email)
- `POST`s to `/api/lead` on `parent.skids.clinic` (cross-origin, CORS allowed)
- On success: redirects to `parent.skids.clinic` or provider signup with UTM params preserved
- UTM params are read from `window.location.search` and appended to the redirect URL

**UTM preservation:** All internal links on the marketing site append `utm_source=skids_clinic&utm_campaign=skids_parent_cta` (or `skids_provider_cta`). The lead form POST includes `utm_*` fields in the body.

### Pillar 2 — Provider Portal

**Auth:** Providers authenticate via Firebase Auth (same project, different role). A `providers` DB record is linked to a `firebase_uid`. A new `getProviderId` helper mirrors `getParentId`:

```typescript
// src/pages/api/provider/_auth.ts
export async function getProviderId(request: Request, env: any): Promise<string | null> {
  const token = extractBearerToken(request)
  if (!token) return null
  const decoded = await verifyIdToken(token, env.FIREBASE_PROJECT_ID || 'skidsparent', env.KV)
  if (!decoded) return null
  const row = await env.DB?.prepare(
    'SELECT id FROM providers WHERE firebase_uid = ? AND is_verified = 1'
  ).bind(decoded.uid).first()
  return row ? (row as any).id : null
}
```

Unverified providers get a `pending_review` response (403) until the D2C Manager approves them.

**Provider Portal React component tree:**
```
ProviderApp (client:load)
├── ProviderNav
├── ProviderDashboard (route: /provider)
│   ├── OrderList (grouped by status)
│   │   └── OrderCard → opens OrderDetail
│   └── EarningsSummary
├── OrderDetail (route: /provider/orders/:id)
│   ├── PatientContext (PHR summary — gated by active order)
│   └── SessionNoteForm
├── AvailabilityManager (route: /provider/availability)
│   ├── WeeklySlotGrid
│   └── BlockedDatePicker
└── ProviderProfile (route: /provider/profile)
    └── CredentialUpload (R2 via /api/provider/credentials)
```

**Astro pages for provider portal:**
```
src/pages/provider/
  index.astro          # → ProviderApp dashboard
  orders/[id].astro    # → OrderDetail
  availability.astro   # → AvailabilityManager
  profile.astro        # → ProviderProfile
  signup.astro         # → ProviderSignupForm (unauthenticated)
```

### Teleconsultation Session Room — Core Clinical Product

This is the highest-priority surface in the entire platform. The session room is where the clinical value is delivered. It must feel as frictionless as a WhatsApp video call while giving the doctor the depth of a full clinical workstation.

**Design principle:** The doctor never needs to leave the session room to access clinical context. Everything is in one view — video on one side, PHR + AI panel on the other.

#### Session Room Layout (desktop + mobile responsive)

```
┌─────────────────────────────────────────────────────────────┐
│  SKIDS Teleconsult — [Child Name], [Age]    [End Session]   │
├──────────────────────────┬──────────────────────────────────┤
│                          │  CLINICAL PANEL                  │
│   VIDEO FEED             │  ┌─────────────────────────────┐ │
│   (Daily.co embed)       │  │ PHR Summary                 │ │
│                          │  │ • Growth: 14.2kg / 98cm     │ │
│   [Parent + Child]       │  │ • Last milestone: Walking   │ │
│                          │  │ • Vaccinations: BCG ✓ ...   │ │
│                          │  │ • Observations: 3 flagged   │ │
│   [Doctor self-view]     │  └─────────────────────────────┘ │
│                          │  ┌─────────────────────────────┐ │
│   [Mute] [Video] [Chat]  │  │ AI Assist (Dr. SKIDS)       │ │
│                          │  │ DDx suggestions             │ │
│                          │  │ Red flags for this age      │ │
│                          │  │ IAP vaccination gaps        │ │
│                          │  └─────────────────────────────┘ │
│                          │  ┌─────────────────────────────┐ │
│                          │  │ Prescription Builder        │ │
│                          │  │ [+ Add medication]          │ │
│                          │  │ [+ Patient education]       │ │
│                          │  │ [+ Nutrition advice]        │ │
│                          │  │ [+ Behavioural guidance]    │ │
│                          │  │ [+ Follow-up]               │ │
│                          │  └─────────────────────────────┘ │
└──────────────────────────┴──────────────────────────────────┘
```

On mobile (parent side): full-screen video, swipe up for chat. On mobile (doctor side): video top half, clinical panel scrollable bottom half.

#### Video Infrastructure

Use **LiveKit** (open-source WebRTC SFU — self-hosted or cloud, full control over rooms and tokens):
- LiveKit Cloud URL: `wss://urbanuber-mumv2mg5.livekit.cloud` (stored as `LIVEKIT_URL` secret)
- API Key: `API6sqXzHmr7dar` (stored as `LIVEKIT_API_KEY` secret)
- API Secret: stored as `LIVEKIT_API_SECRET` secret (set via `wrangler pages secret put LIVEKIT_API_SECRET`)
- Server generates a signed JWT access token for each participant (doctor + parent) using `livekit-server-sdk`
- Room name: `skids-{orderId}` — unique per consultation
- Token grants: doctor gets `canPublish: true, canSubscribe: true, roomJoin: true`; parent gets same
- Token TTL: 2 hours from `scheduled_at`
- Client uses `@livekit/components-react` for the video UI — pre-built, WhatsApp-style controls
- Room auto-closes when all participants leave (LiveKit handles this natively)
- Fallback: if LiveKit unavailable, surface a Google Meet link field the doctor can paste manually

**Why LiveKit over Daily.co:**
- Full control — no per-minute pricing surprises
- `@livekit/components-react` gives pre-built video UI (mute, camera, screen share, chat) that looks like a modern video call
- Token-based auth means no room URLs to manage — doctor and parent both join the same room by orderId
- Works in Cloudflare Workers edge environment (JWT signing via Web Crypto API)

#### AI Assist Panel — Clinical Intelligence

The AI panel is powered by the existing Cloudflare Workers AI (Groq/Gemini router already built). It receives the child's full PHR as context and the doctor's typed query.

**Pre-session AI brief** (generated when doctor opens the session room, before the call starts):

```typescript
// POST /api/provider/orders/:id/ai-brief
// Returns structured clinical brief for the doctor
{
  childSummary: {
    ageMonths: 18,
    growthStatus: "Normal — weight 14.2kg (50th percentile), height 98cm (75th percentile)",
    recentObservations: ["Parent noted speech delay concern 2 weeks ago", "Fever 3 days ago, resolved"],
    vaccinationGaps: ["MMR dose 2 overdue by 3 months"],
    flaggedMilestones: ["No two-word phrases at 18 months — language delay flag"],
    activeConditions: [],
  },
  aiSuggestions: {
    ddx: ["Speech delay — expressive", "Hearing loss (rule out)", "ASD screening recommended"],
    redFlags: ["No two-word phrases at 18 months warrants M-CHAT-R screening"],
    vaccinationAction: "MMR dose 2 overdue — administer or refer",
    nutritionNote: "Iron-rich foods recommended for this age group",
  }
}
```

The AI brief is generated once per session and cached in KV for the session duration. The doctor can also type free-form queries into the AI panel during the call ("what's the dose of amoxicillin for 14kg child?").

#### Prescription Builder

The prescription is not just medications. It is a structured clinical output with five sections:

```typescript
interface Prescription {
  orderId: string
  childId: string
  providerId: string
  issuedAt: string

  // Section 1: Medications
  medications: {
    name: string          // e.g. "Amoxicillin 250mg/5ml"
    dose: string          // e.g. "5ml"
    frequency: string     // e.g. "3 times a day"
    duration: string      // e.g. "5 days"
    instructions: string  // e.g. "After food"
  }[]

  // Section 2: Patient Education
  education: string[]     // e.g. ["Fever above 102°F — visit ER", "Hydration is key"]

  // Section 3: Nutrition Advice
  nutrition: string[]     // e.g. ["Iron-rich foods: dal, spinach, ragi", "Avoid cow's milk before 1 year"]

  // Section 4: Behavioural / Developmental Guidance
  behavioural: string[]   // e.g. ["Read aloud 15 min/day", "Limit screen time to 0 min under 2 years"]

  // Section 5: Follow-up
  followUp: {
    when: string          // e.g. "In 5 days if fever persists"
    action: string        // e.g. "Book teleconsult or visit nearest clinic"
    referrals: string[]   // e.g. ["Speech therapist — SKIDS Chatter", "Audiologist"]
  }
}
```

AI assists the prescription builder:
- Typing a drug name → AI suggests dose by weight (child's weight from PHR)
- Clicking "Nutrition advice" → AI pre-fills age-appropriate Indian food recommendations
- Clicking "Behavioural guidance" → AI pre-fills developmental guidance for the child's age
- Referrals auto-link to SKIDS services (e.g., "SKIDS Chatter" → `/interventions/chatter`)

The completed prescription is:
1. Saved to a new `prescriptions` DB table linked to `service_orders`
2. Displayed to the parent in their child's PHR timeline (`/timeline`)
3. Sent as a WhatsApp message summary to the parent via BHASH API
4. Stored as a PDF-renderable JSON (no PDF generation needed — render on demand in browser)

#### New DB Table: `prescriptions`

```typescript
export const prescriptions = sqliteTable('prescriptions', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  orderId: text('order_id').notNull().references(() => serviceOrders.id),
  childId: text('child_id').notNull().references(() => children.id),
  providerId: text('provider_id').notNull().references(() => providers.id),
  medicationsJson: text('medications_json'),    // JSON array
  educationJson: text('education_json'),         // JSON array of strings
  nutritionJson: text('nutrition_json'),         // JSON array of strings
  behaviouralJson: text('behavioural_json'),     // JSON array of strings
  followUpJson: text('follow_up_json'),          // JSON object
  issuedAt: text('issued_at').default(sql`(datetime('now'))`),
  whatsappSent: integer('whatsapp_sent', { mode: 'boolean' }).default(false),
})
```

#### New API Routes for Teleconsult

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/provider/orders/:id/session/start` | Firebase (provider) | Generate LiveKit tokens for doctor + parent, store room name on order |
| GET | `/api/provider/orders/:id/ai-brief` | Firebase (provider) | Generate/fetch AI clinical brief for session |
| POST | `/api/provider/orders/:id/ai-assist` | Firebase (provider) | Free-form AI query during session |
| POST | `/api/provider/orders/:id/prescription` | Firebase (provider) | Save prescription, trigger WhatsApp to parent |
| GET | `/api/children/:childId/prescriptions` | Firebase (parent) | Parent views prescriptions in PHR timeline |

#### Session Flow (end-to-end)

```
1. Parent books teleconsult → pays via Razorpay → order status: confirmed
2. D2C Manager (or auto) assigns provider → order status: scheduled
3. 30 min before: WhatsApp reminder to parent + provider
4. Doctor opens /provider/orders/:id → clicks "Start Session"
   → POST /api/provider/orders/:id/session/start
   → LiveKit room name = "skids-{orderId}", doctor JWT generated
   → order status: in_progress
   → AI brief generated in background
5. Doctor sees: LiveKit video feed (@livekit/components-react) + PHR summary + AI brief + prescription builder
6. Parent joins via /session/:orderId — server generates parent JWT for same room
7. During call: doctor uses AI assist for DDx, drug doses, nutrition advice
8. Doctor completes prescription builder → clicks "End & Send Prescription"
   → POST /api/provider/orders/:id/prescription
   → Prescription saved to DB
   → WhatsApp sent to parent with prescription summary
   → order status: completed
9. Parent sees prescription in /timeline under child's PHR
10. Referrals in prescription link to SKIDS services for follow-on booking
```

#### Schema addition to `service_orders`

```sql
ALTER TABLE service_orders ADD COLUMN session_url TEXT;
  -- Daily.co room URL, set when session starts
ALTER TABLE service_orders ADD COLUMN session_started_at TEXT;
ALTER TABLE service_orders ADD COLUMN session_ended_at TEXT;
```

---

### Pillar 3 — Booking Flow

**Multi-step React component** (`BookingFlow.tsx`):
```
BookingFlow (client:load)
├── Step 1: ServiceSelector
│   └── ServiceCard[] (from /api/services)
├── Step 2: ChildSelector
│   └── ChildCard[] (from /api/children)
├── Step 3: ProviderSlotPicker
│   ├── ProviderCard[]
│   └── SlotCalendar (from /api/bookings/slots?serviceId=&date=)
├── Step 4: OrderSummary
│   └── PriceSummary + T&C checkbox
└── Step 5: PaymentGate
    └── RazorpayCheckout (Razorpay JS SDK)
        └── on success → POST /api/payments/verify
```

**Razorpay integration flow:**
1. Parent clicks "Pay" → `POST /api/payments/create-order` → creates Razorpay order + D1 `service_orders` row (status=`pending`)
2. Razorpay JS SDK opens payment modal
3. On payment success, client calls `POST /api/payments/verify` with `razorpay_payment_id`, `razorpay_order_id`, `razorpay_signature`
4. Server verifies HMAC-SHA256 signature, updates order to `confirmed`, fires WhatsApp notification
5. Razorpay also calls `POST /api/payments/webhook` (server-to-server) — idempotent, same signature check

### D2C Manager Layer

**New admin pages** (extend existing `/admin`):
```
src/pages/admin/
  index.astro          # existing CRM
  analytics.astro      # existing
  moderation.astro     # existing
  providers.astro      # NEW — provider management
  orders.astro         # NEW — order management
  revenue.astro        # NEW — GMV / commission dashboard
```

**Admin React components:**
```
src/components/admin/
  CRMDashboard.tsx     # existing
  ProviderManager.tsx  # NEW
  OrderManager.tsx     # NEW
  RevenueDashboard.tsx # NEW
  AuditLogViewer.tsx   # NEW
```

---

## Data Models

### New DB Tables

All new tables follow the existing Drizzle ORM pattern in `src/lib/db/schema.ts`.

#### `provider_slots`
Stores a provider's recurring weekly availability and one-off blocks.

```typescript
export const providerSlots = sqliteTable('provider_slots', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  providerId: text('provider_id').notNull().references(() => providers.id),
  slotType: text('slot_type', { enum: ['recurring', 'one_off', 'blocked'] }).notNull(),
  dayOfWeek: integer('day_of_week'),        // 0=Sun..6=Sat, null for one_off/blocked
  date: text('date'),                        // ISO date, null for recurring
  startTime: text('start_time').notNull(),   // HH:MM IST
  endTime: text('end_time').notNull(),       // HH:MM IST
  serviceId: text('service_id').references(() => services.id),
  isBooked: integer('is_booked', { mode: 'boolean' }).default(false),
  orderId: text('order_id'),                 // set when booked
  createdAt: text('created_at').default(sql`(datetime('now'))`),
})
```

#### `provider_credentials`
Uploaded onboarding documents stored in R2.

```typescript
export const providerCredentials = sqliteTable('provider_credentials', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  providerId: text('provider_id').notNull().references(() => providers.id),
  fileUrl: text('file_url').notNull(),       // R2 URL
  fileType: text('file_type', { enum: ['pdf', 'image'] }),
  docType: text('doc_type'),                 // e.g. "medical_registration", "degree"
  uploadedAt: text('uploaded_at').default(sql`(datetime('now'))`),
})
```

#### `session_notes`
Clinical notes per service order (replaces overloading `outcome_notes`).

```typescript
export const sessionNotes = sqliteTable('session_notes', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  orderId: text('order_id').notNull().references(() => serviceOrders.id),
  providerId: text('provider_id').notNull().references(() => providers.id),
  noteText: text('note_text').notNull(),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
})
```

#### `audit_log`
Append-only immutable log of all D2C Manager actions.

```typescript
export const auditLog = sqliteTable('audit_log', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  actorId: text('actor_id').notNull(),       // D2C Manager identifier (admin key hash or user id)
  actionType: text('action_type', {
    enum: [
      'provider_approved', 'provider_suspended', 'commission_changed',
      'order_reassigned', 'order_status_updated', 'order_cancelled',
      'phr_access_denied',
    ],
  }).notNull(),
  targetType: text('target_type', { enum: ['provider', 'order', 'phr'] }).notNull(),
  targetId: text('target_id').notNull(),
  previousValueJson: text('previous_value_json'),
  newValueJson: text('new_value_json'),
  reason: text('reason'),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
})
```

#### Schema additions to existing tables

**`providers`** — add columns:
```sql
ALTER TABLE providers ADD COLUMN firebase_uid TEXT UNIQUE;
ALTER TABLE providers ADD COLUMN status TEXT DEFAULT 'pending_review';
  -- enum: 'pending_review' | 'active' | 'suspended'
ALTER TABLE providers ADD COLUMN fee_structure_json TEXT;
  -- JSON: { "teleconsult": 499, "speech_therapy": 999, ... }
ALTER TABLE providers ADD COLUMN medical_reg_number TEXT;
```

**`service_orders`** — add columns:
```sql
ALTER TABLE service_orders ADD COLUMN slot_id TEXT REFERENCES provider_slots(id);
ALTER TABLE service_orders ADD COLUMN commission_pct_snapshot REAL;
  -- snapshot of provider commission_pct at order creation time
ALTER TABLE service_orders ADD COLUMN razorpay_order_id TEXT;
ALTER TABLE service_orders ADD COLUMN whatsapp_status TEXT DEFAULT 'pending';
  -- enum: 'pending' | 'sent' | 'delivered' | 'failed'
ALTER TABLE service_orders ADD COLUMN brand TEXT DEFAULT 'skids';
```

### API Route Definitions

All routes under `src/pages/api/` with `export const prerender = false`.

#### Payments

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/payments/create-order` | Firebase (parent) | Create Razorpay order + pending service_order |
| POST | `/api/payments/verify` | Firebase (parent) | Verify client-side payment, confirm order |
| POST | `/api/payments/webhook` | Razorpay HMAC | Server-to-server payment confirmation (idempotent) |
| POST | `/api/payments/refund` | ADMIN_KEY | Initiate Razorpay refund for cancelled order |

**`POST /api/payments/create-order` request:**
```json
{
  "serviceId": "uuid",
  "childId": "uuid",
  "providerId": "uuid",
  "slotId": "uuid"
}
```
**Response:**
```json
{
  "razorpayOrderId": "order_xxx",
  "amount": 49900,
  "currency": "INR",
  "serviceOrderId": "uuid",
  "keyId": "rzp_live_xxx"
}
```

**`POST /api/payments/webhook` — HMAC verification:**
```typescript
const body = await request.text()
const sig = request.headers.get('x-razorpay-signature')
const expected = await hmacSHA256(env.RAZORPAY_KEY_SECRET, body)
if (sig !== expected) return new Response('Invalid signature', { status: 400 })
```

#### Bookings

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/bookings/slots` | Firebase (parent) | Available slots for a service+provider+date |
| GET | `/api/bookings/providers` | Firebase (parent) | Providers available for a service |
| GET | `/api/bookings/orders` | Firebase (parent) | Parent's order history |

#### Provider

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/provider/signup` | None | Create provider record (pending_review) |
| GET | `/api/provider/me` | Firebase (provider) | Provider profile |
| GET | `/api/provider/orders` | Firebase (provider) | Orders assigned to provider |
| POST | `/api/provider/orders/:id/note` | Firebase (provider) | Add session note |
| POST | `/api/provider/orders/:id/complete` | Firebase (provider) | Mark order completed |
| GET | `/api/provider/phr/:childId` | Firebase (provider) | PHR access (gated by active order) |
| GET | `/api/provider/slots` | Firebase (provider) | Provider's own slots |
| POST | `/api/provider/slots` | Firebase (provider) | Create/update slot |
| DELETE | `/api/provider/slots/:id` | Firebase (provider) | Block/delete slot |
| POST | `/api/provider/credentials` | Firebase (provider) | Upload credential doc to R2 |
| GET | `/api/provider/earnings` | Firebase (provider) | Earnings summary |

#### Admin Extensions

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/admin/providers` | ADMIN_KEY | List all providers with status |
| POST | `/api/admin/providers/:id/approve` | ADMIN_KEY | Set is_verified=true, notify provider |
| POST | `/api/admin/providers/:id/suspend` | ADMIN_KEY | Set is_verified=false, log audit |
| PATCH | `/api/admin/providers/:id/commission` | ADMIN_KEY | Update commission_pct, log audit |
| GET | `/api/admin/orders` | ADMIN_KEY | All orders with filters |
| POST | `/api/admin/orders/:id/reassign` | ADMIN_KEY | Reassign provider, log audit |
| POST | `/api/admin/orders/:id/status` | ADMIN_KEY | Manual status update, log audit |
| POST | `/api/admin/orders/:id/cancel` | ADMIN_KEY | Cancel + refund + WhatsApp |
| GET | `/api/admin/revenue` | ADMIN_KEY | GMV, commission, payout summary |
| GET | `/api/admin/supply` | ADMIN_KEY | Provider availability per service (next 7 days) |
| GET | `/api/admin/audit-log` | ADMIN_KEY | Audit log with filters |

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Order lifecycle is strictly sequential

*For any* service order, the only valid status transitions are `pending → confirmed → scheduled → in_progress → completed`, and `cancelled` is reachable from any non-completed state. No other transition is permitted.

**Validates: Requirements 8.7**

---

### Property 2: Payment confirmation precedes scheduling

*For any* service order, if the order status is `scheduled`, `in_progress`, or `completed`, then a confirmed Razorpay payment must exist (i.e., `payment_id` is non-null and `amount_cents > 0`).

**Validates: Requirements 6.8**

---

### Property 3: Commission round-trip financial integrity

*For any* completed service order, `provider_net_payout + skids_commission = amount_cents`, where `provider_net_payout = amount_cents × (1 - commission_pct_snapshot / 100)` and `skids_commission = amount_cents × (commission_pct_snapshot / 100)`.

**Validates: Requirements 9.4**

---

### Property 4: Commission snapshot immutability

*For any* service order created at time T, the `commission_pct_snapshot` stored on the order equals the provider's `commission_pct` at time T, and subsequent changes to the provider's `commission_pct` do not alter the order's snapshot.

**Validates: Requirements 9.2**

---

### Property 5: PHR access requires active order

*For any* provider and child pair, a provider can access the child's PHR if and only if there exists at least one service order linking that provider to that child with status not in `{cancelled, completed}`.

**Validates: Requirements 4.3, 4.4**

---

### Property 6: Audit log is append-only

*For any* audit log entry created at time T, querying the audit log at any time T' > T must return that entry unchanged. No update or delete operation on the audit log should succeed.

**Validates: Requirements 11.2**

---

### Property 7: Razorpay webhook signature verification

*For any* incoming webhook payload, the server must reject the request if the HMAC-SHA256 of the raw body using `RAZORPAY_KEY_SECRET` does not match the `x-razorpay-signature` header.

**Validates: Requirements 6.5**

---

### Property 8: Slot exclusivity after booking

*For any* provider slot, once a service order is linked to that slot (i.e., `is_booked = true`), no other service order can be created referencing the same slot.

**Validates: Requirements 5.3**

---

### Property 9: WhatsApp retry on failure

*For any* WhatsApp notification that fails on first delivery attempt, the system retries up to 3 times with exponential backoff before marking the notification as `failed`. The final `whatsapp_status` on the service order reflects the outcome.

**Validates: Requirements 12.3**

---

### Property 10: Supply alert threshold

*For any* active service type, if the count of verified providers with available (non-booked) slots in the next 7 days is fewer than 2, the supply monitoring endpoint must include that service type in its alert list.

**Validates: Requirements 10.5**

---

## Error Handling

### Payment Errors

- **Razorpay order creation failure**: Return 502 to client; do not create a `service_orders` row. Client retries.
- **Webhook signature mismatch**: Return 400, log the attempt. Never update order status.
- **Duplicate webhook delivery**: `payment_id` uniqueness check on `service_orders`; idempotent — return 200 without re-processing.
- **Refund failure**: Log to audit_log with `action_type = 'refund_failed'`; surface alert in admin dashboard. Manual retry via `/api/payments/refund`.

### PHR Access Denial

- Provider requests PHR without active order → 403 response + `audit_log` entry with `action_type = 'phr_access_denied'`.
- Response body: `{ "error": "No active order for this patient" }`.

### WhatsApp Delivery

- BHASH API unavailable: store notification in a `pending_whatsapp` queue (KV or a `notifications` table row with `type = 'whatsapp_pending'`). Cron worker retries every 5 minutes.
- After 3 retries with exponential backoff (1 min, 2 min, 4 min): mark `whatsapp_status = 'failed'` on the order.

### Slot Conflicts

- Race condition on slot booking: use a D1 transaction with a `WHERE is_booked = 0` guard on the UPDATE. If 0 rows affected, return 409 Conflict to client.

### Provider Onboarding

- Credential upload > 10 MB: reject at API layer with 413 before touching R2.
- Unverified provider accessing orders: 403 with `{ "error": "Account pending review" }`.

---

## Testing Strategy

### Unit Tests

Focus on pure functions and edge cases:

- `calculateProviderPayout(amountCents, commissionPct)` — verify arithmetic, rounding, boundary values (0%, 50%, 100%)
- `isValidOrderTransition(from, to)` — verify all valid and invalid state machine transitions
- `verifyRazorpaySignature(secret, body, sig)` — verify correct HMAC, tampered body, wrong key
- `buildWhatsAppMessage(event, order)` — verify all required fields present in output string
- `getAvailableSlots(slots, date)` — verify booked slots excluded, blocked dates excluded

### Property-Based Tests

Use **fast-check** (TypeScript PBT library). Each test runs minimum 100 iterations.

**Property 1 — Order lifecycle is strictly sequential**
```
// Feature: skids-platform-roadmap, Property 1: Order lifecycle is strictly sequential
fc.assert(fc.property(
  fc.constantFrom(...ALL_STATUS_PAIRS),
  ([from, to]) => isValidOrderTransition(from, to) === VALID_TRANSITIONS.has(`${from}->${to}`)
), { numRuns: 100 })
```

**Property 2 — Payment confirmation precedes scheduling**
```
// Feature: skids-platform-roadmap, Property 2: Payment confirmation precedes scheduling
fc.assert(fc.property(
  arbitraryOrder({ status: fc.constantFrom('scheduled', 'in_progress', 'completed') }),
  (order) => order.paymentId !== null && order.amountCents > 0
), { numRuns: 100 })
```

**Property 3 — Commission round-trip financial integrity**
```
// Feature: skids-platform-roadmap, Property 3: Commission round-trip financial integrity
fc.assert(fc.property(
  fc.integer({ min: 1, max: 10_000_000 }),  // amount_cents
  fc.float({ min: 0, max: 50 }),             // commission_pct
  (amountCents, commissionPct) => {
    const payout = calculateProviderPayout(amountCents, commissionPct)
    const commission = calculateCommission(amountCents, commissionPct)
    return payout + commission === amountCents
  }
), { numRuns: 1000 })
```

**Property 4 — Commission snapshot immutability**
```
// Feature: skids-platform-roadmap, Property 4: Commission snapshot immutability
// Verified by: creating an order, changing provider commission_pct, re-querying order
// commission_pct_snapshot must equal original value
fc.assert(fc.property(
  fc.float({ min: 0, max: 50 }),
  fc.float({ min: 0, max: 50 }),
  async (originalPct, newPct) => {
    const order = await createOrderWithCommission(originalPct)
    await updateProviderCommission(order.providerId, newPct)
    const fetched = await getOrder(order.id)
    return fetched.commissionPctSnapshot === originalPct
  }
), { numRuns: 100 })
```

**Property 5 — PHR access requires active order**
```
// Feature: skids-platform-roadmap, Property 5: PHR access requires active order
fc.assert(fc.property(
  arbitraryProviderChildPair(),
  arbitraryOrderStatus(),
  async ({ providerId, childId }, status) => {
    const hasActive = !['cancelled', 'completed'].includes(status)
    const canAccess = await checkPhrAccess(providerId, childId)
    return canAccess === hasActive
  }
), { numRuns: 100 })
```

**Property 7 — Razorpay webhook signature verification**
```
// Feature: skids-platform-roadmap, Property 7: Razorpay webhook signature verification
fc.assert(fc.property(
  fc.string(),   // body
  fc.string(),   // secret
  async (body, secret) => {
    const validSig = await computeHmacSHA256(secret, body)
    const tamperedBody = body + 'x'
    return (
      (await verifyRazorpaySignature(secret, body, validSig)) === true &&
      (await verifyRazorpaySignature(secret, tamperedBody, validSig)) === false
    )
  }
), { numRuns: 200 })
```

**Property 8 — Slot exclusivity after booking**
```
// Feature: skids-platform-roadmap, Property 8: Slot exclusivity after booking
fc.assert(fc.property(
  arbitrarySlot(),
  async (slot) => {
    await bookSlot(slot.id, 'order-1')
    const result = await tryBookSlot(slot.id, 'order-2')
    return result.status === 409
  }
), { numRuns: 100 })
```

**Property 10 — Supply alert threshold**
```
// Feature: skids-platform-roadmap, Property 10: Supply alert threshold
fc.assert(fc.property(
  fc.array(arbitraryProvider(), { minLength: 0, maxLength: 5 }),
  fc.constantFrom(...SERVICE_TYPES),
  async (providers, serviceType) => {
    const verifiedWithSlots = providers.filter(p => p.isVerified && p.hasSlotInNext7Days)
    const alerts = await getSupplyAlerts()
    const isAlerted = alerts.some(a => a.serviceType === serviceType)
    return isAlerted === (verifiedWithSlots.length < 2)
  }
), { numRuns: 100 })
```

### Integration Tests

- Full booking flow: create order → Razorpay mock → webhook → confirm → WhatsApp mock → verify order status
- Provider PHR gate: create order, access PHR (200), cancel order, access PHR (403)
- Audit log: perform admin action, verify log entry exists and is immutable
- Slot conflict: concurrent booking attempts on same slot, verify only one succeeds (409 for second)
