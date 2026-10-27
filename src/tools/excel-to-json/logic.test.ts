import { describe, expect, it } from 'vitest'
import { sheetToJson, workbookToJson } from './logic'

const s = { name: 'S', rows: [['id', 'name', ''], ['1', 'Ann', 'x'], ['', '', ''], ['007', '', '']] }
describe('excel-to-json', () => {
  it('objects with header', () => {
    expect(sheetToJson(s, { header: true, inferTypes: true, skipEmpty: true })).toEqual([
      { id: 1, name: 'Ann', column3: 'x' },
      { id: '007', name: null, column3: null },
    ])
  })
  it('arrays', () => expect(sheetToJson({ name: 'a', rows: [['1']] }, { header: false, inferTypes: false, skipEmpty: false })).toEqual([['1']]))
  it('multi-sheet', () => {
    const o = { header: false, inferTypes: false, skipEmpty: false }
    expect(workbookToJson([{ name: 'A', rows: [['x']] }, { name: 'B', rows: [] }], o, 0)).toBe('{"A":[["x"]],"B":[]}')
  })
})
