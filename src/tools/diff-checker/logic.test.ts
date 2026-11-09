import { describe, expect, it } from 'vitest'
import { computeDiff, diffStats, toUnified } from './logic'

describe('diff-checker', () => {
  it('line diff', () => {
    const parts = computeDiff('a\nb\nc\n', 'a\nB\nc\nd\n')
    expect(diffStats(parts, 'lines')).toEqual({ added: 2, removed: 1 })
    expect(toUnified(parts)).toBe('  a\n- b\n+ B\n  c\n+ d')
  })
  it('options', () => {
    expect(computeDiff('Hello', 'hello', 'lines', { ignoreCase: true }).every((p) => p.type === 'same')).toBe(true)
    expect(computeDiff('a  b ', 'a b', 'lines', { ignoreWhitespace: true }).every((p) => p.type === 'same')).toBe(true)
  })
  it('word and char modes', () => {
    const w = computeDiff('the quick fox', 'the slow fox', 'words')
    expect(w.filter((p) => p.type === 'removed').map((p) => p.value)).toEqual(['quick'])
    expect(diffStats(computeDiff('abc', 'abd', 'chars'), 'chars')).toEqual({ added: 1, removed: 1 })
  })
})
