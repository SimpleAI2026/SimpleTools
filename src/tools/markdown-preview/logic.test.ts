import { describe, expect, it } from 'vitest'
import { markdownStats, renderMarkdown, wrapHtmlDocument } from './logic'

describe('markdown-preview', () => {
  it('renders gfm', () => {
    const html = renderMarkdown('# Hi\n\n| a | b |\n|---|---|\n| 1 | 2 |\n\n~~x~~')
    expect(html).toContain('<h1>Hi</h1>')
    expect(html).toContain('<table>')
    expect(html).toContain('<del>x</del>')
  })
  it('breaks option', () => {
    expect(renderMarkdown('a\nb', { gfm: true, breaks: true })).toContain('<br>')
  })
  it('stats and wrap', () => {
    expect(markdownStats('# 标题\nhello world')).toEqual({ words: 4, headings: 1, minutes: 1 })
    expect(wrapHtmlDocument('<p>x</p>', '<t>')).toContain('<title>&lt;t></title>')
  })
})
