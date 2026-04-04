/**
 * POST /api/pilot/seed-life-record — Create life record from screening data
 * Seeds a full life record from V3 screening data.
 */
import type { APIRoute } from 'astro'
import { getEnv } from '@/lib/runtime/env'

export const prerender = false

const V3_API = 'https://skids-api.satish-9f4.workers.dev'

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const { child_name, dob, gender, qr_code, campaign_code, invite_code, parent_id } = await request.json()
    if (!parent_id || !child_name || !dob) {
      return new Response(JSON.stringify({ error: 'parent_id, child_name, and dob required' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
    }

    const env = getEnv(locals)
    const db = env.DB
    if (!db) return new Response(JSON.stringify({ error: 'Database not available' }), { status: 500, headers: { 'Content-Type': 'application/json' } })

    const childId = crypto.randomUUID().replace(/-/g, '').slice(0, 16)

    // Create child record
    await db.prepare(`
      INSERT INTO children (id, parent_id, name, dob, gender, v3_campaign_code) VALUES (?, ?, ?, ?, ?, ?)
    `).bind(childId, parent_id, child_name, dob, gender || null, campaign_code || null).run()

    // Import screening data if QR available
    let screeningImported = false
    if (qr_code && dob) {
      try {
        const verifyRes = await fetch(`${V3_API}/api/parent-portal/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: qr_code, dob }),
        })

        if (verifyRes.ok) {
          const screeningData = await verifyRes.json() as any
          const importId = crypto.randomUUID().replace(/-/g, '').slice(0, 16)

          if (screeningData.child?.id) {
            await db.prepare('UPDATE children SET v3_child_id = ? WHERE id = ?').bind(screeningData.child.id, childId).run()
          }

          await db.prepare(`
            INSERT INTO screening_imports (id, child_id, source, campaign_code, screening_date, data_json, summary_text)
            VALUES (?, ?, 'skids_v3', ?, datetime('now'), ?, ?)
          `).bind(importId, childId, campaign_code || qr_code, JSON.stringify(screeningData),
            `Imported from SKIDS V3 screening (${(screeningData.observations || []).length} modules)`).run()

          // Extract growth records from vitals
          for (const obs of (screeningData.observations || [])) {
            const module = obs.moduleType?.toLowerCase()
            if (['height', 'weight'].includes(module)) {
              const ann = obs.aiAnnotations?.[0]
              if (ann?.summaryText) {
                const value = parseFloat(ann.summaryText) || null
                if (value) {
                  const growthId = crypto.randomUUID().replace(/-/g, '').slice(0, 16)
                  await db.prepare(`INSERT INTO growth_records (id, child_id, date, ${module === 'height' ? 'height_cm' : 'weight_kg'}) VALUES (?, ?, datetime('now'), ?)`)
                    .bind(growthId, childId, value).run()
                }
              }
            }
          }

          // Import screening results
          for (const obs of (screeningData.observations || [])) {
            for (const ann of (obs.aiAnnotations || [])) {
              if (ann.riskCategory && ann.riskCategory !== 'normal') {
                const srId = crypto.randomUUID().replace(/-/g, '').slice(0, 16)
                await db.prepare(`
                  INSERT INTO screening_results (id, child_id, screening_type, date, result, findings_json, provider, notes) VALUES (?, ?, ?, datetime('now'), ?, ?, 'SKIDS V3', ?)
                `).bind(srId, childId, obs.moduleType || 'general', ann.riskCategory, JSON.stringify(ann), ann.summaryText || '').run()
              }
            }
          }
          screeningImported = true
        }
      } catch (e) { console.error('[Pilot] Screening import error:', e) }
    }

    // Link to invite code
    if (invite_code) {
      try {
        await db.prepare(`
          UPDATE pilot_invitations SET child_id = ?, parent_id = ?, status = 'accepted', accepted_at = datetime('now') WHERE invite_code = ? AND status = 'pending'
        `).bind(childId, parent_id, invite_code.trim().toUpperCase()).run()
      } catch { /* may have already been accepted */ }
    }

    return new Response(JSON.stringify({ success: true, child_id: childId, screening_imported: screeningImported }), { status: 200, headers: { 'Content-Type': 'application/json' } })
  } catch (err: any) {
    console.error('[Pilot] Seed life record error:', err)
    return new Response(JSON.stringify({ error: 'Failed to create life record' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
}
