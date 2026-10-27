import { describe, expect, it } from 'vitest'
import { PDFDocument } from '@cantoo/pdf-lib'
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs'
import { rotatedOrigin, tilePositions, watermarkPdf, type WatermarkOptions } from './logic'

const o: WatermarkOptions = { kind: 'text', text: 'CONFIDENTIAL', fontSize: 40, color: '#ff0000', opacity: 0.3, rotation: 45, layout: 'center', gap: 40, imageScale: 0.5, layer: 'foreground', pages: '' }
describe('pdf-watermark', () => {
  it('geometry', () => {
    expect(rotatedOrigin(50, 50, 20, 10, 0)).toEqual({ x: 40, y: 45 })
    expect(tilePositions(100, 100, 40, 40, 10).length).toBeGreaterThanOrEqual(9)
  })
  it('adds watermark text', async () => {
    const d = await PDFDocument.create()
    d.addPage()
    d.addPage()
    const out = await watermarkPdf(await d.save(), { ...o, pages: '2', layout: 'tile', layer: 'background' })
    const pdf = await getDocument({ data: out }).promise
    const text = async (n: number) => (await (await pdf.getPage(n)).getTextContent()).items.map((i) => ('str' in i ? i.str : '')).join('')
    expect(await text(1)).toBe('')
    expect(await text(2)).toContain('CONFIDENTIAL')
  })
  it('needs a rasterizer for CJK text', async () => {
    const d = await PDFDocument.create()
    d.addPage()
    await expect(watermarkPdf(await d.save(), { ...o, text: '机密' })).rejects.toThrow(/encode/)
  })
})
