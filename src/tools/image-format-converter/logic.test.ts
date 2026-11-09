import { describe, expect, it } from 'vitest'
import { isLossy, rasterSize, sizeChange } from './logic'

describe('image-format-converter', () => {
  it('helpers', () => {
    expect(isLossy('image/png')).toBe(false)
    expect(isLossy('image/webp')).toBe(true)
    expect(sizeChange(200, 50)).toBe(-75)
    expect(sizeChange(0, 5)).toBe(0)
    expect(rasterSize(0, 0, 512)).toEqual({ width: 512, height: 512 })
  })
})
