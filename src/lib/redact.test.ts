import { describe, expect, it } from 'vitest'
import { PDFDocument, StandardFonts } from '@cantoo/pdf-lib'
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs'
import type { PDFPageProxy } from 'pdfjs-dist'
import { buildMatcher, findMatchRects, redactPdf, type PageRasterizer } from './redact'

const PNG = Uint8Array.from(atob('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='), (c) => c.charCodeAt(0))
const stub: PageRasterizer = async () => ({ bytes: PNG, type: 'png', widthPt: 300, heightPt: 300 })
async function sample() {
  const d = await PDFDocument.create()
  d.setTitle('secret title')
  const f = await d.embedFont(StandardFonts.Helvetica)
  d.addPage([300, 300]).drawText('SSN 123-45-6789 here', { x: 20, y: 200, size: 12, font: f })
  d.addPage([300, 300]).drawText('public text', { x: 20, y: 200, size: 12, font: f })
  return d.save()
}
const allText = async (b: Uint8Array) => {
  const pdf = await getDocument({ data: b.slice() }).promise
  const r: string[] = []
  for (let i = 1; i <= pdf.numPages; i++) r.push((await (await pdf.getPage(i)).getTextContent()).items.map((x) => ('str' in x ? x.str : '')).join(''))
  return r
}

describe('redact', () => {
  it('builds matchers', () => {
    expect(buildMatcher(['a.b'], { regex: false, caseSensitive: false, wholeWord: false, padding: 0 })!.test('A.B')).toBe(true)
    const w = buildMatcher(['cat'], { regex: false, caseSensitive: true, wholeWord: true, padding: 0 })!
    expect('concat cat'.match(w)).toHaveLength(1)
    expect(buildMatcher([' '], { regex: false, caseSensitive: true, wholeWord: false, padding: 0 })).toBeNull()
  })
  it('finds match boxes in viewport space', async () => {
    const pdf = await getDocument({ data: await sample() }).promise
    const re = buildMatcher(['\\d{3}-\\d{2}-\\d{4}'], { regex: true, caseSensitive: false, wholeWord: false, padding: 0 })!
    const [m] = await findMatchRects((await pdf.getPage(1)) as unknown as PDFPageProxy, 1, re, 0)
    expect(m!.text).toBe('123-45-6789')
    expect(m!.x).toBeGreaterThan(30)
    expect(m!.y).toBeGreaterThan(80) // top-left origin: baseline 200 → y≈88
    expect(m!.y).toBeLessThan(100)
  })
  it('redacted text is no longer extractable; other pages and metadata handled', async () => {
    const out = await redactPdf(await sample(), [{ page: 1, x: 0, y: 0, w: 10, h: 10 }], stub)
    const [p1, p2] = await allText(out)
    expect(p1).toBe('')
    expect(p2).toBe('public text')
    expect(new TextDecoder('latin1').decode(out)).not.toContain('123-45')
    expect((await PDFDocument.load(out)).getTitle()).toBeUndefined()
  })
})
