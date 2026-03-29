/**
 * Firebase Auth verification for Cloudflare Workers
 * Uses firebase-auth-cloudflare-workers for proper JWT verification
 */

import { Auth, WorkersKVStoreSingle } from 'firebase-auth-cloudflare-workers'

interface DecodedToken {
  uid: string
  email?: string
  name?: string
  picture?: string
}

/**
 * Verify Firebase ID token on the edge (Cloudflare Workers)
 */
export async function verifyIdToken(
  idToken: string,
  projectId: string,
  kvCache?: KVNamespace
): Promise<DecodedToken | null> {
  try {
    const kvStore = new WorkersKVStoreSingle({
      projectId,
      keyName: 'firebase-public-keys',
      namespace: kvCache ?? null,
    })

    const auth = new Auth(projectId, kvStore)
    const decoded = await auth.verifyIdToken(idToken)

    return {
      uid: decoded.uid,
      email: decoded.email,
      name: decoded.name,
      picture: decoded.picture,
    }
  } catch (err) {
    console.error('[Firebase] Token verification failed:', err)
    return null
  }
}

/**
 * Extract bearer token from Authorization header
 */
export function extractBearerToken(request: Request): string | null {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) return null
  return authHeader.slice(7)
}
