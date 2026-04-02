/**
 * POST /api/admin/seed-interventions
 *
 * Seeds the intervention protocol library and growth track library
 * from the static content definitions.
 */

import type { APIRoute } from 'astro'

export const prerender = false

export const POST: APIRoute = async ({ request, locals }) => {
  const runtime = (locals as any).runtime
  const env = runtime?.env || {}
  const db = env.DB

  if (!db) {
    return new Response(JSON.stringify({ error: 'Database not available' }), { status: 500 })
  }

  // Auth check
  const adminKey = env.ADMIN_KEY
  if (adminKey) {
    const auth = request.headers.get('Authorization')
    if (!auth || (auth !== `Bearer ${adminKey}` && auth !== adminKey)) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
    }
  }

  const results = { interventions: 0, growthTracks: 0, errors: [] as string[] }

  // Seed intervention protocols
  try {
    const { INTERVENTION_PROTOCOLS } = await import('@/lib/content/intervention-protocols')

    for (const protocol of INTERVENTION_PROTOCOLS) {
      try {
        await db.prepare(
          `INSERT OR REPLACE INTO intervention_protocols
           (id, slug, name, category, subspecialty, condition_name, icd10,
            region, protocol_authority, description, evidence_base,
            age_range_min, age_range_max, default_duration_days, default_frequency,
            tasks_json, coaching_playbook_json, escalation_rules_json,
            customizable_params_json, prevalence_notes, genetic_considerations,
            dietary_context, version, parent_locale)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(
          protocol.id, protocol.slug, protocol.name, protocol.category,
          protocol.subspecialty, protocol.conditionName || null, protocol.icd10 || null,
          protocol.region, protocol.protocolAuthority, protocol.description,
          protocol.evidenceBase, protocol.ageRangeMin, protocol.ageRangeMax,
          protocol.defaultDurationDays, protocol.defaultFrequency,
          JSON.stringify(protocol.tasks), JSON.stringify(protocol.coachingPlaybook),
          JSON.stringify(protocol.escalationRules),
          JSON.stringify(protocol.customizableParams),
          protocol.prevalenceNotes || null, protocol.geneticConsiderations || null,
          protocol.dietaryContext || null, protocol.version, protocol.parentLocale
        ).run()
        results.interventions++
      } catch (err: any) {
        results.errors.push(`Intervention ${protocol.slug}: ${err.message}`)
      }
    }
  } catch (err: any) {
    results.errors.push(`Failed to load intervention protocols: ${err.message}`)
  }

  // Seed growth tracks
  try {
    const { GROWTH_TRACK_LIBRARY } = await import('@/lib/content/growth-track-library')

    for (const track of GROWTH_TRACK_LIBRARY) {
      try {
        await db.prepare(
          `INSERT OR REPLACE INTO growth_tracks
           (id, domain, age_min_months, age_max_months, title, what_to_expect,
            parent_guidance_json, coaching_playbook_json, milestones_json,
            red_flags_json, parental_coping_json, evidence_base,
            region, protocol_authority, version)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(
          track.id, track.domain, track.ageMinMonths, track.ageMaxMonths,
          track.title, track.whatToExpect,
          JSON.stringify(track.parentGuidance),
          JSON.stringify(track.coachingPlaybook),
          JSON.stringify(track.milestones),
          JSON.stringify(track.redFlags),
          JSON.stringify(track.parentalCoping),
          track.evidenceBase,
          track.region, track.protocolAuthority, 1
        ).run()
        results.growthTracks++
      } catch (err: any) {
        results.errors.push(`Growth track ${track.id}: ${err.message}`)
      }
    }
  } catch (err: any) {
    results.errors.push(`Failed to load growth track library: ${err.message}`)
  }

  return new Response(
    JSON.stringify({
      success: true,
      seeded: {
        interventionProtocols: results.interventions,
        growthTracks: results.growthTracks,
      },
      errors: results.errors.length > 0 ? results.errors : undefined,
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  )
}
