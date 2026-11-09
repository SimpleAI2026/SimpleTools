import { describe, expect, it } from 'vitest'
import { filterRows, sheetStats } from './logic'

const rows = [['name', 'city'], ['Alice', 'Paris'], ['Bob', 'Berlin'], ['', 'Rome']]
describe('excel-viewer', () => {
  it('filters', () => {
    expect(filterRows(rows, 'ber')).toEqual([['name', 'city'], ['Bob', 'Berlin']])
    expect(filterRows(rows, '')).toBe(rows)
    expect(filterRows(rows, 'name', false)).toEqual([['name', 'city']])
  })
  it('stats', () => expect(sheetStats(rows)).toEqual({ rows: 4, cols: 2, filled: 7 }))
})
