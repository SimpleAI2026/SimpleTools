import { describe, expect, it } from 'vitest'
import { guessTitle, mdToHtml } from './logic'

describe('md-to-html', () => {
  it('title', () => {
    expect(guessTitle('text\n## Hello world\n')).toBe('Hello world')
    expect(guessTitle('none')).toBe('Document')
  })
  it('fragment and document', () => {
    expect(mdToHtml('# A', false)).toBe('<h1>A</h1>')
    const doc = mdToHtml('# A', true, (h) => h.toUpperCase())
    expect(doc).toContain('<title>A</title>')
    expect(doc).toContain('<H1>A</H1>')
  })
})
