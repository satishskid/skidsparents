/**
 * GET /api/admin/products — List all products (merged code + DB)
 * POST /api/admin/products — Create or update a product
 */

import type { APIRoute } from 'astro'
import { mergeProducts, type ProductRow } from '@/lib/content/product-merge'

export const prerender = false

function checkAuth(request: Request, env: any): boolean {
  const adminKey = env.ADMIN_KEY
  if (!adminKey) return true
  const auth = request.headers.get('Authorization')
  if (!auth) return false
  return auth === `Bearer ${adminKey}` || auth === adminKey
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/skids\s*/i, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    || 'product'
}

export const GET: APIRoute = async ({ request, locals }) => {
  const runtime = (locals as any).runtime
  const env = runtime?.env || {}

  if (!checkAuth(request, env)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const db = env.DB
  let dbRows: ProductRow[] = []

  if (db) {
    try {
      const { results } = await db.prepare('SELECT * FROM products ORDER BY sort_order, created_at').all()
      dbRows = results as unknown as ProductRow[]
    } catch {}
  }

  const products = mergeProducts(dbRows)
  return new Response(JSON.stringify({ products }), {
    headers: { 'Content-Type': 'application/json' },
  })
}

export const POST: APIRoute = async ({ request, locals }) => {
  const runtime = (locals as any).runtime
  const env = runtime?.env || {}

  if (!checkAuth(request, env)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const db = env.DB
  if (!db) {
    return new Response(JSON.stringify({ error: 'Database not available' }), { status: 500 })
  }

  try {
    const body = await request.json()

    // Handle visibility toggle
    if (body.action === 'toggle_visibility') {
      await db.prepare(
        'UPDATE products SET visible = ?, updated_at = datetime(\'now\') WHERE slug = ?'
      ).bind(body.visible ? 1 : 0, body.slug).run()
      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Handle delete (DB-only products)
    if (body.action === 'delete') {
      await db.prepare('DELETE FROM products WHERE slug = ?').bind(body.slug).run()
      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Create or update product
    const { brand, emoji, tagline, description, status, gradient, age_range, cta_label } = body
    if (!brand) {
      return new Response(JSON.stringify({ error: 'Brand name is required' }), { status: 400 })
    }

    // Auto-generate slug for new products, or use provided slug
    let slug = body.slug || slugify(brand)

    // Check slug uniqueness for new products
    if (!body.slug) {
      const existing = await db.prepare('SELECT slug FROM products WHERE slug = ?').bind(slug).first()
      if (existing) {
        slug = `${slug}-${Date.now().toString(36).slice(-4)}`
      }
    }

    await db.prepare(`
      INSERT OR REPLACE INTO products (
        slug, brand, emoji, tagline, description, status, visible,
        wonder_fact, why_it_matters, how_it_works_json, what_you_get_json,
        stats_json, faqs_json, age_range, cta_label, gradient, sort_order,
        created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        COALESCE((SELECT created_at FROM products WHERE slug = ?), datetime('now')),
        datetime('now')
      )
    `).bind(
      slug,
      brand,
      emoji || '📦',
      tagline || null,
      description || null,
      status || 'building',
      body.visible !== undefined ? (body.visible ? 1 : 0) : 1,
      body.wonder_fact || null,
      body.why_it_matters || null,
      body.how_it_works_json ? JSON.stringify(body.how_it_works_json) : null,
      body.what_you_get_json ? JSON.stringify(body.what_you_get_json) : null,
      body.stats_json ? JSON.stringify(body.stats_json) : null,
      body.faqs_json ? JSON.stringify(body.faqs_json) : null,
      age_range || null,
      cta_label || null,
      gradient || 'from-gray-500 to-gray-600',
      body.sort_order ?? 99,
      slug, // for COALESCE on created_at
    ).run()

    return new Response(JSON.stringify({ success: true, slug }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err: any) {
    console.error('[Admin] Products error:', err)
    return new Response(
      JSON.stringify({ error: 'Failed to save product', detail: err?.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
