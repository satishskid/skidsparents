/**
 * GET /api/products — Public API returning all visible products
 * GET /api/products?slug=vision — Single product by slug
 *
 * No auth required. Used by SSR intervention pages.
 * Falls back to code defaults if DB is unavailable.
 */

import type { APIRoute } from 'astro'
import { INTERVENTIONS } from '@/lib/content/interventions'
import { mergeProducts, type ProductRow } from '@/lib/content/product-merge'
import { getEnv } from '@/lib/runtime/env'

export const prerender = false

export const GET: APIRoute = async ({ locals, url }) => {
  const env = getEnv(locals)
  const db = env.DB
  const slug = url.searchParams.get('slug')

  // Try DB merge
  let products
  if (db) {
    try {
      const { results } = await db.prepare('SELECT * FROM products ORDER BY sort_order, created_at').all()
      const merged = mergeProducts(results as unknown as ProductRow[])
      products = merged.filter(p => p.visible)
    } catch {}
  }

  // Fallback to code defaults
  if (!products) {
    products = INTERVENTIONS.map((i, idx) => ({
      ...i,
      visible: true,
      hasCodeDefaults: true,
      sortOrder: idx,
      updatedAt: null,
    }))
  }

  if (slug) {
    const product = products.find(p => p.slug === slug)
    if (!product) {
      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }
    return new Response(JSON.stringify(product), {
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return new Response(JSON.stringify(products), {
    headers: { 'Content-Type': 'application/json' },
  })
}
