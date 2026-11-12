import { describe, expect, it } from 'vitest'
import { diffJson, formatDiff, parseJsonSide } from './logic'

describe('json-diff', () => {
  it('reports added, removed and changed values by path', () => {
    const changes = diffJson({ a: 1, b: { x: true }, list: [1, 2] }, { a: 2, c: 'z', list: [1, 3, 4] })
    expect(changes.map((change) => `${change.kind} ${change.path}`)).toEqual([
      'changed $.a',
      'removed $.b',
      'changed $.list[1]',
      'added $.list[2]',
      'added $.c',
    ])
    expect(formatDiff(changes)).toContain('~ $.a: 1 => 2')
    expect(formatDiff(changes)).toContain('+ $.c: "z"')
    expect(formatDiff(changes)).toContain('- $.b:')
  })

  it('treats equal trees as empty and rejects blank input', () => {
    expect(diffJson({ a: [1, { b: null }] }, { a: [1, { b: null }] })).toEqual([])
    expect(parseJsonSide('')).toEqual({ ok: false, message: 'empty' })
    expect(parseJsonSide('{')).toMatchObject({ ok: false })
    expect(parseJsonSide('[1,2]')).toEqual({ ok: true, value: [1, 2] })
  })

  it('stops at the change limit', () => {
    const left = Object.fromEntries(Array.from({ length: 20 }, (_, i) => [`k${i}`, i]))
    const right = Object.fromEntries(Array.from({ length: 20 }, (_, i) => [`k${i}`, i + 1]))
    expect(diffJson(left, right, '$', [], 3)).toHaveLength(3)
  })
})
