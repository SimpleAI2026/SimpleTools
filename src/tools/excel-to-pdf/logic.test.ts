import { describe, expect, it } from 'vitest'
import { fitText, layoutTable } from './logic'

const measure = (s: string, fs: number) => s.length * fs * 0.5
const o = { width: 500, height: 100, fontSize: 10, padding: 4, maxColWidth: 200, repeatHeader: true }
describe('excel-to-pdf', () => {
  it('scales wide tables', () => {
    const l = layoutTable([['x'.repeat(100), 'y'.repeat(100), 'z'.repeat(100)]], measure, o)
    expect(l.scale).toBeCloseTo(500 / 600)
    expect(l.colWidths.reduce((a, b) => a + b)).toBeCloseTo(500)
  })
  it('paginates with repeated header', () => {
    const rows = Array.from({ length: 12 }, (_, i) => [`r${i}`])
    const l = layoutTable(rows, measure, o) // rowHeight 18 → 5 per page
    expect(l.pages[0]).toEqual([0, 1, 2, 3, 4])
    expect(l.pages[1]).toEqual([0, 5, 6, 7, 8])
    expect(l.pages.flat().filter((i) => i !== 0)).toHaveLength(11)
  })
  it('fits text', () => {
    const m = (s: string) => s.length
    expect(fitText('hello world', 6, m)).toBe('hello…')
    expect(fitText('hi', 6, m)).toBe('hi')
  })
})
