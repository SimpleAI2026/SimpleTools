import { describe, expect, it } from 'vitest'
import { PDFDocument, StandardFonts } from '@cantoo/pdf-lib'
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs'
import type { PDFDocumentProxy } from 'pdfjs-dist'
import { extractPdfText } from './logic'

describe('pdf-to-text', () => {
  it('extracts text per page', async () => {
    const d = await PDFDocument.create()
    const f = await d.embedFont(StandardFonts.Helvetica)
    d.addPage([200, 200]).drawText('Hello', { x: 10, y: 100, font: f })
    d.addPage([200, 200]).drawText('World', { x: 10, y: 100, font: f })
    const pdf = (await getDocument({ data: await d.save() }).promise) as unknown as PDFDocumentProxy
    expect(await extractPdfText(pdf, [1, 2], false)).toBe('Hello\n\nWorld')
    expect(await extractPdfText(pdf, [2], true)).toBe('----- 2 -----\nWorld')
  })
})
