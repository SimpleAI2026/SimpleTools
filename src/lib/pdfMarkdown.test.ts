import { describe, expect, it } from 'vitest'
import { PDFDocument, StandardFonts } from '@cantoo/pdf-lib'
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs'
import type { PDFDocumentProxy } from 'pdfjs-dist'
import { linesToMarkdown, pdfToMarkdown } from './pdfMarkdown'

describe('pdfMarkdown', () => {
  it('detects headings, bullets, paragraphs', () => {
    const md = linesToMarkdown([[
      { text: 'Title', size: 24, y: 700, x: 50 },
      { text: 'Body one', size: 11, y: 670, x: 50 },
      { text: 'continues', size: 11, y: 656, x: 50 },
      { text: '• item', size: 11, y: 620, x: 50 },
    ]])
    expect(md).toBe('# Title\n\nBody one continues\n\n- item\n')
  })
  it('converts a real PDF', async () => {
    const d = await PDFDocument.create()
    const f = await d.embedFont(StandardFonts.Helvetica)
    const p = d.addPage([400, 400])
    p.drawText('Heading', { x: 40, y: 340, size: 22, font: f })
    p.drawText('Some text here', { x: 40, y: 300, size: 11, font: f })
    p.drawText('more words', { x: 40, y: 286, size: 11, font: f })
    const pdf = await getDocument({ data: await d.save() }).promise
    expect(await pdfToMarkdown(pdf as unknown as PDFDocumentProxy, [1])).toBe('# Heading\n\nSome text here more words\n')
  })
})
