/**
 * POST /api/records/upload — Upload a file (image/PDF) for AI extraction
 * Accepts: multipart/form-data with file, childId, hint (optional)
 * Stores file in KV, runs AI extraction, creates health_record + uploaded_report
 */

import type { APIRoute } from 'astro'
import { getParentId, verifyChildOwnership } from '@/pages/api/children'
import { extractFromImage } from '@/lib/ai/extract'
import { getEnv } from '@/lib/runtime/env'

export const prerender = false

export const POST: APIRoute = async ({ request, locals }) => {
  const env = getEnv(locals)
  const parentId = await getParentId(request, env)
  if (!parentId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const db = env.DB
  const kv = env.KV
  const ai = env.AI
  if (!db || !kv) {
    return new Response(JSON.stringify({ error: 'Storage not available' }), { status: 500 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const childId = formData.get('childId') as string | null
    const hint = formData.get('hint') as string | null

    if (!file || !childId) {
      return new Response(JSON.stringify({ error: 'file and childId are required' }), { status: 400 })
    }

    // Verify child ownership
    const owns = await verifyChildOwnership(parentId, childId, db)
    if (!owns) {
      return new Response(JSON.stringify({ error: 'Child not found' }), { status: 404 })
    }

    // Validate file type and size
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      return new Response(JSON.stringify({ error: 'Only images (PNG, JPEG, WebP) and PDF files are allowed' }), { status: 400 })
    }
    if (file.size > 10 * 1024 * 1024) {
      return new Response(JSON.stringify({ error: 'File must be under 10MB' }), { status: 400 })
    }

    // Get child age for AI context
    let childAgeMonths: number | undefined
    interface ChildDobRow { dob: string }
    const child = await db.prepare('SELECT dob FROM children WHERE id = ?').bind(childId).first<ChildDobRow>()
    if (child?.dob) {
      const dob = new Date(child.dob)
      const now = new Date()
      childAgeMonths = (now.getFullYear() - dob.getFullYear()) * 12 + (now.getMonth() - dob.getMonth())
    }

    // Store file in KV
    const fileBuffer = await file.arrayBuffer()
    const ext = file.name?.split('.').pop() || (file.type === 'application/pdf' ? 'pdf' : 'jpg')
    const fileId = crypto.randomUUID()
    const fileKey = `file:${childId}:${fileId}.${ext}`

    await kv.put(fileKey, fileBuffer, {
      metadata: { contentType: file.type, fileName: file.name, childId },
      expirationTtl: 60 * 60 * 24 * 365 * 5, // 5 years
    })

    // Run AI extraction (only for images, not PDFs)
    let extracted = null
    if (file.type.startsWith('image/') && ai) {
      extracted = await extractFromImage(ai, fileBuffer, hint || undefined, childAgeMonths)
    }

    // Create uploaded_report record
    const reportId = crypto.randomUUID()
    await db.prepare(
      `INSERT INTO uploaded_reports (id, child_id, file_key, file_type, file_name, ai_extracted_json, provider_name, report_type)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      reportId,
      childId,
      fileKey,
      file.type.startsWith('image/') ? 'image' : 'pdf',
      file.name || `upload.${ext}`,
      extracted ? JSON.stringify(extracted) : null,
      extracted?.providerName || null,
      extracted?.recordType || 'general'
    ).run()

    // Create health_record for timeline
    const recordId = crypto.randomUUID()
    const today = new Date().toISOString().split('T')[0]
    await db.prepare(
      `INSERT INTO health_records (id, child_id, record_type, title, record_date, provider_name, summary, data_json, source, source_ref_id, file_url, ai_confidence)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      recordId,
      childId,
      extracted?.recordType || 'general',
      extracted?.title || hint || file.name || 'Uploaded Document',
      extracted?.recordDate || today,
      extracted?.providerName || null,
      extracted?.summary || 'Document uploaded.',
      extracted ? JSON.stringify({ findings: extracted.findings }) : null,
      'parent_upload',
      reportId,
      fileKey,
      extracted?.confidence || null
    ).run()

    // If vaccinations detected, create vaccination_records
    if (extracted?.vaccinations?.length) {
      for (const vax of extracted.vaccinations) {
        const vaxId = crypto.randomUUID()
        await db.prepare(
          `INSERT INTO vaccination_records (id, child_id, vaccine_name, dose, administered_date, provider)
           VALUES (?, ?, ?, ?, ?, ?)`
        ).bind(
          vaxId,
          childId,
          vax.vaccineName,
          vax.dose || '1',
          vax.date || today,
          extracted.providerName || null
        ).run()
      }
    }

    return new Response(
      JSON.stringify({
        recordId,
        reportId,
        extracted,
        fileKey,
        message: extracted ? 'Document uploaded and analyzed' : 'Document uploaded (AI extraction not available for this file type)',
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (e: unknown) {
    console.error('[Upload] Error:', e)
    const message = e instanceof Error ? e.message : String(e)
    return new Response(
      JSON.stringify({ error: 'Upload failed', detail: message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
