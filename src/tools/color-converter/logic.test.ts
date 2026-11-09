import { describe, expect, it } from 'vitest'
import { contrastRatio, formatColor, parseColor } from './logic'

describe('color-converter', () => {
  it('parses many formats to the same color', () => {
    const want = { r: 255, g: 87, b: 51, a: 1 }
    expect(parseColor('#FF5733')).toEqual(want)
    expect(parseColor('rgb(255, 87, 51)')).toEqual(want)
    expect(parseColor('hsl(11 100% 60%)')).toEqual({ r: 255, g: 88, b: 51, a: 1 })
    expect(parseColor('#f00a')).toEqual({ r: 255, g: 0, b: 0, a: 0.667 })
    expect(parseColor('cmyk(0%, 66%, 80%, 0%)')).toEqual({ r: 255, g: 87, b: 51, a: 1 })
    expect(parseColor('hwb(0 0% 0%)')).toEqual({ r: 255, g: 0, b: 0, a: 1 })
    expect(parseColor('rgba(0,0,0,50%)')?.a).toBe(0.5)
    expect(parseColor('nope')).toBeNull()
  })
  it('formats', () => {
    const c = { r: 255, g: 87, b: 51, a: 1 }
    expect(formatColor(c, 'hex')).toBe('#ff5733')
    expect(formatColor(c, 'hsl')).toBe('hsl(11 100% 60%)')
    expect(formatColor(c, 'cmyk')).toBe('cmyk(0% 66% 80% 0%)')
    expect(formatColor({ r: 255, g: 255, b: 255, a: 1 }, 'oklch')).toBe('oklch(100% 0 0)')
    expect(formatColor({ ...c, a: 0.5 }, 'rgb')).toBe('rgb(255 87 51 / 50%)')
  })
  it('contrast', () => expect(contrastRatio({ r: 0, g: 0, b: 0, a: 1 }, { r: 255, g: 255, b: 255, a: 1 })).toBe(21))
})
