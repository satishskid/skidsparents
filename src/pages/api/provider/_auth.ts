import { verifyIdToken, extractBearerToken } from '@/lib/firebase/server'

/**
 * Authenticate a provider from the request.
 * Returns provider id string if active.
 * Returns null if firebase_uid not found in providers (caller should 401).
 * Throws with code='PROVIDER_PENDING' if provider exists but is not yet active (caller should 403).
 */
export async function getProviderId(request: Request, env: Env): Promise<string | null> {
  const token = extractBearerToken(request)
  if (!token) return null

  const decoded = await verifyIdToken(token, env.FIREBASE_PROJECT_ID || 'skidsparent', env.KV)
  if (!decoded) return null

  interface ProviderRow { id: string; is_verified: number; status: string }
  const row = await env.DB.prepare(
    'SELECT id, is_verified, status FROM providers WHERE firebase_uid = ?'
  ).bind(decoded.uid).first<ProviderRow>()

  if (!row) return null

  // Provider exists but is pending/suspended — 403
  if (!row.is_verified || row.status === 'pending_review' || row.status === 'suspended') {
    throw Object.assign(new Error('pending'), { code: 'PROVIDER_PENDING' })
  }

  return row.id
}
