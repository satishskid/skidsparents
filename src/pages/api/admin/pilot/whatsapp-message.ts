/**
 * GET /api/admin/pilot/whatsapp-message — Generate WhatsApp invite message
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

export const GET: APIRoute = async ({ request, locals }) => {
  const env = getEnv(locals)
  if (!checkAuth(request, env)) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } })
  const db = env.DB
  if (!db) return new Response(JSON.stringify({ error: 'DB unavailable' }), { status: 500, headers: { 'Content-Type': 'application/json' } })

  const url = new URL(request.url)
  const inviteId = url.searchParams.get('id')
  if (!inviteId) return new Response(JSON.stringify({ error: 'Invitation id required' }), { status: 400, headers: { 'Content-Type': 'application/json' } })

  const invite = await db.prepare(`
    SELECT pi.*, d.name as doctor_name, d.clinic_name FROM pilot_invitations pi LEFT JOIN doctors d ON pi.assigned_doctor_id = d.id WHERE pi.id = ?
  `).bind(inviteId).first() as any

  if (!invite) return new Response(JSON.stringify({ error: 'Invitation not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } })

  const parentName = invite.parent_name || 'there'
  const doctorInfo = invite.doctor_name ? `Dr. ${invite.doctor_name}${invite.clinic_name ? ` at ${invite.clinic_name}` : ''}` : 'our pediatrician'
  const pilotLink = `https://parent.skids.clinic/pilot?code=${invite.invite_code}`

  const message = `Hi ${parentName}!\n\nYour child was recently screened by SKIDS, and we have exciting news!\n\nYou're invited to experience *SKIDS Intelligence* — our AI-powered pediatric health platform that gives you personalized insights about your child's health, growth, and development.\n\nYour invite code: *${invite.invite_code}*\nYour pediatrician: ${doctorInfo}\n\nGet started: ${pilotLink}\n\nWhat you'll see:\n- Personalized health projections from your child's screening\n- Age-appropriate growth & development guidance\n- Direct connection with your pediatrician\n- Evidence-based intervention recommendations\n\nThis is a special invite-only preview.\n\n— Team SKIDS`

  const whatsappUrl = invite.parent_phone
    ? `https://wa.me/${invite.parent_phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`
    : null

  return new Response(JSON.stringify({ message, whatsapp_url: whatsappUrl, invite_code: invite.invite_code }), { status: 200, headers: { 'Content-Type': 'application/json' } })
}
