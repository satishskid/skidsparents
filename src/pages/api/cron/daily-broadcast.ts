// Cloudflare Cron Trigger handler — daily WhatsApp broadcast at 9 AM IST
// Triggered by: "30 3 * * *" (3:30 AM UTC = 9:00 AM IST)
export const prerender = false

import { BHASHService, formatDailyTip } from '@/lib/distribution/whatsapp'

// Daily health tips pool (rotated by day of year)
const DAILY_TIPS = [
  { title: 'Tummy Time Matters', body: 'Give your baby 30 minutes of tummy time daily. It builds neck, shoulder, and core strength — the foundation for crawling and walking.', url: 'https://parent.skids.clinic/discover/brain' },
  { title: 'Rainbow Plate Rule', body: 'Aim for 5 colors on your child\'s plate today. Each color provides different nutrients essential for brain and body development.', url: 'https://parent.skids.clinic/habits/healthy_eating' },
  { title: 'Screen Time Guidelines', body: 'Under 2 years: zero screen time (except video calls). Ages 2–5: max 1 hour/day of quality content. Ages 6+: consistent limits with breaks.', url: 'https://parent.skids.clinic/habits/balanced_stress' },
  { title: 'Sleep is Non-Negotiable', body: 'Children aged 6–12 need 9–11 hours of sleep. Poor sleep affects memory, mood, and immunity. Protect bedtime like a health appointment.', url: 'https://parent.skids.clinic/habits/sufficient_sleep' },
  { title: 'Outdoor Play Daily', body: 'Just 60 minutes of outdoor play boosts Vitamin D, improves focus, and reduces anxiety in children. Morning sunlight is best.', url: 'https://parent.skids.clinic/habits/active_movement' },
  { title: 'Read Aloud Every Day', body: 'Reading aloud to your child for 15 minutes daily builds vocabulary, empathy, and a lifelong love of learning — even before they can talk.', url: 'https://parent.skids.clinic/habits/inner_coaching' },
  { title: 'Consistent Routines', body: 'Predictable morning and bedtime routines reduce cortisol (stress hormone) in children and improve behavior and sleep quality.', url: 'https://parent.skids.clinic/habits/timekeepers' },
]

export async function scheduled(event: ScheduledEvent, env: any, ctx: ExecutionContext) {
  if (!env.DB || !env.BHASH_USER) {
    console.log('[Cron] Missing DB or BHASH credentials — skipping broadcast')
    return
  }

  const bhash = new BHASHService({
    BHASH_USER: env.BHASH_USER,
    BHASH_PASS: env.BHASH_PASS,
    BHASH_SENDER: env.BHASH_SENDER || 'BUZWAP',
  })

  // Pick tip by day of year
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)
  const tip = DAILY_TIPS[dayOfYear % DAILY_TIPS.length]
  const message = formatDailyTip(tip)

  // Fetch all active daily_tip subscribers
  try {
    const result = await env.DB.prepare(
      `SELECT phone FROM whatsapp_subscriptions WHERE is_subscribed=1 AND subscription_type='daily_tip' LIMIT 500`
    ).all()

    const phones: string[] = (result.results || []).map((r: any) => r.phone)
    if (phones.length === 0) {
      console.log('[Cron] No subscribers for daily broadcast')
      return
    }

    const { sent, failed } = await bhash.sendDailyTip(phones, message)
    console.log(`[Cron] Daily broadcast complete: ${sent} sent, ${failed} failed`)
  } catch (err) {
    console.error('[Cron] Daily broadcast error:', err)
  }
}
