// Standalone Cloudflare Worker for daily WhatsApp broadcast cron
// Deploy separately: wrangler deploy --config cron-worker/wrangler.toml
// This worker calls the SKIDS Parent cron API endpoint on schedule

export default {
  async scheduled(event: ScheduledEvent, env: any, ctx: ExecutionContext) {
    const url = 'https://parent.skids.clinic/api/cron/daily-broadcast'
    
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.CRON_SECRET}`,
          'Content-Type': 'application/json',
        },
      })
      console.log(`[Cron Worker] Response: ${res.status}`)
    } catch (err) {
      console.error('[Cron Worker] Failed to call cron endpoint:', err)
    }
  },

  // Also handle fetch so wrangler deploy doesn't complain
  async fetch(request: Request) {
    return new Response('SKIDS Cron Worker — scheduled only', { status: 200 })
  },
}
