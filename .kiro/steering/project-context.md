# SKIDS Parent — Project Context & Steering Guide

## What This Product Is

SKIDS Parent (`parent.skids.clinic`) is a pediatric health platform for Indian parents — a mobile-first PWA combining:
1. PHR (Personal Health Record) — longitudinal health record per child (0–16 years)
2. AI Health Companion — "Dr. SKIDS" chatbot (Cloudflare Workers AI, Llama 3.1)
3. D2C Marketplace — pediatric health services (vision, nutrition, therapy, teleconsult)
4. Content Engine — blog, organ discovery (16 modules), H.A.B.I.T.S. framework
5. CRM + Lead Engine — Neodove CRM + WhatsApp (BHASH) for sales ops

## Tech Stack (do NOT change without explicit instruction)

- Framework: Astro 5 (SSR via Cloudflare Pages adapter)
- UI: React 18 + Tailwind CSS v4
- Database: Cloudflare D1 (SQLite via Drizzle ORM) — schema in `src/lib/db/schema.ts`
- Auth: Firebase Auth (Google + Phone OTP) + firebase-auth-cloudflare-workers
- AI: Cloudflare Workers AI (llama-3.1-8b-instruct, llama-3.2-11b-vision-instruct)
- KV: Cloudflare KV (session cache, token verification)
- Storage: Cloudflare R2 (medical report uploads)
- CRM: Neodove (custom integration webhook)
- WhatsApp: BHASH API (sender: BUZWAP)
- Payments: Razorpay (keys in secrets, NOT yet integrated in code)
- Deployment: Cloudflare Pages via wrangler
- Blog API: External — `https://9vhd0onw23.execute-api.ap-south-1.amazonaws.com/published-blogs`

## Brand Rules (STRICT)

- Brand namespace is ALWAYS `skids` — every lead, DB record, API call
- UTM campaigns must start with `skids_`
- Indian context: dal-rice, +91 phone, INR pricing, IAP/NIS vaccination schedule
- Target: Indian parents, children 0–16 years, urban tier 1-2 cities

## Auth Pattern (use in every protected API route)

```typescript
import { getParentId } from '@/pages/api/children'
const parentId = await getParentId(request, env)
if (!parentId) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
```

## File Conventions

- Astro pages: `src/pages/*.astro` (SSR unless `export const prerender = true`)
- React components: `src/components/**/*.tsx`
- API routes: `src/pages/api/**/*.ts` (always `export const prerender = false`)
- Content/data: `src/lib/content/*.ts`
- DB schema: `src/lib/db/schema.ts`
- Path alias: `@/` maps to `src/`

## Database Tables

parents, children, milestones, habits_log, growth_records, parent_observations,
screening_imports, uploaded_reports, vaccination_records, services, service_orders,
providers, care_plans, subscriptions, blog_bookmarks, content_engagement,
chatbot_conversations, notifications, leads (created via init-db, not in schema.ts)

## Intervention Products (D2C)

Defined in `src/lib/content/interventions.ts`, merged with DB via `src/lib/content/product-merge.ts`:
- SKIDS Vision (available) — WelchAllyn screening + myopia arrest lenses
- SKIDS Chatter (building) — AI developmental therapy
- SKIDS Nutrition (building) — NutreeAI meal plans
- SKIDS Symphony (building) — game-based hearing screening
- SKIDS Teleconsult (building) — PHR-connected video consult

## Environment Secrets (set via wrangler pages secret put)

BHASH_USER, BHASH_PASS, BHASH_SENDER, NEODOVE_CUSTOM_INTEGRATION_URL,
NEODOVE_WEBHOOK_SECRET, RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET,
FIREBASE_ADMIN_KEY, ADMIN_KEY

## What's LIVE vs BUILDING

LIVE: Auth, child profiles, PHR (milestones/growth/habits/observations/vaccinations/records),
Dr. SKIDS chatbot, blog, organ discovery, intervention pages, services listing,
lead capture → Neodove + WhatsApp, admin CRM dashboard

BUILDING (stubs exist): Razorpay payments, care plan subscriptions, push notifications (FCM),
WHO growth chart visualization, referral system, screening results view,
teleconsult booking, therapy booking, nutrition assessment, hearing game, provider portal

## Top Priority Gaps (from product audit)

1. Payment integration — zero revenue capability without it
2. Real push notifications — zero retention mechanism
3. WHO growth chart — most emotionally resonant feature is just a number list
4. Onboarding wizard — high drop-off after signup
5. Referral system — word-of-mouth untapped
6. Screening results view — core value prop has no parent-facing delivery
