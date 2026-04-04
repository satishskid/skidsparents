/**
 * POST /api/pilot/accept — Accept a pilot invitation
 * Links parent to invitation, assigns to doctor.
 */
import type { APIRoute } from 'astro'
import { getEnv } from '@/lib/runtime/env'

export const prerender = false

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const { invite_code, parent_id, child_id } = await request.json()
    if (!invite_code || !parent_id) {
      return new Response(JSON.stringify({ error: 'invite_code and parent_id required' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
    }

    const env = getEnv(locals)
    const db = env.DB
    if (!db) return new Response(JSON.stringify({ error: 'Database not available' }), { status: 500, headers: { 'Content-Type': 'application/json' } })

    const invite = await db.prepare(
      'SELECT * FROM pilot_invitations WHERE invite_code = ? AND status = ?'
    ).bind(invite_code.trim().toUpperCase(), 'pending').first() as any

    if (!invite) {
      return new Response(JSON.stringify({ error: 'Invalid or already used invite code' }), { status: 404, headers: { 'Content-Type': 'application/json' } })
    }

    await db.prepare(`
      UPDATE pilot_invitations SET status = 'accepted', parent_id = ?, child_id = ?, accepted_at = datetime('now') WHERE id = ?
    `).bind(parent_id, child_id || null, invite.id).run()

    if (invite.pilot_group) {
      await db.prepare('UPDATE pilot_groups SET current_count = current_count + 1 WHERE name = ?').bind(invite.pilot_group).run()
    }

    if (child_id && invite.assigned_doctor_id) {
      try {
        const linkId = crypto.randomUUID().replace(/-/g, '').slice(0, 16)
        await db.prepare(`
          INSERT OR IGNORE INTO doctor_patients (id, doctor_id, child_id, relationship, linked_by, status) VALUES (?, ?, ?, 'primary', 'pilot', 'active')
        `).bind(linkId, invite.assigned_doctor_id, child_id).run()
      } catch { /* already linked */ }
    }

    const logId = crypto.randomUUID().replace(/-/g, '').slice(0, 16)
    await db.prepare(`
      INSERT INTO pilot_engagement_log (id, parent_id, child_id, event_type, event_data_json) VALUES (?, ?, ?, 'pilot_accepted', ?)
    `).bind(logId, parent_id, child_id || null, JSON.stringify({ invite_code, group: invite.pilot_group })).run()

    return new Response(JSON.stringify({ success: true, doctor_id: invite.assigned_doctor_id, group: invite.pilot_group }), { status: 200, headers: { 'Content-Type': 'application/json' } })
  } catch (err: any) {
    console.error('[Pilot] Accept error:', err)
    return new Response(JSON.stringify({ error: 'Failed to accept invitation' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
}
