import { describe, expect, it } from 'vitest'
import { convertRoman, fromRoman, toRoman } from './logic'

describe('roman-numerals', () => {
  it('to roman', () => {
    expect(toRoman(1994)).toBe('MCMXCIV')
    expect(toRoman(3999)).toBe('MMMCMXCIX')
    expect(() => toRoman(0)).toThrow()
  })
  it('from roman', () => {
    expect(fromRoman('mmxxvi')).toBe(2026)
    expect(() => fromRoman('IIII')).toThrow()
    expect(() => fromRoman('')).toThrow()
  })
  it('round trip', () => {
    for (let i = 1; i < 4000; i++) expect(fromRoman(toRoman(i))).toBe(i)
    expect(convertRoman('2026')).toBe('MMXXVI')
    expect(convertRoman('XL')).toBe('40')
  })
})
