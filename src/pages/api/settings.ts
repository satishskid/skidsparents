/**
 * GET  /api/settings — Get parent settings
 * PUT  /api/settings — Update parent settings
 *
 * Parent preferences: notification toggles, Phase 2 feature flags,
 * vernacular language selection.
 */

import type { APIRoute } from 'astro'
import { getParentId } from './children'

export const prerender = false

interface ParentSettings {
  notificationsEnabled: boolean
  nudgeMilestones: boolean
  nudgeObservationGaps: boolean
  nudgePatterns: boolean
  nudgeCelebrations: boolean
  voiceNotesEnabled: boolean
  vernacularLanguage: string | null
}

const DEFAULT_SETTINGS: ParentSettings = {
  notificationsEnabled: true,
  nudgeMilestones: true,
  nudgeObservationGaps: true,
  nudgePatterns: true,
  nudgeCelebrations: true,
  voiceNotesEnabled: false,
  vernacularLanguage: null,
}

export const GET: APIRoute = async ({ request, locals }) => {
  const env = (locals as any).runtime?.env || {}
  const parentId = await getParentId(request, env)
  if (!parentId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const db = env.DB
  if (!db) {
    return new Response(JSON.stringify({ settings: DEFAULT_SETTINGS }), {
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const row = await db.prepare(
      'SELECT * FROM parent_settings WHERE parent_id = ?'
    ).bind(parentId).first() as any

    if (!row) {
      return new Response(JSON.stringify({ settings: DEFAULT_SETTINGS }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const settings: ParentSettings = {
      notificationsEnabled: !!row.notifications_enabled,
      nudgeMilestones: !!row.nudge_milestones,
      nudgeObservationGaps: !!row.nudge_observation_gaps,
      nudgePatterns: !!row.nudge_patterns,
      nudgeCelebrations: !!row.nudge_celebrations,
      voiceNotesEnabled: !!row.voice_notes_enabled,
      vernacularLanguage: row.vernacular_language || null,
    }

    return new Response(JSON.stringify({ settings }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err: any) {
    if (err.message?.includes('no such table')) {
      return new Response(JSON.stringify({ settings: DEFAULT_SETTINGS }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }
    return new Response(JSON.stringify({ error: 'Failed to fetch settings' }), { status: 500 })
  }
}

export const PUT: APIRoute = async ({ request, locals }) => {
  const env = (locals as any).runtime?.env || {}
  const parentId = await getParentId(request, env)
  if (!parentId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const db = env.DB
  if (!db) {
    return new Response(JSON.stringify({ error: 'DB not available' }), { status: 500 })
  }

  let body: Partial<ParentSettings>
  try {
    body = await request.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 })
  }

  try {
    await db.prepare(
      `INSERT INTO parent_settings (parent_id, notifications_enabled, nudge_milestones, nudge_observation_gaps, nudge_patterns, nudge_celebrations, voice_notes_enabled, vernacular_language, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
       ON CONFLICT(parent_id) DO UPDATE SET
         notifications_enabled = COALESCE(excluded.notifications_enabled, parent_settings.notifications_enabled),
         nudge_milestones = COALESCE(excluded.nudge_milestones, parent_settings.nudge_milestones),
         nudge_observation_gaps = COALESCE(excluded.nudge_observation_gaps, parent_settings.nudge_observation_gaps),
         nudge_patterns = COALESCE(excluded.nudge_patterns, parent_settings.nudge_patterns),
         nudge_celebrations = COALESCE(excluded.nudge_celebrations, parent_settings.nudge_celebrations),
         voice_notes_enabled = COALESCE(excluded.voice_notes_enabled, parent_settings.voice_notes_enabled),
         vernacular_language = COALESCE(excluded.vernacular_language, parent_settings.vernacular_language),
         updated_at = datetime('now')`
    ).bind(
      parentId,
      body.notificationsEnabled !== undefined ? (body.notificationsEnabled ? 1 : 0) : 1,
      body.nudgeMilestones !== undefined ? (body.nudgeMilestones ? 1 : 0) : 1,
      body.nudgeObservationGaps !== undefined ? (body.nudgeObservationGaps ? 1 : 0) : 1,
      body.nudgePatterns !== undefined ? (body.nudgePatterns ? 1 : 0) : 1,
      body.nudgeCelebrations !== undefined ? (body.nudgeCelebrations ? 1 : 0) : 1,
      body.voiceNotesEnabled !== undefined ? (body.voiceNotesEnabled ? 1 : 0) : 0,
      body.vernacularLanguage || null
    ).run()

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err: any) {
    console.error('[Settings] Error:', err)
    return new Response(JSON.stringify({ error: 'Failed to update settings' }), { status: 500 })
  }
}
