import { describe, expect, it } from 'vitest'
import { convertCssUnit, DEFAULT_CONTEXT as C, fmt } from './logic'

describe('css-unit-converter', () => {
  it('converts', () => {
    expect(convertCssUnit(24, 'px', 'rem', C)).toBe(1.5)
    expect(convertCssUnit(1, 'in', 'cm', C)).toBeCloseTo(2.54)
    expect(convertCssUnit(12, 'pt', 'px', C)).toBe(16)
    expect(convertCssUnit(50, 'vw', 'px', C)).toBe(720)
    expect(convertCssUnit(10, '%', 'px', { ...C, percentBase: 500 })).toBe(50)
    expect(fmt(1 / 3)).toBe('0.3333')
  })
})
