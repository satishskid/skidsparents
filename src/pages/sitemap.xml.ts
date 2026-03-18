// Dynamic sitemap.xml for Google Search Console
export const prerender = false

import type { APIContext } from 'astro'

const SITE = 'https://parent.skids.clinic'

const staticPages = [
  { url: '/', priority: '1.0', changefreq: 'daily' },
  { url: '/blog', priority: '0.9', changefreq: 'daily' },
  { url: '/discover', priority: '0.8', changefreq: 'weekly' },
  { url: '/interventions', priority: '0.8', changefreq: 'weekly' },
  { url: '/services', priority: '0.8', changefreq: 'weekly' },
  { url: '/about', priority: '0.6', changefreq: 'monthly' },
  { url: '/login', priority: '0.5', changefreq: 'monthly' },
  { url: '/timeline', priority: '0.7', changefreq: 'weekly' },
]

const organSlugs = [
  'brain', 'eyes', 'ears', 'heart', 'lungs', 'stomach',
  'liver', 'kidneys', 'bones', 'muscles', 'skin', 'teeth',
  'immune', 'hormones', 'nervous', 'reproductive'
]

export async function GET({ request }: APIContext) {
  const now = new Date().toISOString().split('T')[0]

  // Fetch blog slugs from external API
  let blogUrls: string[] = []
  try {
    const res = await fetch(
      'https://9vhd0onw23.execute-api.ap-south-1.amazonaws.com/published-blogs',
      { signal: AbortSignal.timeout(5000) }
    )
    if (res.ok) {
      const blogs = await res.json() as any[]
      blogUrls = blogs
        .filter((b: any) => b.slug)
        .map((b: any) => `/blog/${b.slug}`)
    }
  } catch {
    // Silently fail — sitemap still works without blog URLs
  }

  const allUrls = [
    ...staticPages.map(p => ({
      url: `${SITE}${p.url}`,
      lastmod: now,
      changefreq: p.changefreq,
      priority: p.priority,
    })),
    ...organSlugs.map(slug => ({
      url: `${SITE}/discover/${slug}`,
      lastmod: now,
      changefreq: 'monthly',
      priority: '0.7',
    })),
    ...blogUrls.map(path => ({
      url: `${SITE}${path}`,
      lastmod: now,
      changefreq: 'weekly',
      priority: '0.8',
    })),
  ]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(u => `  <url>
    <loc>${u.url}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
