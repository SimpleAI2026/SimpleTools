import { describe, expect, it } from 'vitest'
import { mergeSheets } from './logic'

const a = { file: 'a', sheets: [{ name: 'S1', rows: [['h1', 'h2'], ['1', '2']] }] }
const b = { file: 'b', sheets: [{ name: 'X', rows: [['h1', 'h2'], ['3', '4']] }, { name: 'Y', rows: [] }] }
describe('excel-merge', () => {
  it('as sheets', () => {
    expect(mergeSheets([a, b], 'sheets', true, false).map((s) => s.name)).toEqual(['a', 'b - X', 'b - Y'])
  })
  it('stacked with one header and source column', () => {
    expect(mergeSheets([a, b], 'stack', true, true)[0]!.rows).toEqual([['source', 'h1', 'h2'], ['a', '1', '2'], ['b/X', '3', '4']])
    expect(mergeSheets([a, b], 'stack', false, false)[0]!.rows).toHaveLength(4)
  })
})
