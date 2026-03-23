/// <reference path="../.astro/types.d.ts" />

type D1Database = import('@cloudflare/workers-types').D1Database
type R2Bucket = import('@cloudflare/workers-types').R2Bucket
type KVNamespace = import('@cloudflare/workers-types').KVNamespace
type Ai = import('@cloudflare/workers-types').Ai
type VectorizeIndex = import('@cloudflare/workers-types').VectorizeIndex

type Runtime = import('@astrojs/cloudflare').Runtime<Env>

interface Env {
  DB: D1Database
  R2: R2Bucket
  KV: KVNamespace
  AI: Ai
  VECTORIZE: VectorizeIndex
  FIREBASE_PROJECT_ID: string
  SITE_URL: string
  // Secrets (set via wrangler pages secret put)
  ADMIN_KEY?: string
  BHASH_USER?: string
  BHASH_PASS?: string
  BHASH_SENDER?: string
  NEODOVE_CUSTOM_INTEGRATION_URL?: string
  NEODOVE_WEBHOOK_SECRET?: string
  RAZORPAY_KEY_ID?: string
  RAZORPAY_KEY_SECRET?: string
  FIREBASE_ADMIN_KEY?: string
  CRON_SECRET?: string
  LIVEKIT_API_KEY?: string
  LIVEKIT_API_SECRET?: string
  LIVEKIT_URL?: string
  ADMIN_PHONE?: string
}

declare namespace App {
  interface Locals extends Runtime {
    user?: {
      uid: string
      email?: string
      name?: string
      picture?: string
    }
  }
}

// CAT-5: extend Window with __ADMIN_KEY; top-level interface merges into global Window in script files
interface Window {
  __ADMIN_KEY?: string
}
