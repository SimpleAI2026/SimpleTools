import { describe, expect, it } from 'vitest'
import { buildWorkbook, cellText, coerce, readSpreadsheet, safeSheetName } from './excel'

describe('excel helpers', () => {
  it('cell text', () => {
    expect(cellText(null)).toBe('')
    expect(cellText(new Date(Date.UTC(2026, 0, 2)))).toBe('2026-01-02')
    expect(cellText({ richText: [{ text: 'a' }, { text: 'b' }] })).toBe('ab')
    expect(cellText({ formula: 'A1+1', result: 3 } as never)).toBe('3')
    expect(cellText({ text: 'site', hyperlink: 'https://x' })).toBe('site')
  })
  it('sheet names and coercion', () => {
    const used = new Set<string>()
    expect(safeSheetName('a/b', used)).toBe('a_b')
    expect(safeSheetName('A/B', used)).toBe('A_B_2')
    expect(safeSheetName('x'.repeat(40), used)).toHaveLength(31)
    expect(coerce('007')).toBe('007')
    expect(coerce('3.5')).toBe(3.5)
    expect(coerce('TRUE')).toBe(true)
  })
  it('round trips xlsx and reads csv', async () => {
    const bytes = await buildWorkbook([{ name: 'Data', header: true, rows: [['name', 'n'], ['中文', 2]] }, { name: 'Data', rows: [[1]] }])
    const sheets = await readSpreadsheet(bytes.buffer as ArrayBuffer, 'x.xlsx')
    expect(sheets).toEqual([{ name: 'Data', rows: [['name', 'n'], ['中文', '2']] }, { name: 'Data_2', rows: [['1']] }])
    const csv = await readSpreadsheet(new TextEncoder().encode('a,b\n1,2').buffer as ArrayBuffer, 'list.csv')
    expect(csv[0]).toEqual({ name: 'list', rows: [['a', 'b'], ['1', '2']] })
    await expect(readSpreadsheet(new ArrayBuffer(1), 'old.xls')).rejects.toThrow(/xlsx/)
  })
})
