import { describe, expect, it } from 'vitest'
import { fitWidth } from './fitWidth'

describe('fitWidth', () => {
  it('caps prop width to container', () => {
    expect(fitWidth(680, 390)).toBe(390)
    expect(fitWidth(680, 900)).toBe(680)
    expect(fitWidth(720, 0)).toBe(1)
  })
})
