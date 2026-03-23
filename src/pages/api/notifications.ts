/**
 * GET  /api/notifications — List notifications for authenticated parent
 * POST /api/notifications — Mark notification(s) as read
 */

import type { APIRoute } from 'astro'
import { getParentId } from '@/pages/api/children'
import { getEnv } from '@/lib/runtime/env'

export const prerender = false

export const GET: APIRoute = async ({ request, locals }) => {
  const env = getEnv(locals)
  const parentId = await getParentId(request, env)
  if (!parentId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const { results } = await env.DB.prepare(
      `SELECT id, type, title, body, data_json, read, created_at
       FROM notifications
       WHERE parent_id = ?
       ORDER BY created_at DESC`
    ).bind(parentId).all()

    const notifications = results || []
    const unreadCount = notifications.filter((n: any) => !n.read || n.read === 0).length

    return new Response(JSON.stringify({ notifications, unreadCount }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (e: unknown) {
    if (e instanceof Error && e.message.includes('no such table')) {
      return new Response(JSON.stringify({ notifications: [], unreadCount: 0 }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }
    console.error('[Notifications] GET error:', e)
    return new Response(JSON.stringify({ error: 'Failed to fetch notifications' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

export const POST: APIRoute = async ({ request, locals }) => {
  const env = getEnv(locals)
  const parentId = await getParentId(request, env)
  if (!parentId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const body = await request.json() as { action: string; id?: string }
    const { action, id } = body

    if (action === 'mark_read') {
      if (!id) {
        return new Response(JSON.stringify({ error: 'id is required for mark_read' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        })
      }

      interface NotificationRow { parent_id: string }
      const row = await env.DB.prepare(
        'SELECT parent_id FROM notifications WHERE id = ?'
      ).bind(id).first<NotificationRow>()

      if (!row) {
        return new Response(JSON.stringify({ error: 'Notification not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        })
      }

      if (row.parent_id !== parentId) {
        return new Response(JSON.stringify({ error: 'Forbidden' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        })
      }

      await env.DB.prepare(
        'UPDATE notifications SET read = 1 WHERE id = ?'
      ).bind(id).run()

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (action === 'mark_all_read') {
      await env.DB.prepare(
        'UPDATE notifications SET read = 1 WHERE parent_id = ? AND read = 0'
      ).bind(parentId).run()

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (e: unknown) {
    console.error('[Notifications] POST error:', e)
    return new Response(JSON.stringify({ error: 'Failed to process request' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
