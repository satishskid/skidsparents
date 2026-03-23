/**
 * GET  /api/vaccinations — Get vaccination schedule + completed records
 * POST /api/vaccinations — Add a vaccination record
 */

import type { APIRoute } from 'astro'
import { getParentId, verifyChildOwnership } from '@/pages/api/children'
import { getVaccinationStatus, getVaccineSummary } from '@/lib/content/vaccinations'
import { getEnv } from '@/lib/runtime/env'

export const prerender = false

export const GET: APIRoute = async ({ request, locals }) => {
  const env = getEnv(locals)
  const parentId = await getParentId(request, env)
  if (!parentId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const url = new URL(request.url)
  const childId = url.searchParams.get('childId')
  if (!childId) {
    return new Response(JSON.stringify({ error: 'childId is required' }), { status: 400 })
  }

  const owns = await verifyChildOwnership(parentId, childId, env.DB)
  if (!owns) {
    return new Response(JSON.stringify({ error: 'Child not found' }), { status: 404 })
  }

  try {
    // Get child age
    interface ChildDobRow { dob: string }
    const child = await env.DB.prepare('SELECT dob FROM children WHERE id = ?').bind(childId).first<ChildDobRow>()
    if (!child?.dob) {
      return new Response(JSON.stringify({ error: 'Child DOB not found' }), { status: 404 })
    }

    const dob = new Date(child.dob)
    const now = new Date()
    const ageMonths = (now.getFullYear() - dob.getFullYear()) * 12 + (now.getMonth() - dob.getMonth())

    // Get completed vaccinations
    let completedVaccines: any[] = []
    try {
      const { results } = await env.DB.prepare(
        'SELECT vaccine_name, dose, administered_date, provider FROM vaccination_records WHERE child_id = ? ORDER BY administered_date'
      ).bind(childId).all()
      completedVaccines = results || []
    } catch {}

    // Compute schedule with statuses
    const schedule = getVaccinationStatus(ageMonths, completedVaccines)
    const summary = getVaccineSummary(schedule)

    return new Response(
      JSON.stringify({ schedule, summary, ageMonths }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (e: unknown) {
    if (e instanceof Error && e.message.includes('no such table')) {
      return new Response(JSON.stringify({ schedule: [], summary: { done: 0, due: 0, overdue: 0, total: 0 }, ageMonths: 0 }), { status: 200 })
    }
    console.error('[Vaccinations] GET error:', e)
    return new Response(JSON.stringify({ error: 'Failed to fetch vaccinations' }), { status: 500 })
  }
}

export const POST: APIRoute = async ({ request, locals }) => {
  const env = getEnv(locals)
  const parentId = await getParentId(request, env)
  if (!parentId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  try {
    const body = await request.json() as {
      childId: string
      vaccineName: string
      dose: string
      administeredDate: string
      provider?: string
      nextDue?: string
    }

    if (!body.childId || !body.vaccineName || !body.dose || !body.administeredDate) {
      return new Response(JSON.stringify({ error: 'childId, vaccineName, dose, and administeredDate are required' }), { status: 400 })
    }

    const owns = await verifyChildOwnership(parentId, body.childId, env.DB)
    if (!owns) {
      return new Response(JSON.stringify({ error: 'Child not found' }), { status: 404 })
    }

    const id = crypto.randomUUID()
    await env.DB.prepare(
      `INSERT INTO vaccination_records (id, child_id, vaccine_name, dose, administered_date, provider, next_due)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      id,
      body.childId,
      body.vaccineName,
      body.dose,
      body.administeredDate,
      body.provider || null,
      body.nextDue || null
    ).run()

    // Also create a health_record for the timeline
    const recordId = crypto.randomUUID()
    await env.DB.prepare(
      `INSERT INTO health_records (id, child_id, record_type, title, record_date, provider_name, source)
       VALUES (?, ?, 'vaccination', ?, ?, ?, 'parent_manual')`
    ).bind(
      recordId,
      body.childId,
      `${body.vaccineName} (Dose ${body.dose})`,
      body.administeredDate,
      body.provider || null
    ).run()

    return new Response(
      JSON.stringify({ id, recordId, message: 'Vaccination recorded' }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (e: unknown) {
    console.error('[Vaccinations] Create error:', e)
    return new Response(JSON.stringify({ error: 'Failed to add vaccination' }), { status: 500 })
  }
}
