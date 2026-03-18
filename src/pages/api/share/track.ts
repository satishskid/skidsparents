// POST /api/share/track — record a social share event
export const prerender = false

import type { APIRoute } from 'astro'
import { getParentId } from '@/pages/api/children'
import { SocialShareService } from '@/lib/social/sharing'

export const POST: APIRoute = async ({ request, locals }) => {
  const env = locals.runtime?.env as any
  if (!env?.DB) return new Response(JSON.stringify({ error: 'DB unavailable' }), { status: 503 })

  const parentId = await getParentId(request, env).catch(() => null)

  try {
    const body = await request.json() as {
      platform: string
      contentType: string
      contentId: string
      shareUrl: string
    }

    if (!body.platform || !body.contentType || !body.contentId || !body.shareUrl) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 })
    }

    const svc = new SocialShareService(env.DB)
    const utmCampaign = `skids_share_${body.contentType}`

    await svc.trackShare(
      parentId,
      body.platform as any,
      body.contentType as any,
      body.contentId,
      body.shareUrl,
      utmCampaign
    )

    return new Response(JSON.stringify({ ok: true }), { status: 200 })
  } catch (err) {
    console.error('share/track error:', err)
    return new Response(JSON.stringify({ error: 'Internal error' }), { status: 500 })
  }
}
