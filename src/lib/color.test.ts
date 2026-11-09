import { describe, expect, it } from 'vitest'
import { colorWithAlpha, hexToRgba } from './color'

describe('color', () => {
  it('parses hex', () => {
    expect(hexToRgba('#f80')).toEqual({ r: 255, g: 136, b: 0, a: 1 })
    expect(hexToRgba('00000080').a).toBe(0.502)
    expect(() => hexToRgba('#zz')).toThrow()
  })
  it('formats alpha', () => {
    expect(colorWithAlpha('#FF0000', 1)).toBe('#ff0000')
    expect(colorWithAlpha('#000000', 0.25)).toBe('rgb(0 0 0 / 25%)')
  })
})
