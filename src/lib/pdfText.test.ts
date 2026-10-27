import { describe, expect, it } from 'vitest'
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs'
import { layoutPdf, wrapText } from './pdfText'

const w = (s: string) => s.length
describe('pdfText', () => {
  it('wraps words and CJK', () => {
    expect(wrapText('aaa bbb ccc', w, 7)).toEqual(['aaa bbb', 'ccc'])
    expect(wrapText('中文字符测试', w, 4)).toEqual(['中文字符', '测试'])
    expect(wrapText('abcdefghij', w, 4)).toEqual(['abcd', 'efgh', 'ij'])
    expect(wrapText('', w, 4)).toEqual([''])
  })
  it('lays out selectable text across pages', async () => {
    const blocks = Array.from({ length: 80 }, (_, i) => ({ text: `Line ${i}`, size: 12 }))
    const out = await layoutPdf(blocks, { pageSize: [300, 300], margin: 20, lineHeight: 1.4, family: 'Courier' })
    const pdf = await getDocument({ data: out }).promise
    expect(pdf.numPages).toBeGreaterThan(5)
    const t = (await (await pdf.getPage(1)).getTextContent()).items.map((x) => ('str' in x ? x.str : '')).join(' ')
    expect(t.replace(/\s+/g, ' ')).toContain('Line 0 Line 1')
  })
  it('rejects CJK without a font or rasterizer', async () => {
    await expect(layoutPdf([{ text: '你好', size: 12 }], { pageSize: [300, 300], margin: 20, lineHeight: 1.4, family: 'Helvetica' })).rejects.toThrow(/font/)
  })
})
