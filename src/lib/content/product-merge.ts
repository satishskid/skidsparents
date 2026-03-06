/**
 * Product Merge Utility
 *
 * Merges code defaults (interventions.ts) with DB overrides (products table).
 * DB values win. Empty DB fields fall back to code defaults.
 * PM-created products (no code match) render without interactive React components.
 */

import { INTERVENTIONS, type Intervention } from './interventions'

// D1 row shape (snake_case)
export interface ProductRow {
  slug: string
  brand: string
  emoji: string
  tagline: string | null
  description: string | null
  status: string | null
  visible: number
  wonder_fact: string | null
  why_it_matters: string | null
  how_it_works_json: string | null
  what_you_get_json: string | null
  stats_json: string | null
  faqs_json: string | null
  age_range: string | null
  cta_label: string | null
  gradient: string | null
  sort_order: number
  created_at: string | null
  updated_at: string | null
}

// Unified product for display
export interface DisplayProduct {
  slug: string
  brand: string
  emoji: string
  tagline: string
  description: string
  status: 'available' | 'building'
  gradient: string
  wonderFact: string
  whyItMatters: string
  howItWorks: { step: number; title: string; description: string; emoji: string }[]
  whatYouGet: string[]
  stats: { value: string; label: string }[]
  faqs: { q: string; a: string }[]
  ageRange: string
  ctaLabel: string
  // Code-only fields (only for code-backed products)
  component?: string
  relatedOrgan?: string
  servicesSlugs?: string[]
  relatedCategories?: string[]
  duration?: string
  // Metadata
  visible: boolean
  hasCodeDefaults: boolean
  sortOrder: number
  updatedAt: string | null
}

function safeJsonParse<T>(json: string | null, fallback: T): T {
  if (!json) return fallback
  try { return JSON.parse(json) } catch { return fallback }
}

/**
 * Merge code defaults with DB overrides.
 * - Code defaults with DB override → DB wins for non-null fields
 * - Code defaults without DB row → code default as-is
 * - DB-only products (no code match) → DB content, no interactive component
 */
export function mergeProducts(dbRows: ProductRow[]): DisplayProduct[] {
  const dbMap = new Map(dbRows.map(r => [r.slug, r]))
  const seen = new Set<string>()
  const results: DisplayProduct[] = []

  // 1. Code defaults first, apply DB overrides
  for (let i = 0; i < INTERVENTIONS.length; i++) {
    const code = INTERVENTIONS[i]
    seen.add(code.slug)
    const db = dbMap.get(code.slug)

    results.push({
      slug: code.slug,
      brand: db?.brand || code.brand,
      emoji: db?.emoji || code.emoji,
      tagline: db?.tagline || code.tagline,
      description: db?.description || code.description,
      status: (db?.status as 'available' | 'building') || code.status,
      gradient: db?.gradient || code.gradient,
      wonderFact: db?.wonder_fact || code.wonderFact,
      whyItMatters: db?.why_it_matters || code.whyItMatters,
      howItWorks: safeJsonParse(db?.how_it_works_json ?? null, code.howItWorks),
      whatYouGet: safeJsonParse(db?.what_you_get_json ?? null, code.whatYouGet),
      stats: safeJsonParse(db?.stats_json ?? null, code.stats),
      faqs: safeJsonParse(db?.faqs_json ?? null, code.faqs),
      ageRange: db?.age_range || code.ageRange,
      ctaLabel: db?.cta_label || code.ctaLabel,
      component: code.component,
      relatedOrgan: code.relatedOrgan,
      servicesSlugs: code.servicesSlugs,
      relatedCategories: code.relatedCategories,
      duration: code.duration,
      visible: db ? db.visible === 1 : true,
      hasCodeDefaults: true,
      sortOrder: db?.sort_order ?? i,
      updatedAt: db?.updated_at || null,
    })
  }

  // 2. DB-only products (PM-created)
  for (const db of dbRows) {
    if (seen.has(db.slug)) continue
    results.push({
      slug: db.slug,
      brand: db.brand,
      emoji: db.emoji,
      tagline: db.tagline || '',
      description: db.description || '',
      status: (db.status as 'available' | 'building') || 'building',
      gradient: db.gradient || 'from-gray-500 to-gray-600',
      wonderFact: db.wonder_fact || '',
      whyItMatters: db.why_it_matters || '',
      howItWorks: safeJsonParse(db.how_it_works_json, []),
      whatYouGet: safeJsonParse(db.what_you_get_json, []),
      stats: safeJsonParse(db.stats_json, []),
      faqs: safeJsonParse(db.faqs_json, []),
      ageRange: db.age_range || '',
      ctaLabel: db.cta_label || 'Get Started',
      visible: db.visible === 1,
      hasCodeDefaults: false,
      sortOrder: db.sort_order,
      updatedAt: db.updated_at,
    })
  }

  results.sort((a, b) => a.sortOrder - b.sortOrder)
  return results
}
