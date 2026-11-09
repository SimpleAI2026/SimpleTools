import { describe, expect, it } from 'vitest'
import { addHeadingIds, countWords } from './logic'

describe('word-viewer', () => {
  it('toc', () => {
    const r = addHeadingIds('<h1>A <strong>b</strong></h1><p>x</p><h2>C</h2><h4>skip</h4>')
    expect(r.toc).toEqual([{ id: 'doc-h-1', level: 1, text: 'A b' }, { id: 'doc-h-2', level: 2, text: 'C' }])
    expect(r.html).toContain('<h2 id="doc-h-2">C</h2>')
  })
  it('words', () => expect(countWords("中文 it's ok")).toBe(4))
})
