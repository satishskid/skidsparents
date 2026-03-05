/** SKIDS social handles & brand config — single source of truth */

export const SOCIAL = {
  instagram: 'https://www.instagram.com/skids.health/',
  instagramClinic: 'https://www.instagram.com/skids_clinic/',
  twitter: 'https://x.com/SKIDS58283752',
  twitterHandle: '@SKIDS58283752',
  facebook: 'https://www.facebook.com/skids.health',
  youtube: 'https://www.youtube.com/@SKIDS_Health',
  linkedin: 'https://www.linkedin.com/company/skids/',
  medium: 'https://medium.com/@skids_health',
  whatsapp: '+917377112777',
  clinic: 'https://skids.clinic',
} as const

export const BRAND = {
  name: 'SKIDS Parent',
  legalName: 'SKIDS Health Technologies',
  tagline: 'Raising smart, healthy S-Kids with evidence-based care',
  siteUrl: 'https://parent.skids.clinic',
  themeColor: '#16a34a',
  email: 'hello@skids.health',
} as const

/** Generate a WhatsApp share URL */
export function whatsappShareUrl(text: string, url: string): string {
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(`${text}\n${url}`)}`
}

/** Generate a Twitter/X share URL */
export function twitterShareUrl(text: string, url: string): string {
  return `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}&via=SKIDS58283752`
}

/** Generate a Facebook share URL */
export function facebookShareUrl(url: string): string {
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
}
