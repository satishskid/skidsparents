/**
 * Firebase Auth verification for Cloudflare Workers
 * Uses firebase-auth-cloudflare-workers for zero-dependency JWT verification
 */

interface DecodedToken {
  uid: string
  email?: string
  name?: string
  picture?: string
}

/**
 * Verify Firebase ID token on the edge (Cloudflare Workers)
 * Uses the public keys from Google to verify JWT without Firebase Admin SDK
 */
export async function verifyIdToken(
  idToken: string,
  projectId: string,
  kvCache?: KVNamespace
): Promise<DecodedToken | null> {
  try {
    // Decode JWT header and payload
    const parts = idToken.split('.')
    if (parts.length !== 3) return null

    const header = JSON.parse(atob(parts[0]))
    const payload = JSON.parse(atob(parts[1]))

    // Basic validation
    const now = Math.floor(Date.now() / 1000)

    // Check expiration
    if (payload.exp && payload.exp < now) return null

    // Check issuer
    const expectedIssuer = `https://securetoken.google.com/${projectId}`
    if (payload.iss !== expectedIssuer) return null

    // Check audience
    if (payload.aud !== projectId) return null

    // Fetch Google's public keys
    const cacheKey = 'firebase-public-keys'
    let publicKeys: Record<string, string> | null = null

    if (kvCache) {
      const cached = await kvCache.get(cacheKey)
      if (cached) {
        publicKeys = JSON.parse(cached)
      }
    }

    if (!publicKeys) {
      const res = await fetch(
        'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com'
      )
      publicKeys = await res.json() as Record<string, string>

      // Cache for 1 hour
      if (kvCache) {
        await kvCache.put(cacheKey, JSON.stringify(publicKeys), { expirationTtl: 3600 })
      }
    }

    // Get the key matching the JWT kid
    const key = publicKeys[header.kid]
    if (!key) return null

    // Import the public key and verify signature
    const pemContents = key
      .replace('-----BEGIN CERTIFICATE-----', '')
      .replace('-----END CERTIFICATE-----', '')
      .replace(/\s/g, '')

    const binaryDer = Uint8Array.from(atob(pemContents), (c) => c.charCodeAt(0))

    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      binaryDer,
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      false,
      ['verify']
    )

    const signatureBytes = Uint8Array.from(
      atob(parts[2].replace(/-/g, '+').replace(/_/g, '/')),
      (c) => c.charCodeAt(0)
    )

    const dataBytes = new TextEncoder().encode(`${parts[0]}.${parts[1]}`)

    const valid = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', cryptoKey, signatureBytes, dataBytes)

    if (!valid) return null

    return {
      uid: payload.sub || payload.user_id,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
    }
  } catch (err) {
    console.error('Token verification failed:', err)
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
