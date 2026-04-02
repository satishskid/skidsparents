/**
 * GET  /api/notifications — List notifications for authenticated parent
 * POST /api/notifications — Mark as read/dismissed
 *
 * Combines system notifications + nudge-generated notifications.
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
      `SELECT id, type, title, body, data_json, read, dismissed, expires_at, created_at
       FROM notifications
       WHERE parent_id = ? AND (dismissed = 0 OR dismissed IS NULL)
       AND (expires_at IS NULL OR expires_at > datetime('now'))
       ORDER BY created_at DESC LIMIT 20`
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
    const body = await request.json() as {
      action: 'mark_read' | 'dismiss' | 'mark_all_read'
      id?: string
      notificationId?: string
    }
    const { action } = body
    const notifId = body.id || body.notificationId

    if (action === 'mark_read') {
      if (!notifId) {
        return new Response(JSON.stringify({ error: 'id is required for mark_read' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        })
      }
      await env.DB.prepare(
        'UPDATE notifications SET read = 1 WHERE id = ? AND parent_id = ?'
      ).bind(notifId, parentId).run()

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (action === 'dismiss') {
      if (!notifId) {
        return new Response(JSON.stringify({ error: 'id is required for dismiss' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        })
      }
      await env.DB.prepare(
        'UPDATE notifications SET dismissed = 1 WHERE id = ? AND parent_id = ?'
      ).bind(notifId, parentId).run()

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
