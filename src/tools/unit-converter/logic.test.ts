import { describe, expect, it } from 'vitest'
import { convertUnit, formatNumber, unitsOf } from './logic'

describe('unit-converter', () => {
  it('linear units', () => {
    expect(formatNumber(convertUnit(1, 'mi', 'km', 'length'))).toBe('1.609344')
    expect(formatNumber(convertUnit(1, 'kg', 'lb', 'mass'))).toBe('2.204622622')
    expect(convertUnit(1, 'GiB', 'MiB', 'data')).toBe(1024)
    expect(formatNumber(convertUnit(1, '斤', 'g', 'mass'))).toBe('500')
  })
  it('temperature', () => {
    expect(convertUnit(100, '°C', '°F', 'temperature')).toBe(212)
    expect(formatNumber(convertUnit(0, 'K', '°C', 'temperature'))).toBe('-273.15')
    expect(formatNumber(convertUnit(32, '°F', 'K', 'temperature'))).toBe('273.15')
  })
  it('formatting', () => {
    expect(formatNumber(0.1 + 0.2)).toBe('0.3')
    expect(formatNumber(1.602176634e-19)).toBe('1.602177e-19')
    expect(unitsOf('temperature')).toContain('K')
    expect(() => convertUnit(1, 'x', 'm', 'length')).toThrow()
  })
})
