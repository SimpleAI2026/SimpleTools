import { describe, expect, it } from 'vitest'
import { childPath, jsonStats, searchJson, typeOf } from './logic'

describe('json-viewer', () => {
  it('types and paths', () => {
    expect([null, [], {}, 's', 1, true].map(typeOf)).toEqual(['null', 'array', 'object', 'string', 'number', 'boolean'])
    expect(childPath('$', 'a')).toBe('$.a')
    expect(childPath('$', 'a b')).toBe('$["a b"]')
    expect(childPath('$.a', 2)).toBe('$.a[2]')
  })
  it('stats', () => {
    expect(jsonStats({ a: [1, { b: null }], c: 'x' })).toEqual({ objects: 2, arrays: 1, values: 3, maxDepth: 3 })
    expect(jsonStats(5)).toEqual({ objects: 0, arrays: 0, values: 1, maxDepth: 0 })
  })
  it('search', () => {
    expect(searchJson({ name: 'Vue', tags: ['ui', 'vue'], x: { y: 1 } }, 'vue')).toEqual(['$.name', '$.tags[1]'])
    expect(searchJson({ name: 1 }, 'NAM')).toEqual(['$.name'])
    expect(searchJson({ a: 1 }, '')).toEqual([])
  })
})
