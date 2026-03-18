// POST /api/engagement/track — record a content view or interaction
export const prerender = false

import type { APIContext } from 'astro'
import { getParentId } from '@/pages/api/children'
import { EngagementService } from '@/lib/engagement/tracking'

export async function POST({ request, locals }: APIContext) {
  const env = (locals as any).runtime?.env
  const parentId = await getParentId(request, env)
  if (!parentId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  let body: any
  try {
    body = await request.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 })
  }

  const { contentType, contentId, action, durationSeconds } = body

  if (!contentType || !contentId || !action) {
    return new Response(
      JSON.stringify({ error: 'contentType, contentId, and action are required' }),
      { status: 400 }
    )
  }

  const svc = new EngagementService(env.DB)

  try {
    if (action === 'view') {
      const duration = typeof durationSeconds === 'number'
        ? Math.max(0, Math.min(durationSeconds, 3600)) // clamp 0–3600s
        : 0
      await svc.trackView(parentId, contentType, contentId, duration)
    } else {
      await svc.trackInteraction(parentId, contentType, contentId, action)
    }

    return new Response(JSON.stringify({ success: true }), { status: 201 })
  } catch (error) {
    console.error('Engagement track error:', error)
    return new Response(JSON.stringify({ error: 'Failed to track engagement' }), { status: 500 })
  }
}
