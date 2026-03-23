/**
 * GET /api/admin/campaigns?product_slug=vision — List campaigns for a product
 * POST /api/admin/campaigns — Create or update a campaign
 */

import type { APIRoute } from 'astro'
import { getEnv } from '@/lib/runtime/env'

export const prerender = false

function checkAuth(request: Request, env: Env): boolean {
  const adminKey = env.ADMIN_KEY
  if (!adminKey) return true
  const auth = request.headers.get('Authorization')
  if (!auth) return false
  return auth === `Bearer ${adminKey}` || auth === adminKey
}

export const GET: APIRoute = async ({ request, locals, url }) => {
  const env = getEnv(locals)

  if (!checkAuth(request, env)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const db = env.DB
  if (!db) {
    return new Response(JSON.stringify({ campaigns: [] }), {
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const productSlug = url.searchParams.get('product_slug')

  try {
    let campaigns: any[]
    if (productSlug) {
      const { results } = await db.prepare(
        'SELECT * FROM campaigns WHERE product_slug = ? ORDER BY created_at DESC'
      ).bind(productSlug).all()
      campaigns = results
    } else {
      const { results } = await db.prepare(
        'SELECT * FROM campaigns ORDER BY created_at DESC'
      ).all()
      campaigns = results
    }

    // Compute lead counts and UTM links
    const enriched = await Promise.all(campaigns.map(async (c: any) => {
      let leadCount = 0
      try {
        interface CountRow { cnt: number }
        const countResult = await db.prepare(
          "SELECT COUNT(*) as cnt FROM leads WHERE campaign = ? OR utm_campaign = ?"
        ).bind(c.utm_campaign || '', c.utm_campaign || '').first<CountRow>()
        leadCount = countResult?.cnt || 0
      } catch {}

      return {
        ...c,
        leads_count: leadCount,
        utm_link: `https://skidsparent.pages.dev/interventions/${c.product_slug}?utm_source=${c.utm_source || 'whatsapp'}&utm_medium=${c.utm_medium || 'campaign'}&utm_campaign=${c.utm_campaign || ''}`,
      }
    }))

    return new Response(JSON.stringify({ campaigns: enriched }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e)
    return new Response(
      JSON.stringify({ error: 'Failed to fetch campaigns', detail: message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

export const POST: APIRoute = async ({ request, locals }) => {
  const env = getEnv(locals)

  if (!checkAuth(request, env)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const db = env.DB
  if (!db) {
    return new Response(JSON.stringify({ error: 'Database not available' }), { status: 500 })
  }

  try {
    interface CampaignBody {
      product_slug: string
      campaign_code: string
      whatsapp_template?: string
      action?: string
      id?: string
      is_active?: boolean
      utm_source?: string
      utm_medium?: string
    }
    const body = await request.json() as CampaignBody
    const { product_slug, campaign_code, whatsapp_template } = body

    if (!product_slug || !campaign_code) {
      return new Response(
        JSON.stringify({ error: 'product_slug and campaign_code are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Clean and uppercase campaign code
    const cleanCode = campaign_code.toUpperCase().replace(/[^A-Z0-9_]/g, '')
    const utmCampaign = `skids_${product_slug}_${cleanCode.toLowerCase()}`

    // Handle delete
    if (body.action === 'delete') {
      await db.prepare('DELETE FROM campaigns WHERE id = ?').bind(body.id).run()
      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Upsert
    if (body.id) {
      // Update existing
      await db.prepare(`
        UPDATE campaigns SET
          campaign_code = ?, whatsapp_template = ?, utm_campaign = ?,
          is_active = ?, updated_at = datetime('now')
        WHERE id = ?
      `).bind(
        cleanCode,
        whatsapp_template || null,
        utmCampaign,
        body.is_active !== undefined ? (body.is_active ? 1 : 0) : 1,
        body.id,
      ).run()
    } else {
      // Insert new
      await db.prepare(`
        INSERT INTO campaigns (product_slug, campaign_code, whatsapp_template, utm_campaign, utm_source, utm_medium)
        VALUES (?, ?, ?, ?, ?, ?)
      `).bind(
        product_slug,
        cleanCode,
        whatsapp_template || null,
        utmCampaign,
        body.utm_source || 'whatsapp',
        body.utm_medium || 'campaign',
      ).run()
    }

    return new Response(JSON.stringify({ success: true, utm_campaign: utmCampaign }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (e: unknown) {
    console.error('[Admin] Campaign error:', e)
    const message = e instanceof Error ? e.message : String(e)
    return new Response(
      JSON.stringify({ error: 'Failed to save campaign', detail: message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
