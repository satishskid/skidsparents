// GET /api/engagement/popular — popular content by type and timeframe
export const prerender = false

import type { APIContext } from 'astro'
import { EngagementService } from '@/lib/engagement/tracking'

export async function GET({ request, locals }: APIContext) {
  const env = (locals as any).runtime?.env
  const url = new URL(request.url)

  const contentType = url.searchParams.get('contentType') || 'blog'
  const rawTimeframe = url.searchParams.get('timeframe') || 'week'
  const timeframe = ['day', 'week', 'month'].includes(rawTimeframe)
    ? (rawTimeframe as 'day' | 'week' | 'month')
    : 'week'

  const svc = new EngagementService(env.DB)

  try {
    const popular = await svc.getPopularContent(contentType, timeframe)
    return new Response(JSON.stringify({ popular, contentType, timeframe }))
  } catch (error) {
    console.error('Popular content error:', error)
    return new Response(JSON.stringify({ error: 'Failed to fetch popular content' }), { status: 500 })
  }
}
