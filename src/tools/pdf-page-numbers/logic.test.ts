import { describe, expect, it } from 'vitest'
import { PDFDocument } from '@cantoo/pdf-lib'
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs'
import { addPageNumbers, formatLabel, labelPosition } from './logic'

describe('pdf-page-numbers', () => {
  it('labels and positions', () => {
    expect(formatLabel('Page {n} of {total}', 2, 5)).toBe('Page 2 of 5')
    expect(labelPosition('bottom-center', 600, 800, 20, 10, 30)).toEqual({ x: 290, y: 30 })
    expect(labelPosition('top-right', 600, 800, 20, 10, 30)).toEqual({ x: 550, y: 760 })
  })
  it('stamps numbers as extractable text', async () => {
    const d = await PDFDocument.create()
    for (let i = 0; i < 3; i++) d.addPage([300, 300])
    const out = await addPageNumbers(await d.save(), { format: '{n}/{total}', position: 'bottom-right', fontSize: 10, margin: 20, start: 1, pages: '', color: '#000000', skipFirst: true })
    const pdf = await getDocument({ data: out }).promise
    const text = async (n: number) => (await (await pdf.getPage(n)).getTextContent()).items.map((i) => ('str' in i ? i.str : '')).join('')
    expect(await text(1)).toBe('')
    expect(await text(2)).toBe('1/2')
    expect(await text(3)).toBe('2/2')
  })
})
