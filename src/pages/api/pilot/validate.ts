/**
 * POST /api/pilot/validate — Validate a pilot invite code
 * Public endpoint. Returns invitation status + assigned doctor info.
 */
import type { APIRoute } from 'astro'
import { getEnv } from '@/lib/runtime/env'

export const prerender = false

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const { invite_code } = await request.json()
    if (!invite_code || typeof invite_code !== 'string') {
      return new Response(JSON.stringify({ error: 'Invite code required' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
    }

    const env = getEnv(locals)
    const db = env.DB
    if (!db) {
      return new Response(JSON.stringify({ error: 'Database not available' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
    }

    const invite = await db.prepare(`
      SELECT pi.*, d.name as doctor_name, d.clinic_name, d.specialty,
             pg.name as group_name, pg.description as group_description
      FROM pilot_invitations pi
      LEFT JOIN doctors d ON pi.assigned_doctor_id = d.id
      LEFT JOIN pilot_groups pg ON pi.pilot_group = pg.name
      WHERE pi.invite_code = ?
    `).bind(invite_code.trim().toUpperCase()).first() as any

    if (!invite) {
      return new Response(JSON.stringify({ error: 'Invalid invite code' }), { status: 404, headers: { 'Content-Type': 'application/json' } })
    }

    if (invite.status === 'expired' || invite.status === 'revoked') {
      return new Response(JSON.stringify({ error: 'This invitation has expired', status: invite.status }), { status: 410, headers: { 'Content-Type': 'application/json' } })
    }

    if (invite.status === 'accepted') {
      return new Response(JSON.stringify({ error: 'This invitation has already been used', status: 'accepted' }), { status: 409, headers: { 'Content-Type': 'application/json' } })
    }

    return new Response(JSON.stringify({
      valid: true,
      invite_code: invite.invite_code,
      parent_name: invite.parent_name,
      child_qr_code: invite.child_qr_code,
      source: invite.source,
      doctor: invite.doctor_name ? {
        name: invite.doctor_name,
        clinic: invite.clinic_name,
        specialty: invite.specialty,
      } : null,
      group: invite.group_name ? {
        name: invite.group_name,
        description: invite.group_description,
      } : null,
    }), { status: 200, headers: { 'Content-Type': 'application/json' } })
  } catch (err: any) {
    console.error('[Pilot] Validate error:', err)
    return new Response(JSON.stringify({ error: 'Failed to validate invite code' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
}
