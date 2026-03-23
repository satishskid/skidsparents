/**
 * GET  /api/admin/providers          — list all providers
 * POST /api/admin/providers/:id/approve  — approve provider
 * POST /api/admin/providers/:id/suspend  — suspend provider
 * PATCH /api/admin/providers/:id/commission — update commission %
 *
 * All routes: ADMIN_KEY bearer auth
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

async function sendWhatsApp(phone: string, text: string, env: Env): Promise<void> {
  if (!phone || !env.BHASH_USER) return
  const digits = phone.replace(/\D/g, '').replace(/^91/, '')
  if (digits.length !== 10) return
  const params = new URLSearchParams({
    user: env.BHASH_USER,
    pass: env.BHASH_PASS ?? '',       // optional secret; empty string skips auth on BHASH side
    sender: env.BHASH_SENDER ?? '',   // optional; BHASH uses account default if blank
    phone: `91${digits}`,
    text,
    priority: 'ndnd',
    stype: 'normal',
  })
  await fetch(`https://api.bsms.in/api/instant.php?${params}`).catch(() => {})
}

async function writeAuditLog(
  db: D1Database,
  actorId: string,
  actionType: string,
  targetType: string,
  targetId: string,
  previousValueJson: string | null,
  newValueJson: string | null,
  reason: string | null
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO audit_log (id, actor_id, action_type, target_type, target_id, previous_value_json, new_value_json, reason, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`
    )
    .bind(
      crypto.randomUUID(),
      actorId,
      actionType,
      targetType,
      targetId,
      previousValueJson,
      newValueJson,
      reason
    )
    .run()
}

export const GET: APIRoute = async ({ request, locals }) => {
  const env = getEnv(locals)
  if (!checkAuth(request, env)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  try {
    const { results } = await env.DB.prepare(
      `SELECT p.*, COUNT(so.id) as order_count
       FROM providers p
       LEFT JOIN service_orders so ON so.provider_id = p.id
       GROUP BY p.id
       ORDER BY p.created_at DESC`
    ).all()

    return new Response(JSON.stringify({ providers: results || [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (e: unknown) {
    console.error('[Admin] providers GET error:', e)
    return new Response(JSON.stringify({ error: 'Failed to fetch providers' }), { status: 500 })
  }
}

export const POST: APIRoute = async ({ request, locals, url }) => {
  const env = getEnv(locals)
  if (!checkAuth(request, env)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  // Extract action and id from URL path: /api/admin/providers/:id/approve|suspend
  const parts = url.pathname.split('/')
  const action = parts[parts.length - 1] // 'approve' or 'suspend'
  const providerId = parts[parts.length - 2]

  if (!providerId || !['approve', 'suspend'].includes(action)) {
    return new Response(JSON.stringify({ error: 'Invalid route' }), { status: 400 })
  }

  try {
    interface ProviderRow { id: string; name: string; contact_phone: string; status: string; is_verified: number }
    const provider = await env.DB.prepare(
      'SELECT id, name, contact_phone, status, is_verified FROM providers WHERE id = ?'
    ).bind(providerId).first<ProviderRow>()

    if (!provider) {
      return new Response(JSON.stringify({ error: 'Provider not found' }), { status: 404 })
    }

    const prevStatus = provider.status
    let newStatus: string
    let isVerified: number
    let actionType: string

    if (action === 'approve') {
      newStatus = 'active'
      isVerified = 1
      actionType = 'provider_approved'
    } else {
      newStatus = 'suspended'
      isVerified = 0
      actionType = 'provider_suspended'
    }

    await env.DB.prepare(
      `UPDATE providers SET is_verified = ?, status = ? WHERE id = ?`
    ).bind(isVerified, newStatus, providerId).run()

    await writeAuditLog(
      env.DB,
      'admin',
      actionType,
      'provider',
      providerId,
      JSON.stringify({ status: prevStatus }),
      JSON.stringify({ status: newStatus }),
      null
    )

    if (action === 'approve' && provider.contact_phone) {
      await sendWhatsApp(
        provider.contact_phone,
        `Hi ${provider.name}, your SKIDS provider account has been approved. You can now log in at parent.skids.clinic/provider`,
        env
      )
    }

    return new Response(JSON.stringify({ success: true, status: newStatus }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (e: unknown) {
    console.error('[Admin] providers POST error:', e)
    return new Response(JSON.stringify({ error: 'Failed to update provider' }), { status: 500 })
  }
}

export const PATCH: APIRoute = async ({ request, locals, url }) => {
  const env = getEnv(locals)
  if (!checkAuth(request, env)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  // /api/admin/providers/:id/commission
  const parts = url.pathname.split('/')
  const providerId = parts[parts.length - 2]

  try {
    const body = await request.json() as { commissionPct: number; reason?: string }
    const { commissionPct, reason } = body

    if (typeof commissionPct !== 'number' || commissionPct < 0 || commissionPct > 50) {
      return new Response(JSON.stringify({ error: 'commissionPct must be 0–50' }), { status: 400 })
    }

    interface ProviderCommissionRow { id: string; commission_pct: number }
    const provider = await env.DB.prepare(
      'SELECT id, commission_pct FROM providers WHERE id = ?'
    ).bind(providerId).first<ProviderCommissionRow>()

    if (!provider) {
      return new Response(JSON.stringify({ error: 'Provider not found' }), { status: 404 })
    }

    await env.DB.prepare(
      'UPDATE providers SET commission_pct = ? WHERE id = ?'
    ).bind(commissionPct, providerId).run()

    await writeAuditLog(
      env.DB,
      'admin',
      'commission_updated',
      'provider',
      providerId,
      JSON.stringify({ commission_pct: provider.commission_pct }),
      JSON.stringify({ commission_pct: commissionPct }),
      reason || null
    )

    return new Response(JSON.stringify({ success: true, commissionPct }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (e: unknown) {
    console.error('[Admin] commission PATCH error:', e)
    return new Response(JSON.stringify({ error: 'Failed to update commission' }), { status: 500 })
  }
}
