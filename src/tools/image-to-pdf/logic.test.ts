import { describe, expect, it } from 'vitest'
import { PDFDocument } from '@cantoo/pdf-lib'
import { imagesToPdf, pageFor, placeImage } from './logic'

const PNG = Uint8Array.from(atob('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='), (c) => c.charCodeAt(0))
describe('image-to-pdf', () => {
  it('geometry', () => {
    expect(placeImage(100, 50, 220, 220, 10)).toEqual({ x: 10, y: 60, width: 200, height: 100 })
    expect(pageFor({ width: 400, height: 200 }, { page: 'a4', orientation: 'auto', margin: 0 })).toEqual([841.89, 595.28])
    expect(pageFor({ width: 400, height: 200 }, { page: 'fit', orientation: 'auto', margin: 0 })).toEqual([300, 150])
  })
  it('builds one page per image', async () => {
    const out = await imagesToPdf([{ bytes: PNG, type: 'png', width: 1, height: 1 }, { bytes: PNG, type: 'png', width: 1, height: 1 }], { page: 'letter', orientation: 'portrait', margin: 36 })
    expect((await PDFDocument.load(out)).getPageCount()).toBe(2)
  })
})
