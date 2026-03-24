import { describe, it, expect } from 'vitest'
import { buildReferralLink } from './buildLink'

describe('buildReferralLink', () => {
  it('includes the code in the path', () => {
    const link = buildReferralLink('abc12345', 'copy')
    expect(link).toContain('/ref/abc12345')
  })

  it('sets utm_medium=copy for copy medium', () => {
    const link = buildReferralLink('abc12345', 'copy')
    const url = new URL(link)
    expect(url.searchParams.get('utm_medium')).toBe('copy')
  })

  it('sets utm_medium=whatsapp for whatsapp medium', () => {
    const link = buildReferralLink('abc12345', 'whatsapp')
    const url = new URL(link)
    expect(url.searchParams.get('utm_medium')).toBe('whatsapp')
  })

  it('always sets utm_campaign=skids_referral', () => {
    const copy = new URL(buildReferralLink('abc12345', 'copy'))
    const wa = new URL(buildReferralLink('abc12345', 'whatsapp'))
    expect(copy.searchParams.get('utm_campaign')).toBe('skids_referral')
    expect(wa.searchParams.get('utm_campaign')).toBe('skids_referral')
  })

  it('always sets utm_source=referral', () => {
    const url = new URL(buildReferralLink('xyz99999', 'copy'))
    expect(url.searchParams.get('utm_source')).toBe('referral')
  })

  it('base URL is parent.skids.clinic', () => {
    const url = new URL(buildReferralLink('abc12345', 'copy'))
    expect(url.hostname).toBe('parent.skids.clinic')
  })
})
