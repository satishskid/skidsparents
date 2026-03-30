// Sitemap generator for SEO
export const prerender = false

import type { APIContext } from 'astro'

const SITE_URL = 'https://parent.skids.clinic'

export async function GET({ locals }: APIContext) {
  // Fetch all blogs
  let blogs: any[] = []
  try {
    const res = await fetch('https://9vhd0onw23.execute-api.ap-south-1.amazonaws.com/published-blogs')
    if (res.ok) {
      blogs = (await res.json()) as any[]
    }
  } catch {
    blogs = []
  }

  // Static pages
  const staticPages = [
    { url: '', changefreq: 'daily', priority: '1.0' },
    { url: '/blog', changefreq: 'daily', priority: '0.9' },
    { url: '/discover', changefreq: 'weekly', priority: '0.8' },
    { url: '/community', changefreq: 'daily', priority: '0.8' },
    { url: '/timeline', changefreq: 'weekly', priority: '0.7' },
    { url: '/interventions', changefreq: 'weekly', priority: '0.7' },
    { url: '/me', changefreq: 'weekly', priority: '0.6' },
  ]

  // Generate sitemap XML
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages
  .map(
    (page) => `  <url>
    <loc>${SITE_URL}${page.url}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  )
  .join('\n')}
${blogs
  .map((blog) => {
    const lastmod = blog.createdAt ? new Date(blog.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    return `  <url>
    <loc>${SITE_URL}/blog/${blog.blogId}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`
  })
  .join('\n')}
</urlset>`

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
    },
  })
}
