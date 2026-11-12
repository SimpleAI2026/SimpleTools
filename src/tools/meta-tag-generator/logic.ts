export interface MetaInput {
  title: string
  description: string
  url: string
  image: string
  siteName: string
  author: string
  keywords: string
  locale: string
  robots: string
  twitterCard: 'summary' | 'summary_large_image'
}

function esc(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char] ?? char)
}

function meta(attr: 'name' | 'property', key: string, content: string): string | null {
  const value = content.trim()
  if (!value) return null
  return `<meta ${attr}="${esc(key)}" content="${esc(value)}">`
}

export function metaTags(input: MetaInput): string {
  const lines = [
    meta('name', 'description', input.description),
    meta('name', 'author', input.author),
    meta('name', 'keywords', input.keywords),
    meta('name', 'robots', input.robots),
    input.title.trim() ? `<title>${esc(input.title.trim())}</title>` : null,
    meta('property', 'og:title', input.title),
    meta('property', 'og:description', input.description),
    meta('property', 'og:url', input.url),
    meta('property', 'og:image', input.image),
    meta('property', 'og:site_name', input.siteName),
    meta('property', 'og:locale', input.locale),
    meta('name', 'twitter:card', input.twitterCard),
    meta('name', 'twitter:title', input.title),
    meta('name', 'twitter:description', input.description),
    meta('name', 'twitter:image', input.image),
  ]
  return lines.filter((line): line is string => Boolean(line)).join('\n')
}
