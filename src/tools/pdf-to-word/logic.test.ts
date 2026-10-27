import { describe, expect, it } from 'vitest'
import { PDFDocument, StandardFonts } from '@cantoo/pdf-lib'
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs'
import type { PDFDocumentProxy } from 'pdfjs-dist'
import { docxToText } from '@/lib/word'
import { pdfToDocx } from './logic'

describe('pdf-to-word', () => {
  it('round-trips text into docx', async () => {
    const d = await PDFDocument.create()
    const f = await d.embedFont(StandardFonts.Helvetica)
    d.addPage([300, 300]).drawText('Quarterly report', { x: 20, y: 200, size: 12, font: f })
    const pdf = (await getDocument({ data: await d.save() }).promise) as unknown as PDFDocumentProxy
    const { blob, markdown } = await pdfToDocx(pdf, [1], { font: 'Arial', fontSize: 11, title: 't' })
    expect(markdown).toContain('Quarterly report')
    expect(await docxToText(await blob.arrayBuffer())).toContain('Quarterly report')
  })
})
