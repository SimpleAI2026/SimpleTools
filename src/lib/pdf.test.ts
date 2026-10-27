import { describe, expect, it } from 'vitest'
import { joinTextItems, parsePageRanges } from './pdf'

describe('pdf helpers', () => {
  it('parses page ranges', () => {
    expect(parsePageRanges('', 3)).toEqual([1, 2, 3])
    expect(parsePageRanges('1-2, 5，3', 5)).toEqual([1, 2, 3, 5])
    expect(parsePageRanges('4-', 6)).toEqual([4, 5, 6])
    expect(() => parsePageRanges('9', 3)).toThrow(/out of range/)
    expect(() => parsePageRanges('3-1', 3)).toThrow()
    expect(() => parsePageRanges('a', 3)).toThrow()
  })
  it('joins text items', () => {
    const it = (str: string, y: number, hasEOL = false) => ({ str, transform: [1, 0, 0, 1, 0, y], width: 1, height: 10, hasEOL })
    expect(joinTextItems([it('Hello ', 700), it('world', 700), it('Next', 680)])).toBe('Hello world\nNext')
    expect(joinTextItems([it('a', 1, true), it('b', 1)])).toBe('a\nb')
  })
})
