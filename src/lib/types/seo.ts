// SEO metadata types for blog posts and pages

export interface BlogSEOMetadata {
  // Basic meta tags
  title: string
  description: string
  keywords?: string[]
  canonicalUrl: string
  
  // Open Graph tags
  ogTitle: string
  ogDescription: string
  ogImage: string
  ogUrl: string
  ogType: 'article'
  
  // Twitter Card tags
  twitterCard: 'summary_large_image'
  twitterTitle: string
  twitterDescription: string
  twitterImage: string
  
  // Article-specific
  author?: string
  publishedTime?: string
  modifiedTime?: string
  section?: string
  tags?: string[]
  
  // Structured data (JSON-LD)
  structuredData?: {
    '@context': 'https://schema.org'
    '@type': 'Article' | 'BlogPosting'
    headline: string
    description: string
    image: string
    datePublished: string
    dateModified?: string
    author: {
      '@type': 'Person' | 'Organization'
      name: string
    }
    publisher: {
      '@type': 'Organization'
      name: string
      logo: {
        '@type': 'ImageObject'
        url: string
      }
    }
    mainEntityOfPage: {
      '@type': 'WebPage'
      '@id': string
    }
    articleSection?: string
  }
}

export interface PageSEOMetadata {
  title: string
  description: string
  keywords?: string[]
  canonicalUrl: string
  ogImage?: string
  noIndex?: boolean
}
