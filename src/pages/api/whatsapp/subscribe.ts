// WhatsApp subscription management API
export const prerender = false

import type { APIContext } from 'astro'
import { getParentId } from '@/pages/api/children'
import { drizzle } from 'drizzle-orm/d1'
import { whatsappSubscriptions, parents } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

export async function POST({ request, locals }: APIContext) {
  const env = (locals as any).runtime?.env
  const parentId = await getParentId(request, env)
  if (!parentId) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })

  const { phone, subscriptionType = 'daily_tip', action = 'subscribe' } = await request.json()

  if (!phone) {
    return new Response(JSON.stringify({ error: 'Phone number required' }), { status: 400 })
  }

  const db = drizzle(env.DB)

  // Normalize phone
  let normalizedPhone = phone.replace(/\D/g, '')
  if (normalizedPhone.startsWith('91') && normalizedPhone.length === 12) {
    normalizedPhone = normalizedPhone.slice(2)
  }
  if (normalizedPhone.length !== 10) {
    return new Response(JSON.stringify({ error: 'Invalid phone number' }), { status: 400 })
  }

  const isSubscribed = action === 'subscribe'

  // Upsert subscription
  const existing = await db
    .select()
    .from(whatsappSubscriptions)
    .where(and(
      eq(whatsappSubscriptions.parentId, parentId),
      eq(whatsappSubscriptions.subscriptionType, subscriptionType)
    ))
    .get()

  if (existing) {
    await db
      .update(whatsappSubscriptions)
      .set({ isSubscribed, phone: normalizedPhone, updatedAt: new Date().toISOString() })
      .where(eq(whatsappSubscriptions.id, existing.id))
  } else {
    await db.insert(whatsappSubscriptions).values({
      parentId,
      phone: normalizedPhone,
      subscriptionType,
      isSubscribed,
    })
  }

  return new Response(JSON.stringify({
    success: true,
    subscribed: isSubscribed,
    subscriptionType,
  }))
}

export async function GET({ request, locals }: APIContext) {
  const env = (locals as any).runtime?.env
  const parentId = await getParentId(request, env)
  if (!parentId) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })

  const db = drizzle(env.DB)
  const subs = await db
    .select()
    .from(whatsappSubscriptions)
    .where(eq(whatsappSubscriptions.parentId, parentId))
    .all()

  return new Response(JSON.stringify({ subscriptions: subs }))
}
