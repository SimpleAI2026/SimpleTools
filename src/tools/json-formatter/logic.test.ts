import { describe, expect, it } from 'vitest'
import { formatJson, minifyJson, offsetToLineColumn } from './logic'

describe('json-formatter', () => {
  it('formats with indent', () => {
    expect(formatJson('{"a":1,"b":[1,2]}')).toEqual({ ok: true, output: '{\n  "a": 1,\n  "b": [\n    1,\n    2\n  ]\n}' })
  })
  it('supports tab and 4 spaces', () => {
    const r = formatJson('{"a":1}', 'tab')
    expect(r.ok && r.output).toBe('{\n\t"a": 1\n}')
    const r4 = formatJson('{"a":1}', 4)
    expect(r4.ok && r4.output).toBe('{\n    "a": 1\n}')
  })
  it('sorts keys deeply', () => {
    const r = formatJson('{"b":1,"a":{"d":1,"c":2}}', 0, true)
    expect(r.ok && r.output).toBe('{"a":{"c":2,"d":1},"b":1}')
  })
  it('minifies', () => {
    expect(minifyJson('{ "a" : [ 1 , 2 ] }')).toEqual({ ok: true, output: '{"a":[1,2]}' })
  })
  it('reports errors with a position', () => {
    const r = formatJson('{\n  "a": 1,\n}')
    expect(r.ok).toBe(false)
    if (!r.ok) {
      expect(r.message.length).toBeGreaterThan(0)
      expect(r.line).toBeGreaterThanOrEqual(2)
    }
  })
  it('rejects empty input', () => {
    expect(formatJson('   ')).toEqual({ ok: false, message: 'empty' })
  })
  it('maps offsets to line/column', () => {
    expect(offsetToLineColumn('ab\ncd', 4)).toEqual({ line: 2, column: 2 })
  })
})
