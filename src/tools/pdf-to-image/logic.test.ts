import { describe, expect, it } from 'vitest'
import { clampScale, dpiScale, imageFileName } from './logic'

describe('pdf-to-image', () => {
  it('helpers', () => {
    expect(dpiScale(144)).toBe(2)
    expect(imageFileName('doc', 3, 120, 'png')).toBe('doc-p003.png')
    expect(clampScale(612, 792, 2)).toBe(2)
    expect(clampScale(10000, 100, 10)).toBeCloseTo(1.6384)
  })
})
