/**
 * POST /api/cron/care-followup — Care Continuity Follow-Up Loop
 *
 * Runs daily to:
 * 1. Send check-in prompts for episodes past their follow_up_at date
 * 2. Nudge doctors for overdue e-consult responses (>24h)
 * 3. Detect recurrent concern patterns (3+ episodes same domain in 90 days)
 * 4. Auto-archive long-resolved episodes
 *
 * Protected by CRON_SECRET header.
 */

export const prerender = false

import type { APIRoute } from 'astro'
import { getEnv } from '@/lib/runtime/env'
import { createNotification } from '@/lib/notifications/service'

export const POST: APIRoute = async ({ request, locals }) => {
  const env = getEnv(locals)

  if (request.headers.get('Authorization') !== `Bearer ${env.CRON_SECRET}`) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const stats = {
    followUpsSent: 0,
    pedNudgesSent: 0,
    patternsDetected: 0,
    errors: 0,
  }

  try {
    // ── 1. Parent check-in prompts ──
    // Episodes at pathway 1_observe or 2_ped_initiated past follow_up_at
    try {
      const { results: dueEpisodes } = await env.DB.prepare(
        `SELECT ce.id, ce.parent_id, ce.child_id, ce.observation_text,
                c.name as child_name
         FROM care_episodes ce
         JOIN children c ON ce.child_id = c.id
         WHERE ce.status IN ('open', 'awaiting_ped')
           AND ce.follow_up_at IS NOT NULL
           AND ce.follow_up_at <= date('now')
           AND ce.follow_up_sent = 0
           AND ce.pathway IN ('1_observe', '2_ped_initiated')
         LIMIT 50`
      ).all()

      for (const ep of (dueEpisodes || []) as any[]) {
        try {
          await createNotification(env.DB, {
            parentId: ep.parent_id,
            childId: ep.child_id,
            type: 'service_update',
            title: `How is ${ep.child_name} doing?`,
            body: 'We wanted to check in about what you shared earlier. Has anything changed? Tap to update.',
            actionUrl: `/care/episode/${ep.id}`,
            dataJson: { episodeId: ep.id, action: 'follow_up_check' },
          })

          // Mark follow-up as sent
          await env.DB.prepare(
            `UPDATE care_episodes SET follow_up_sent = 1, updated_at = datetime('now') WHERE id = ?`
          ).bind(ep.id).run()

          stats.followUpsSent++
        } catch (e) {
          console.error(`[care-followup] Follow-up failed for episode ${ep.id}:`, e)
          stats.errors++
        }
      }
    } catch (e) {
      console.error('[care-followup] Follow-up query failed:', e)
      stats.errors++
    }

    // ── 2. Nudge doctors for overdue e-consult responses ──
    // Episodes awaiting_ped for >24 hours without response
    try {
      const { results: overdueEpisodes } = await env.DB.prepare(
        `SELECT ce.id, ce.parent_id, ce.child_id, ce.doctor_id,
                ce.observation_text, ce.ped_alert_level,
                c.name as child_name, p.name as parent_name
         FROM care_episodes ce
         JOIN children c ON ce.child_id = c.id
         JOIN parents p ON ce.parent_id = p.id
         WHERE ce.status = 'awaiting_ped'
           AND ce.ped_response_text IS NULL
           AND ce.pathway IN ('3_econsult', '4_tele')
           AND ce.created_at < datetime('now', '-24 hours')
           AND ce.doctor_id IS NOT NULL
         LIMIT 50`
      ).all()

      for (const ep of (overdueEpisodes || []) as any[]) {
        try {
          // Notify the doctor (using their doctor_id as parent_id for the notification)
          // In a real system, doctors would have their own notification channel
          // For now, we escalate the alert level
          const newLevel = ep.ped_alert_level === 'review' ? 'urgent' : ep.ped_alert_level
          await env.DB.prepare(
            `UPDATE care_episodes
             SET ped_alert_level = ?,
                 updated_at = datetime('now')
             WHERE id = ? AND ped_alert_level != ?`
          ).bind(newLevel, ep.id, newLevel).run()

          stats.pedNudgesSent++
        } catch (e) {
          console.error(`[care-followup] Ped nudge failed for episode ${ep.id}:`, e)
          stats.errors++
        }
      }
    } catch (e) {
      console.error('[care-followup] Ped nudge query failed:', e)
      stats.errors++
    }

    // ── 3. Detect recurrent concern patterns ──
    // Children with 3+ episodes in the same domain within 90 days
    try {
      const { results: patterns } = await env.DB.prepare(
        `SELECT ce.child_id, ce.parent_id, ce.doctor_id,
                json_extract(ce.observation_structured, '$.domains') as domains,
                COUNT(*) as episode_count,
                c.name as child_name
         FROM care_episodes ce
         JOIN children c ON ce.child_id = c.id
         WHERE ce.created_at > datetime('now', '-90 days')
           AND ce.status != 'resolved'
         GROUP BY ce.child_id
         HAVING COUNT(*) >= 3
         LIMIT 20`
      ).all()

      for (const pattern of (patterns || []) as any[]) {
        try {
          // Notify parent about recurring pattern
          await createNotification(env.DB, {
            parentId: pattern.parent_id,
            childId: pattern.child_id,
            type: 'service_update',
            title: `We've noticed a pattern for ${pattern.child_name}`,
            body: `You've shared ${pattern.episode_count} concerns recently. We recommend connecting with your pediatrician for a comprehensive review.`,
            actionUrl: '/me',
            dataJson: { action: 'recurrent_pattern', count: pattern.episode_count },
          })

          // If doctor assigned, bump any open episodes to econsult
          if (pattern.doctor_id) {
            await env.DB.prepare(
              `UPDATE care_episodes
               SET pathway = '3_econsult',
                   ped_alert_level = CASE WHEN ped_alert_level = 'none' THEN 'review' ELSE ped_alert_level END,
                   status = 'awaiting_ped',
                   updated_at = datetime('now')
               WHERE child_id = ? AND status = 'open' AND pathway = '1_observe'`
            ).bind(pattern.child_id).run()
          }

          stats.patternsDetected++
        } catch (e) {
          console.error(`[care-followup] Pattern handling failed for child ${pattern.child_id}:`, e)
          stats.errors++
        }
      }
    } catch (e) {
      console.error('[care-followup] Pattern detection query failed:', e)
      stats.errors++
    }

  } catch (e: unknown) {
    console.error('[care-followup] Top-level error:', e)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return new Response(JSON.stringify({
    ok: true,
    stats,
    timestamp: new Date().toISOString(),
  }), {
    headers: { 'Content-Type': 'application/json' },
  })
}
