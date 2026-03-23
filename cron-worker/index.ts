// Standalone Cloudflare Worker for SKIDS scheduled cron jobs
// Deploy separately: wrangler deploy --config cron-worker/wrangler.toml
// Triggers:
//   - 03:30 UTC daily  → daily WhatsApp broadcast
//   - every 15 minutes → WhatsApp delivery retry for pending orders

export default {
  async scheduled(event: ScheduledEvent, env: any, ctx: ExecutionContext) {
    const base = 'https://parent.skids.clinic'
    const headers = {
      'Authorization': `Bearer ${env.CRON_SECRET}`,
      'Content-Type': 'application/json',
    }

    // Daily broadcast — runs at 03:30 UTC (09:00 IST)
    if (event.cron === '30 3 * * *') {
      try {
        const res = await fetch(`${base}/api/cron/daily-broadcast`, { method: 'POST', headers })
        console.log(`[Cron] daily-broadcast: ${res.status}`)
      } catch (err) {
        console.error('[Cron] daily-broadcast failed:', err)
      }

      try {
        const res = await fetch(`${base}/api/cron/daily-notifications`, { method: 'POST', headers })
        console.log(`[Cron] daily-notifications: ${res.status}`)
      } catch (err) {
        console.error('[Cron] daily-notifications failed:', err)
      }
    }

    // WhatsApp retry — runs every 15 minutes
    if (event.cron === '*/15 * * * *') {
      try {
        const res = await fetch(`${base}/api/cron/whatsapp-retry`, { method: 'POST', headers })
        console.log(`[Cron] whatsapp-retry: ${res.status}`)
      } catch (err) {
        console.error('[Cron] whatsapp-retry failed:', err)
      }
    }
  },

  async fetch(request: Request) {
    return new Response('SKIDS Cron Worker — scheduled only', { status: 200 })
  },
}
