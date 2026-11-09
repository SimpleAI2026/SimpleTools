import { describe, expect, it } from 'vitest'
import { rotate } from './logic'

describe('rot13', () => {
  it('rot13 is an involution', () => {
    expect(rotate('Hello, World!')).toBe('Uryyb, Jbeyq!')
    expect(rotate(rotate('abcXYZ 中文'))).toBe('abcXYZ 中文')
  })
  it('custom shift and rot5 digits', () => {
    expect(rotate('abc', 1)).toBe('bcd')
    expect(rotate('abc', -1)).toBe('zab')
    expect(rotate('a1', 13, true)).toBe('n6')
  })
})
