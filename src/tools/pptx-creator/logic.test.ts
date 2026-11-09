import { describe, expect, it } from 'vitest'
import { unzipSync } from 'fflate'
import { buildPptx, parseSlides, stripInline } from './logic'

const md = '# Deck\n## Sub\n---\n# Agenda\n- One **bold**\n  - Nested\n1. Num\n> note here\nplain line\n---\n\n'
describe('pptx-creator', () => {
  it('parses slides', () => {
    const s = parseSlides(md)
    expect(s).toHaveLength(2)
    expect(s[0]).toEqual({ title: 'Deck', subtitle: 'Sub', bullets: [], notes: [] })
    expect(s[1]!.bullets).toEqual([
      { text: 'One bold', level: 0 },
      { text: 'Nested', level: 1 },
      { text: 'Num', level: 0 },
      { text: 'plain line', level: 0 },
    ])
    expect(s[1]!.notes).toEqual(['note here'])
  })
  it('strips inline markdown', () => expect(stripInline('a *b* `c` [d](e) __f__')).toBe('a b c d f'))
  it('builds a pptx', async () => {
    const bytes = await buildPptx(parseSlides(md), { theme: 'dark', layout: '16x9', title: 'T', font: 'Arial' })
    const files = Object.keys(unzipSync(bytes))
    expect(files).toContain('ppt/slides/slide1.xml')
    expect(files).toContain('ppt/slides/slide2.xml')
    expect(files).not.toContain('ppt/slides/slide3.xml')
  })
})
