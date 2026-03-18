// SocialShareService — generates UTM-tagged share URLs and tracks shares
// Feature: brand-awareness

import { drizzle } from 'drizzle-orm/d1'
import { socialShares } from '@/lib/db/schema'

export type SharePlatform = 'whatsapp' | 'instagram' | 'facebook' | 'twitter' | 'linkedin' | 'medium' | 'copy'
export type ShareContentType = 'blog' | 'organ' | 'habit' | 'milestone' | 'growth' | 'intervention'

export interface ShareUrlOptions {
  baseUrl: string
  platform: SharePlatform
  contentType: ShareContentType
  contentId: string
}

/** Build a UTM-tagged URL for sharing */
export function generateShareUrl(opts: ShareUrlOptions): string {
  const base = opts.baseUrl.startsWith('http')
    ? opts.baseUrl
    : `https://parent.skids.clinic${opts.baseUrl}`

  const params = new URLSearchParams({
    utm_source: opts.platform,
    utm_medium: 'social',
    utm_campaign: `skids_share_${opts.contentType}`,
    utm_content: opts.contentId,
  })

  return `${base}?${params.toString()}`
}

/** Build the platform-specific share link (WhatsApp, Twitter, etc.) */
export function buildPlatformShareLink(
  shareUrl: string,
  platform: SharePlatform,
  text: string
): string {
  const encoded = encodeURIComponent(shareUrl)
  const encodedText = encodeURIComponent(text)

  switch (platform) {
    case 'whatsapp':
      return `https://api.whatsapp.com/send?text=${encodeURIComponent(text + ' ' + shareUrl)}`
    case 'facebook':
      return `https://www.facebook.com/sharer/sharer.php?u=${encoded}`
    case 'twitter':
      return `https://x.com/intent/tweet?text=${encodedText}&url=${encoded}&via=SKIDS58283752`
    case 'linkedin':
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`
    case 'medium':
      return `https://medium.com/new-story?url=${encoded}`
    case 'instagram':
      // Instagram doesn't support direct URL sharing — copy to clipboard
      return shareUrl
    case 'copy':
      return shareUrl
    default:
      return shareUrl
  }
}

export class SocialShareService {
  private db: ReturnType<typeof drizzle>

  constructor(d1: D1Database) {
    this.db = drizzle(d1)
  }

  /** Generate a UTM-tagged share URL */
  generateShareUrl(opts: ShareUrlOptions): string {
    return generateShareUrl(opts)
  }

  /** Track a share event in the database */
  async trackShare(
    parentId: string | null,
    platform: SharePlatform,
    contentType: ShareContentType,
    contentId: string,
    shareUrl: string,
    utmCampaign: string
  ): Promise<void> {
    await this.db.insert(socialShares).values({
      parentId,
      platform,
      contentType,
      contentId,
      shareUrl,
      utmCampaign,
    })
  }
}
