import { describe, expect, it } from 'vitest'
import { CHARSETS, cryptoRandomInt, entropyBits, generatePassword, strengthOf, type PasswordOptions } from './logic'

const base: PasswordOptions = { length: 16, lower: true, upper: true, digits: true, symbols: false, excludeSimilar: false }

describe('password-generator', () => {
  it('respects length and includes each selected set', () => {
    for (let i = 0; i < 50; i++) {
      const p = generatePassword(base)
      expect(p).toHaveLength(16)
      expect(p).toMatch(/[a-z]/)
      expect(p).toMatch(/[A-Z]/)
      expect(p).toMatch(/[0-9]/)
      expect(p).not.toMatch(/[^a-zA-Z0-9]/)
    }
  })
  it('symbols only', () => {
    const p = generatePassword({ ...base, lower: false, upper: false, digits: false, symbols: true })
    for (const c of p) expect(CHARSETS.symbols).toContain(c)
  })
  it('excludes similar characters', () => {
    for (let i = 0; i < 30; i++) expect(generatePassword({ ...base, length: 64, excludeSimilar: true })).not.toMatch(/[il1Lo0O]/)
  })
  it('throws when no charset selected', () => {
    expect(() => generatePassword({ ...base, lower: false, upper: false, digits: false })).toThrow('no-charset')
  })
  it('length is at least number of sets', () => {
    expect(generatePassword({ ...base, length: 1 })).toHaveLength(3)
  })
  it('random int stays in range', () => {
    for (let i = 0; i < 200; i++) {
      const v = cryptoRandomInt(7)
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(7)
    }
    expect(() => cryptoRandomInt(0)).toThrow()
  })
  it('entropy and strength', () => {
    expect(entropyBits(base)).toBe(Math.round(16 * Math.log2(62)))
    expect(strengthOf(30)).toBe('weak')
    expect(strengthOf(50)).toBe('fair')
    expect(strengthOf(80)).toBe('strong')
    expect(strengthOf(120)).toBe('veryStrong')
  })
})
