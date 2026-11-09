import { describe, expect, it } from 'vitest'
import { pushRecent, sanitizeSlugs, toggleItem } from './list-utils'

describe('list utils', () => {
  it('pushRecent dedupes and caps', () => {
    expect(pushRecent(['a', 'b', 'c'], 'b')).toEqual(['b', 'a', 'c'])
    expect(pushRecent(['a', 'b'], 'c', 2)).toEqual(['c', 'a'])
  })
  it('toggleItem', () => {
    expect(toggleItem(['a'], 'b')).toEqual(['b', 'a'])
    expect(toggleItem(['a', 'b'], 'a')).toEqual(['b'])
  })
  it('sanitizeSlugs', () => {
    const known = new Set(['a', 'b'])
    expect(sanitizeSlugs(['a', 'x', 1, 'a', 'b'], known)).toEqual(['a', 'b'])
    expect(sanitizeSlugs('nope', known)).toEqual([])
  })
})
