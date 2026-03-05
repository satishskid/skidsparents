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
