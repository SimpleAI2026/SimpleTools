import { describe, expect, it } from 'vitest'
import { groupDigits, parseBase, toBase, twosComplement } from './logic'

describe('number-base', () => {
  it('parses with prefixes', () => {
    expect(parseBase('0xFF', 16)).toBe(255n)
    expect(parseBase('1010_1010', 2)).toBe(170n)
    expect(parseBase('-z', 36)).toBe(-35n)
    expect(parseBase('123456789012345678901234567890', 10).toString(16)).toBe('18ee90ff6c373e0ee4e3f0ad2')
    expect(() => parseBase('12', 2)).toThrow(/Invalid digit/)
  })
  it('formats', () => {
    expect(toBase(255n, 2)).toBe('11111111')
    expect(groupDigits('1111111111', 4)).toBe('11 1111 1111')
    expect(twosComplement(-1n, 8)).toBe('11111111')
    expect(twosComplement(5n, 8)).toBe('00000101')
  })
})
