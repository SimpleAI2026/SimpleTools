import { describe, expect, it } from 'vitest'
import { PDFDocument } from '@cantoo/pdf-lib'
import { fitInto, scalePages, targetSize } from './logic'

describe('pdf-scale-pages', () => {
  it('sizes', () => {
    expect(targetSize({ target: 'a4', width: 0, height: 0, orientation: 'auto', margin: 0 }, 800, 600)).toEqual([841.89, 595.28])
    expect(targetSize({ target: 'custom', width: 100, height: 200, orientation: 'portrait', margin: 0 }, 1, 1)).toEqual([100, 200])
    expect(fitInto(100, 50, 200, 200, 0)).toEqual({ scale: 2, x: 0, y: 50 })
  })
  it('scales pages', async () => {
    const d = await PDFDocument.create()
    d.addPage([612, 792])
    d.addPage([612, 792]).drawRectangle({ x: 10, y: 10, width: 50, height: 50 })
    const out = await PDFDocument.load(await scalePages(await d.save(), { target: 'a4', width: 0, height: 0, orientation: 'auto', margin: 0 }))
    expect(out.getPages().map((p) => p.getSize())).toEqual([{ width: 595.28, height: 841.89 }, { width: 595.28, height: 841.89 }])
  })
})
