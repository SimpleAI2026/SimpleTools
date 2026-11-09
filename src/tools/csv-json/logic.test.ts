import { describe, expect, it } from 'vitest'
import { csvToJson, flatten, jsonToCsv } from './logic'

describe('csv-json', () => {
  it('csv → json', () => {
    expect(csvToJson('a,b,c\n1,x,true\n2.5,,false', { header: true, inferTypes: true, indent: 0 })).toBe('[{"a":1,"b":"x","c":true},{"a":2.5,"b":null,"c":false}]')
    expect(csvToJson('007,x', { header: false, inferTypes: true, indent: 0 })).toBe('[["007","x"]]')
  })
  it('json → csv flattens', () => {
    expect(flatten({ a: { b: 1, c: { d: 2 } }, e: [1] })).toEqual({ 'a.b': 1, 'a.c.d': 2, e: [1] })
    expect(jsonToCsv('[{"n":"a,b","o":{"x":1}},{"n":"c","z":null}]')).toBe('n,o.x,z\n"a,b",1,\nc,,')
    expect(jsonToCsv('[[1,2],[3,4]]', ';')).toBe('1;2\n3;4')
  })
  it('throws on invalid json', () => expect(() => jsonToCsv('{')).toThrow())
})
