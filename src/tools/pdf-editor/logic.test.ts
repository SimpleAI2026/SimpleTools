import { describe, expect, it } from 'vitest'
import { PDFDocument } from '@cantoo/pdf-lib'
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs'
import { applyEdits, toPdfBox } from './logic'

describe('pdf-editor', () => {
  it('coordinates', () => expect(toPdfBox({ x: 10, y: 20, height: 100 }, 5, 30, 10)).toEqual({ x: 15, y: 80 }))
  it('adds text and shapes', async () => {
    const d = await PDFDocument.create()
    d.addPage([300, 300])
    const out = await applyEdits(await d.save(), [
      { type: 'rect', page: 1, x: 10, y: 10, w: 50, h: 20, color: '#ffffff', fill: true, opacity: 1, stroke: 1 },
      { type: 'text', page: 1, x: 20, y: 40, text: 'Edited\nline two', size: 14, color: '#112233' },
      { type: 'text', page: 9, x: 0, y: 0, text: 'ignored', size: 10, color: '#000' },
    ])
    const pdf = await getDocument({ data: out }).promise
    const tc = await (await pdf.getPage(1)).getTextContent()
    const items = tc.items.filter((i) => 'str' in i && i.str) as { str: string; transform: number[] }[]
    expect(items.map((i) => i.str)).toEqual(['Edited', 'line two'])
    expect(items[0]!.transform[5]).toBeCloseTo(300 - 40 - 14)
  })
})
