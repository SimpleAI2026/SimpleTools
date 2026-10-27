import { describe, expect, it } from 'vitest'
import { jsonToYaml, yamlToJson } from './logic'

describe('json-yaml', () => {
  it('json → yaml', () => {
    expect(jsonToYaml('{"a":1,"b":[true,"x"],"c":{"d":null}}')).toBe('a: 1\nb:\n  - true\n  - x\nc:\n  d: null\n')
  })
  it('yaml → json', () => {
    expect(yamlToJson('a: 1\nlist:\n  - x\n', 0)).toBe('{"a":1,"list":["x"]}')
    expect(yamlToJson('a: 1\n---\nb: 2', 0)).toBe('[{"a":1},{"b":2}]')
  })
  it('errors', () => expect(() => yamlToJson('a: [1')).toThrow())
})
