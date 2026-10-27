import { describe, expect, it } from 'vitest'
import { PDFDocument, StandardFonts } from '@cantoo/pdf-lib'
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs'
import { overlayPdf } from './logic'

async function pdfWith(text: string, pages = 1) {
  const d = await PDFDocument.create()
  const f = await d.embedFont(StandardFonts.Helvetica)
  for (let i = 0; i < pages; i++) d.addPage([300, 300]).drawText(`${text}${i + 1}`, { x: 20, y: 150, font: f, size: 12 })
  return d.save()
}
const texts = async (b: Uint8Array) => {
  const pdf = await getDocument({ data: b }).promise
  const out: string[] = []
  for (let i = 1; i <= pdf.numPages; i++) out.push((await (await pdf.getPage(i)).getTextContent()).items.map((x) => ('str' in x ? x.str : '')).join('|'))
  return out
}

describe('pdf-overlay', () => {
  it('stamps foreground and background', async () => {
    const o = { mapping: 'first' as const, fit: 'none' as const, opacity: 1, pages: '' }
    expect(await texts(await overlayPdf(await pdfWith('base', 2), await pdfWith('stamp'), { ...o, layer: 'foreground' }))).toEqual(['base1|stamp1', 'base2|stamp1'])
    expect(await texts(await overlayPdf(await pdfWith('base', 1), await pdfWith('stamp'), { ...o, layer: 'background' }))).toEqual(['stamp1|base1'])
  })
  it('cycles overlay pages', async () => {
    const r = await overlayPdf(await pdfWith('b', 3), await pdfWith('o', 2), { mapping: 'cycle', fit: 'stretch', opacity: 0.5, pages: '', layer: 'foreground' })
    expect(await texts(r)).toEqual(['b1|o1', 'b2|o2', 'b3|o1'])
  })
})
