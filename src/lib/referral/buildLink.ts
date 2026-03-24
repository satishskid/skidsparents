/**
 * Builds a referral link with UTM parameters for sharing.
 */
export function buildReferralLink(code: string, medium: 'whatsapp' | 'copy'): string {
  const url = new URL(`https://parent.skids.clinic/ref/${code}`)
  url.searchParams.set('utm_source', 'referral')
  url.searchParams.set('utm_medium', medium)
  url.searchParams.set('utm_campaign', 'skids_referral')
  return url.toString()
}
