/**
 * Generates a deterministic 8-character base36 referral code from a Firebase UID.
 * Uses SHA-256 hash of the UID, takes first 5 bytes, encodes as base36.
 */
export async function generateReferralCode(firebaseUid: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(firebaseUid)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = new Uint8Array(hashBuffer)
  // Take first 5 bytes → up to 10 base36 chars, slice to 8
  const num = hashArray.slice(0, 5).reduce((acc, byte) => acc * 256n + BigInt(byte), 0n)
  return num.toString(36).padStart(8, '0').slice(0, 8)
}
