import { describe, expect, it } from 'vitest'
import { generateNumbers, validateRng, type RngOptions } from './logic'

const base: RngOptions = { min: 1, max: 10, count: 5, unique: false, sort: 'none', decimals: 0 }
describe('random-number-generator', () => {
  it('generates in range', () => {
    const r = generateNumbers({ ...base, count: 200 })
    expect(r).toHaveLength(200)
    r.forEach((n) => expect(n >= 1 && n <= 10 && Number.isInteger(n)).toBe(true))
  })
  it('unique and sorted', () => {
    const r = generateNumbers({ ...base, count: 10, unique: true, sort: 'asc' })
    expect(r).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    const d = generateNumbers({ ...base, min: 1, max: 1000, count: 20, unique: true, sort: 'desc' })
    expect(new Set(d).size).toBe(20)
    expect([...d].sort((a, b) => b - a)).toEqual(d)
  })
  it('decimals', () => {
    const r = generateNumbers({ ...base, min: 0, max: 1, decimals: 2, count: 50 })
    r.forEach((n) => expect(Math.round(n * 100)).toBeCloseTo(n * 100))
  })
  it('validates', () => {
    expect(validateRng({ ...base, min: 5, max: 1 })).toBe('minGtMax')
    expect(validateRng({ ...base, count: 0 })).toBe('count')
    expect(validateRng({ ...base, unique: true, count: 11 })).toBe('notEnough')
    expect(validateRng({ ...base, max: 1e12 })).toBe('range')
    expect(() => generateNumbers({ ...base, min: NaN })).toThrow('invalid')
  })
})
