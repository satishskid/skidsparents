/**
 * POST /api/provider/credentials — Upload a credential document to R2
 */

import type { APIRoute } from 'astro'
import { getProviderId } from '@/pages/api/provider/_auth'
import { getEnv } from '@/lib/runtime/env'

export const prerender = false

const MAX_SIZE = 10 * 1024 * 1024 // 10 MB

export const POST: APIRoute = async ({ request, locals }) => {
  const env = getEnv(locals)

  let providerId: string
  try {
    const id = await getProviderId(request, env)
    if (!id) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
    providerId = id
  } catch (e: unknown) {
    if (e instanceof Error && 'code' in e && e.code === 'PROVIDER_PENDING') return new Response(JSON.stringify({ error: 'Account pending review' }), { status: 403 })
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  // Check Content-Length before reading body
  const contentLength = request.headers.get('Content-Length')
  if (contentLength && parseInt(contentLength, 10) > MAX_SIZE) {
    return new Response(JSON.stringify({ error: 'File too large. Maximum 10MB.' }), { status: 413 })
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid form data' }), { status: 400 })
  }

  const file = formData.get('file') as File | null
  const docType = formData.get('docType') as string | null

  if (!file) {
    return new Response(JSON.stringify({ error: 'file is required' }), { status: 400 })
  }
  if (!docType?.trim()) {
    return new Response(JSON.stringify({ error: 'docType is required' }), { status: 400 })
  }

  // Double-check actual file size
  if (file.size > MAX_SIZE) {
    return new Response(JSON.stringify({ error: 'File too large. Maximum 10MB.' }), { status: 413 })
  }

  try {
    // Determine extension from file name or mime type
    const mimeType = file.type || 'application/octet-stream'
    const fileType: 'pdf' | 'image' = mimeType === 'application/pdf' ? 'pdf' : 'image'

    const originalName = file.name || 'upload'
    const dotIdx = originalName.lastIndexOf('.')
    const ext = dotIdx >= 0 ? originalName.slice(dotIdx + 1).toLowerCase() : (fileType === 'pdf' ? 'pdf' : 'jpg')

    const key = `credentials/${providerId}/${crypto.randomUUID()}.${ext}`

    // Upload to R2 — read as ArrayBuffer to avoid ReadableStream type mismatch between
    // Web API and @cloudflare/workers-types (both are valid at runtime; ArrayBuffer is unambiguous)
    await env.R2.put(key, await file.arrayBuffer(), {
      httpMetadata: { contentType: mimeType },
    })

    // Insert credential record
    const credentialId = crypto.randomUUID()
    await env.DB.prepare(
      `INSERT INTO provider_credentials (id, provider_id, file_url, file_type, doc_type, uploaded_at)
       VALUES (?, ?, ?, ?, ?, datetime('now'))`
    ).bind(credentialId, providerId, key, fileType, docType.trim()).run()

    return new Response(
      JSON.stringify({ success: true, credentialId, fileUrl: key }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (e: unknown) {
    console.error('[provider/credentials] Error:', e)
    return new Response(JSON.stringify({ error: 'Failed to upload credential' }), { status: 500 })
  }
}
