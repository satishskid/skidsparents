/**
 * POST /api/care/episodes/book — Create a booking from a care episode
 *
 * Used when:
 * - Doctor schedules a tele or in-person visit from the Care Queue
 * - Parent confirms a pathway that requires booking (4_tele, 5_inperson)
 *
 * Doctor-initiated bookings bypass payment (the child's assigned pediatrician
 * doesn't charge through the platform for care-episode consultations).
 *
 * Creates a service_order at 'scheduled' status and links it to the care episode.
 * For tele: the existing LiveKit session flow works once order is 'scheduled'.
 * For in-person: order is created with scheduled_at for tracking.
 */

import type { APIRoute } from 'astro'
import { getParentId } from '../../children'
import { getEnv } from '@/lib/runtime/env'
import { createNotification } from '@/lib/notifications/service'

export const prerender = false

// Default service IDs for care-episode bookings
// These should exist in the services table (seeded via admin)
const CARE_TELE_SERVICE_SLUG = 'ped-teleconsult'
const CARE_INPERSON_SERVICE_SLUG = 'ped-visit'

export const POST: APIRoute = async ({ request, locals }) => {
  const env = getEnv(locals)

  const body = await request.json() as {
    episodeId: string
    bookingType: 'tele' | 'inperson'
    scheduledAt?: string    // ISO datetime for scheduling
    initiatedBy: 'parent' | 'doctor'
    doctorId?: string       // required if initiatedBy === 'doctor'
  }

  if (!body.episodeId || !body.bookingType || !body.initiatedBy) {
    return new Response(JSON.stringify({ error: 'episodeId, bookingType, and initiatedBy required' }), { status: 400 })
  }

  try {
    // 1. Fetch the care episode
    const episode = await env.DB.prepare(
      `SELECT id, child_id, parent_id, doctor_id, pathway, status, linked_order_id
       FROM care_episodes WHERE id = ?`
    ).bind(body.episodeId).first() as {
      id: string; child_id: string; parent_id: string; doctor_id: string | null
      pathway: string; status: string; linked_order_id: string | null
    } | null

    if (!episode) {
      return new Response(JSON.stringify({ error: 'Episode not found' }), { status: 404 })
    }

    // Don't double-book
    if (episode.linked_order_id) {
      return new Response(JSON.stringify({
        error: 'Episode already has a booking',
        orderId: episode.linked_order_id,
      }), { status: 409 })
    }

    // 2. Auth check
    if (body.initiatedBy === 'parent') {
      const parentId = await getParentId(request, env)
      if (!parentId || parentId !== episode.parent_id) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
      }
    }
    // For doctor-initiated, the doctor episodes API already handles auth

    // 3. Find or create the appropriate service
    const serviceSlug = body.bookingType === 'tele' ? CARE_TELE_SERVICE_SLUG : CARE_INPERSON_SERVICE_SLUG
    let service = await env.DB.prepare(
      `SELECT id, name, price_cents FROM services WHERE slug = ?`
    ).bind(serviceSlug).first() as { id: string; name: string; price_cents: number } | null

    // Auto-create the service if it doesn't exist (first-time setup)
    if (!service) {
      const serviceId = crypto.randomUUID()
      const isTele = body.bookingType === 'tele'
      await env.DB.prepare(
        `INSERT INTO services (id, slug, name, description, short_description, category, delivery_type, provider_type, price_cents, currency, is_active, created_at)
         VALUES (?, ?, ?, ?, ?, 'consultation', ?, 'skids', 0, 'INR', 1, datetime('now'))`
      ).bind(
        serviceId,
        serviceSlug,
        isTele ? 'Pediatric Teleconsultation' : 'Pediatric Visit',
        isTele ? 'Video consultation with your assigned pediatrician, initiated from a care episode.' : 'In-person visit with your assigned pediatrician.',
        isTele ? 'Video call with your pediatrician' : 'Visit your pediatrician in person',
        isTele ? 'telehealth' : 'in_clinic',
      ).run()
      service = { id: serviceId, name: isTele ? 'Pediatric Teleconsultation' : 'Pediatric Visit', price_cents: 0 }
    }

    // 4. Determine provider (doctor_id from episode, or from doctor_patients)
    let providerId = episode.doctor_id
    if (!providerId) {
      // Try to find the assigned doctor via doctor_patients
      const doc = await env.DB.prepare(
        `SELECT doctor_id FROM doctor_patients WHERE child_id = ? AND status = 'active' LIMIT 1`
      ).bind(episode.child_id).first() as { doctor_id: string } | null
      providerId = doc?.doctor_id || null
    }

    // 5. Create service_order at 'scheduled' status (bypassing payment)
    const orderId = crypto.randomUUID()
    const roomName = `skids-${orderId}`
    const scheduledAt = body.scheduledAt || new Date(Date.now() + 86400000).toISOString() // default: tomorrow

    await env.DB.prepare(
      `INSERT INTO service_orders
        (id, parent_id, child_id, service_id, provider_id,
         status, session_url, scheduled_at, amount_cents,
         commission_pct_snapshot, brand, created_at)
       VALUES (?, ?, ?, ?, ?, 'scheduled', ?, ?, 0, 0, 'skids', datetime('now'))`
    ).bind(
      orderId,
      episode.parent_id,
      episode.child_id,
      service.id,
      providerId,
      body.bookingType === 'tele' ? roomName : null,
      scheduledAt,
    ).run()

    // 6. Link order to care episode
    const newPathway = body.bookingType === 'tele' ? '4_tele' : '5_inperson'
    await env.DB.prepare(
      `UPDATE care_episodes
       SET linked_order_id = ?, pathway = ?, status = 'awaiting_ped',
           updated_at = datetime('now')
       WHERE id = ?`
    ).bind(orderId, newPathway, body.episodeId).run()

    // 7. Notify parent (if doctor-initiated)
    if (body.initiatedBy === 'doctor') {
      try {
        const msg = body.bookingType === 'tele'
          ? 'Your pediatrician has scheduled a video consultation. You\'ll be notified when it\'s time to join.'
          : `Your pediatrician has scheduled an in-person visit. Please plan to visit the clinic.`
        await createNotification(env.DB, {
          parentId: episode.parent_id,
          childId: episode.child_id,
          type: 'service_update',
          title: body.bookingType === 'tele' ? 'Video consultation scheduled' : 'In-person visit scheduled',
          body: msg,
          actionUrl: `/care/episode/${body.episodeId}`,
          dataJson: { episodeId: body.episodeId, orderId, bookingType: body.bookingType },
        })
      } catch { /* non-blocking */ }
    }

    return new Response(JSON.stringify({
      orderId,
      episodeId: body.episodeId,
      bookingType: body.bookingType,
      pathway: newPathway,
      scheduledAt,
      roomName: body.bookingType === 'tele' ? roomName : null,
      serviceName: service.name,
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (e: unknown) {
    console.error('[Care Episode Book] Error:', e)
    return new Response(JSON.stringify({ error: 'Failed to create booking' }), { status: 500 })
  }
}
