import { describe, expect, it } from 'vitest'
import { fitWithin, outputType, savings } from './logic'

describe('image-compressor', () => {
  it('fits without upscaling', () => {
    expect(fitWithin(4000, 3000, 1920, 0)).toEqual({ width: 1920, height: 1440 })
    expect(fitWithin(800, 600, 1920, 1080)).toEqual({ width: 800, height: 600 })
    expect(fitWithin(1000, 4000, 0, 1000)).toEqual({ width: 250, height: 1000 })
  })
  it('output type', () => {
    expect(outputType('image/jpeg', 'keep')).toBe('image/jpeg')
    expect(outputType('image/gif', 'keep')).toBe('image/webp')
    expect(outputType('image/png', 'image/jpeg')).toBe('image/jpeg')
  })
  it('savings', () => expect(savings(1000, 250)).toBe(75))
})
