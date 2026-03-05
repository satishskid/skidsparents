/**
 * SKIDS Analytics & Integration Config
 * =====================================
 * STRICT COMPLIANCE: brand=skids namespace is MANDATORY on every event,
 * lead, spend log, and conversion. No event/record accepted without brand.
 *
 * Tracking layers:
 *   1. GA4        — G-T5E4SKLMG3  (brand, center, funnel_stage, asset_code)
 *   2. Meta Pixel — 9115270055242145 (brand: "skids" in custom_data)
 *   3. Cloudflare Web Analytics — beacon token
 *
 * Integrations:
 *   4. BHASH      — WhatsApp Business API (sender: BUZWAP)
 *   5. Neodove    — Telecaller CRM (lead capture with brand=skids)
 */

// ─── IDs (client-safe, non-secret) ───

export const GA4_MEASUREMENT_ID = 'G-T5E4SKLMG3'
export const GA4_PROPERTY_ID = '302728829'
export const META_PIXEL_ID = '9115270055242145'
export const CF_ANALYTICS_TOKEN = '309a8c94a071430fbbec01c920007bda'

// ─── Brand Namespace (MANDATORY) ───

export const BRAND_NAMESPACE = 'skids' as const

// ─── Funnel Stages ───

export type FunnelStage =
  | 'awareness'      // Blog/SEO/Social discovery
  | 'interest'       // Organ/Habit exploration, Dr. SKIDS chat
  | 'consideration'  // Timeline usage, milestone tracking
  | 'intent'         // Service page views, booking interest
  | 'conversion'     // Booking completed, payment made
  | 'retention'      // Return visits, habit tracking, push re-engagement

// ─── Event Payload (GA4 + Meta compliance) ───

export interface SkidsEventParams {
  brand: typeof BRAND_NAMESPACE    // REQUIRED — always 'skids'
  center?: string                  // e.g. 'online', 'mumbai', 'delhi'
  funnel_stage: FunnelStage        // REQUIRED — where in funnel
  asset_code?: string              // e.g. 'blog_brain_dev', 'organ_eyes'
  [key: string]: string | number | boolean | undefined
}

// ─── UTM Naming Standard ───
// utm_campaign MUST start with 'skids_'
// Format: skids_<service>_<city>_<offer>_<month>
// Example: skids_telemedicine_mumbai_free-consult_mar2026

export interface SkidsUTM {
  utm_source: string               // platform (google, meta, instagram, whatsapp)
  utm_medium: string               // channel type (cpc, organic, social, referral, email)
  utm_campaign: string             // MUST start with 'skids_'
  utm_content?: string             // creative/ad name
  asset?: string                   // asset code
}

/**
 * Validate UTM campaign follows skids_ prefix rule.
 * Returns true if valid, false if non-compliant.
 */
export function validateUTMCampaign(campaign: string): boolean {
  return campaign.startsWith('skids_')
}

/**
 * Parse UTM params from current URL.
 * Flags non-compliant campaigns in console.
 */
export function parseUTMFromURL(): Partial<SkidsUTM> | null {
  if (typeof window === 'undefined') return null
  const params = new URLSearchParams(window.location.search)
  const campaign = params.get('utm_campaign')

  if (!campaign) return null

  if (!validateUTMCampaign(campaign)) {
    console.warn(
      `[SKIDS Analytics] NON-COMPLIANT UTM: campaign="${campaign}" does not start with "skids_". ` +
      `Expected format: skids_<service>_<city>_<offer>_<month>`
    )
  }

  return {
    utm_source: params.get('utm_source') || undefined,
    utm_medium: params.get('utm_medium') || undefined,
    utm_campaign: campaign,
    utm_content: params.get('utm_content') || undefined,
    asset: params.get('asset') || undefined,
  }
}

// ─── Lead Capture Schema (CRM compliance) ───
// brand is REQUIRED — default is never blank, always 'skids'

export interface SkidsLead {
  brand: typeof BRAND_NAMESPACE    // REQUIRED — 'skids'
  name: string
  phone: string
  email?: string
  source: string                   // utm_source or 'organic'
  medium: string                   // utm_medium or 'direct'
  campaign?: string                // utm_campaign (must be skids_ prefixed)
  funnel_stage: FunnelStage
  asset_code?: string
  center?: string
  child_age_months?: number
  notes?: string
  created_at: string               // ISO 8601
}

/**
 * Build a compliant lead object with brand=skids enforced.
 */
export function buildLead(data: Omit<SkidsLead, 'brand' | 'created_at'>): SkidsLead {
  return {
    brand: BRAND_NAMESPACE,
    ...data,
    created_at: new Date().toISOString(),
  }
}

// ─── BHASH WhatsApp API Config ───
// Credentials stored as env vars on server (wrangler secrets)
// BHASH_USER, BHASH_PASS, BHASH_SENDER are server-side only

export const BHASH_CONFIG = {
  /** WhatsApp Business sender ID */
  sender: 'BUZWAP',
  /** Brand tag for all messages */
  brand: BRAND_NAMESPACE,
  /** API base (server-side only, needs BHASH_USER + BHASH_PASS) */
  // Actual URL is configured server-side via env vars
} as const

// ─── Neodove CRM Config ───
// Webhook URL and secret are server-side only (wrangler secrets)

export const NEODOVE_CONFIG = {
  /** Brand tag for all CRM entries */
  brand: BRAND_NAMESPACE,
  /** Lead payload must include brand=skids */
  requiredFields: ['brand', 'name', 'phone', 'source', 'funnel_stage'] as const,
} as const

// ─── Integration Types (for API routes) ───

/** BHASH WhatsApp message payload */
export interface BhashMessage {
  to: string           // phone with country code (e.g. 917377112777)
  sender: string       // BUZWAP
  brand: typeof BRAND_NAMESPACE
  template?: string    // WhatsApp template name
  params?: string[]    // template variable values
}

/** Neodove lead push payload */
export interface NeodoveLead {
  brand: typeof BRAND_NAMESPACE
  name: string
  phone: string
  email?: string
  source: string
  campaign?: string
  notes?: string
  tags?: string[]      // e.g. ['skids', 'telemedicine', 'milestone-check']
}
