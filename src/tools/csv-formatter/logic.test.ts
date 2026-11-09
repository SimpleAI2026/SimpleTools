import { describe, expect, it } from 'vitest'
import { displayWidth, formatCsv } from './logic'

const base = { inDelimiter: '', outDelimiter: ',', output: 'csv' as const, quoteAll: false, trim: true }
describe('csv-formatter', () => {
  it('normalizes and converts delimiters', () => {
    expect(formatCsv('a;b;c\n1;"x;y";3\n2;3', base).text).toBe('a,b,c\n1,x;y,3\n2,3,')
    expect(formatCsv('a,b\n1,2', { ...base, outDelimiter: '\t', quoteAll: true }).text).toBe('"a"\t"b"\n"1"\t"2"')
  })
  it('makes markdown and aligned tables', () => {
    expect(formatCsv('name,n\n中文,1', { ...base, output: 'markdown' }).text).toBe('| name | n   |\n| ---- | --- |\n| 中文 | 1   |')
    expect(formatCsv('a,bb\nccc,d', { ...base, output: 'aligned' })).toEqual({ text: 'a    bb\nccc  d', rows: 2, cols: 2 })
  })
  it('measures width', () => expect(displayWidth('a中')).toBe(3))
  it('errors on bad quotes', () => expect(() => formatCsv('a,"b\n1,2', base)).toThrow())
})
