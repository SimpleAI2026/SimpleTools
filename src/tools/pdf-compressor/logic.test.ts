import { describe, expect, it } from 'vitest'
import { PDFDocument, StandardFonts } from '@cantoo/pdf-lib'
import { compressLossless } from './logic'

describe('pdf-compressor', () => {
  it('lossless re-save keeps pages and strips metadata', async () => {
    const d = await PDFDocument.create()
    d.setTitle('Secret title')
    d.setAuthor('Someone')
    const f = await d.embedFont(StandardFonts.Helvetica)
    for (let i = 0; i < 3; i++) d.addPage().drawText(`page ${i}`, { x: 40, y: 700, font: f })
    const src = await d.save({ useObjectStreams: false })
    const out = await compressLossless(src, true)
    const re = await PDFDocument.load(out)
    expect(re.getPageCount()).toBe(3)
    expect(re.getTitle() ?? '').toBe('')
    expect(re.getAuthor() ?? '').toBe('')
    expect(out.length).toBeLessThanOrEqual(src.length)
  })
})
