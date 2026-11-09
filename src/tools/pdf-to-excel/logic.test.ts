import { describe, expect, it } from 'vitest'
import { PDFDocument, StandardFonts } from '@cantoo/pdf-lib'
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs'
import type { PDFDocumentProxy } from 'pdfjs-dist'
import { compactColumns, pdfToSheets } from './logic'

describe('pdf-to-excel', () => {
  it('compacts empty columns', () => expect(compactColumns([['a', '', 'b'], ['c', '', '']])).toEqual([['a', 'b'], ['c', '']]))
  it('extracts a table', async () => {
    const d = await PDFDocument.create()
    const f = await d.embedFont(StandardFonts.Helvetica)
    const p = d.addPage([400, 300])
    const rows = [['Name', 'Qty', 'Price'], ['Apple', '3', '1.5'], ['Banana split', '12', '0.25']]
    rows.forEach((r, i) => r.forEach((c, j) => p.drawText(c, { x: 30 + j * 120, y: 250 - i * 20, size: 10, font: f })))
    const pdf = (await getDocument({ data: await d.save() }).promise) as unknown as PDFDocumentProxy
    const [sheet] = await pdfToSheets(pdf, [1], 'per-page', true)
    expect(sheet!.rows).toEqual([['Name', 'Qty', 'Price'], ['Apple', 3, 1.5], ['Banana split', 12, 0.25]])
  })
})
