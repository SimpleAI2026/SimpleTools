import { describe, expect, it } from 'vitest'
import { applyColorFilters, boxBlur, cssFilter, IDENTITY_FILTERS, isIdentity } from './logic'

const px = (...v: number[]) => new Uint8ClampedArray(v)
describe('image-filters', () => {
  it('identity leaves pixels', () => {
    const d = px(10, 20, 30, 255)
    applyColorFilters(d, IDENTITY_FILTERS)
    expect([...d]).toEqual([10, 20, 30, 255])
    expect(isIdentity(IDENTITY_FILTERS)).toBe(true)
  })
  it('invert, grayscale, brightness', () => {
    const d = px(0, 128, 255, 200)
    applyColorFilters(d, { ...IDENTITY_FILTERS, invert: 1 })
    expect([...d]).toEqual([255, 127, 0, 200])
    const g = px(255, 0, 0, 255)
    applyColorFilters(g, { ...IDENTITY_FILTERS, grayscale: 1 })
    expect(g[0]).toBe(g[1])
    expect(g[1]).toBe(g[2])
    const b = px(100, 100, 100, 255)
    applyColorFilters(b, { ...IDENTITY_FILTERS, brightness: 2, contrast: 1 })
    expect(b[0]).toBe(200)
  })
  it('blur spreads values', () => {
    const d = new Uint8ClampedArray(3 * 1 * 4)
    d[4] = 255
    boxBlur(d, 3, 1, 1, 1)
    expect(d[0]).toBe(85)
    expect(d[4]).toBe(85)
  })
  it('css string', () => expect(cssFilter({ ...IDENTITY_FILTERS, sepia: 0.5, blur: 2 })).toBe('sepia(0.5) blur(2px)'))
})
