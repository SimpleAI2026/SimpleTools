import { describe, expect, it } from 'vitest'
import { csvToRows } from './logic'

describe('csv-to-excel', () => {
  it('coerces body only', () => {
    expect(csvToRows('1,b\n2,007\n3.5,true', { delimiter: '', inferTypes: true, header: true })).toEqual([['1', 'b'], [2, '007'], [3.5, true]])
    expect(csvToRows('1;2', { delimiter: ';', inferTypes: false, header: false })).toEqual([['1', '2']])
  })
})
