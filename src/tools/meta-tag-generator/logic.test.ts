import { describe, expect, it } from 'vitest'
import { metaTags } from './logic'

describe('meta-tag-generator', () => {
  it('emits escaped title, open graph and twitter tags', () => {
    const html = metaTags({
      title: 'A & B',
      description: 'Hello',
      url: 'https://example.com',
      image: 'https://example.com/a.png',
      siteName: 'SimpleTools',
      author: '',
      keywords: 'tools',
      locale: 'en',
      robots: 'index,follow',
      twitterCard: 'summary_large_image',
    })
    expect(html).toContain('<title>A &amp; B</title>')
    expect(html).toContain('property="og:url" content="https://example.com"')
    expect(html).toContain('name="twitter:card" content="summary_large_image"')
    expect(html).not.toContain('name="author"')
  })
})
