import { describe, expect, it } from 'vitest'
import { borderRadiusCss, shorthand, type RadiusState } from './logic'

const all = (n: number) => ({ topLeft: n, topRight: n, bottomRight: n, bottomLeft: n })
describe('border-radius-generator', () => {
  it('shorthand', () => {
    expect(shorthand(['1', '1', '1', '1'])).toBe('1')
    expect(shorthand(['1', '2', '1', '2'])).toBe('1 2')
    expect(shorthand(['1', '2', '3', '2'])).toBe('1 2 3')
    expect(shorthand(['1', '2', '3', '4'])).toBe('1 2 3 4')
  })
  it('css', () => {
    const s: RadiusState = { h: all(8), v: all(8), elliptical: false, unit: 'px' }
    expect(borderRadiusCss(s)).toBe('border-radius: 8px;')
    expect(borderRadiusCss({ ...s, h: { ...all(0), topLeft: 50 }, unit: '%' })).toBe('border-radius: 50% 0 0;')
    expect(borderRadiusCss({ ...s, elliptical: true, v: all(4) })).toBe('border-radius: 8px / 4px;')
  })
})
