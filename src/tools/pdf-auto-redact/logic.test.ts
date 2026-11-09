import { describe, expect, it } from 'vitest'
import { PDFDocument, StandardFonts } from '@cantoo/pdf-lib'
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs'
import type { PDFDocumentProxy } from 'pdfjs-dist'
import { collectMatches, PRESETS, redactPdf } from './logic'
import type { PageRasterizer } from '@/lib/redact'

const re = (k: string) => new RegExp(PRESETS[k]!, 'u')
const PNG = Uint8Array.from(atob('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='), (c) => c.charCodeAt(0))

describe('pdf-auto-redact', () => {
  it('presets', () => {
    expect(re('email').test('mail a.b+c@ex-ample.co.uk')).toBe(true)
    expect(re('phoneCN').test('tel 13812345678')).toBe(true)
    expect(re('phoneCN').test('213812345678')).toBe(false)
    expect(re('idCN').test('11010519491231002X')).toBe(true)
    expect(re('card').test('4111 1111 1111 1111')).toBe(true)
    expect(re('ip').test('10.0.0.1')).toBe(true)
  })
  it('finds and truly redacts matches (text not extractable)', async () => {
    const d = await PDFDocument.create()
    const f = await d.embedFont(StandardFonts.Helvetica)
    d.addPage([300, 300]).drawText('Contact bob@example.com now', { x: 20, y: 200, size: 12, font: f })
    d.addPage([300, 300]).drawText('Nothing to see', { x: 20, y: 200, size: 12, font: f })
    const src = await d.save()
    const pdf = (await getDocument({ data: src.slice() }).promise) as unknown as PDFDocumentProxy
    const matches = await collectMatches(pdf, [1, 2], ['nothing'], ['email'], { regex: false, caseSensitive: false, wholeWord: true, padding: 1 })
    expect(matches.map((m) => [m.page, m.text])).toEqual([[1, 'bob@example.com'], [2, 'Nothing']])
    const stub: PageRasterizer = async () => ({ bytes: PNG, type: 'png', widthPt: 300, heightPt: 300 })
    const out = await redactPdf(src, matches.filter((m) => m.page === 1), stub)
    const res = await getDocument({ data: out.slice() }).promise
    const text = async (n: number) => (await (await res.getPage(n)).getTextContent()).items.map((x) => ('str' in x ? x.str : '')).join('')
    expect(await text(1)).not.toContain('bob@example.com')
    expect(await text(1)).toBe('')
    expect(await text(2)).toBe('Nothing to see')
  })
})
