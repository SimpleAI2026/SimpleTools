import { describe, expect, it } from 'vitest'
import { PDFDocument } from '@cantoo/pdf-lib'
import { cropPdf } from './logic'

describe('pdf-crop', () => {
  it('crops selected pages', async () => {
    const d = await PDFDocument.create()
    d.addPage([600, 800])
    d.addPage([600, 800])
    const out = await PDFDocument.load(await cropPdf(await d.save(), { top: 10, right: 20, bottom: 30, left: 40 }, '2', false))
    expect(out.getPage(0).getCropBox()).toMatchObject({ x: 0, y: 0, width: 600, height: 800 })
    expect(out.getPage(1).getCropBox()).toMatchObject({ x: 40, y: 30, width: 540, height: 760 })
  })
  it('rejects oversize margins', async () => {
    const d = await PDFDocument.create()
    d.addPage([100, 100])
    await expect(cropPdf(await d.save(), { top: 60, right: 0, bottom: 60, left: 0 }, '', false)).rejects.toThrow()
  })
})
