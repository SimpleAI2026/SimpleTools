import { describe, expect, it } from 'vitest'
import { csvFileName, sheetToCsv } from './logic'

describe('excel-to-csv', () => {
  it('pads ragged rows and quotes', () => {
    expect(sheetToCsv({ name: 's', rows: [['a', 'b'], ['x,y']] }, { delimiter: ',', bom: false })).toBe('a,b\n"x,y",')
    expect(sheetToCsv({ name: 's', rows: [['a']] }, { delimiter: ',', bom: true })).toBe('\uFEFFa')
  })
  it('names', () => {
    expect(csvFileName('book', 'Q1/Q2', ',', true)).toBe('book-Q1_Q2.csv')
    expect(csvFileName('book', 'S', '\t', false)).toBe('book.tsv')
  })
})
