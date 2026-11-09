import { describe, expect, it } from 'vitest'
import { defaultFormat, extensionFor, fitAspect, MAX_DIMENSION, outputFilename, scaleByPercent } from './logic'

describe('image-resizer', () => {
  const orig = { width: 1920, height: 1080 }
  it('keeps aspect ratio', () => {
    expect(fitAspect(orig, 'width', 960)).toEqual({ width: 960, height: 540 })
    expect(fitAspect(orig, 'height', 720)).toEqual({ width: 1280, height: 720 })
  })
  it('clamps dimensions', () => {
    expect(fitAspect(orig, 'width', 0)).toEqual({ width: 1, height: 1 })
    expect(fitAspect(orig, 'width', 99999).width).toBe(MAX_DIMENSION)
  })
  it('scales by percent', () => {
    expect(scaleByPercent(orig, 50)).toEqual({ width: 960, height: 540 })
    expect(scaleByPercent({ width: 3, height: 3 }, 10)).toEqual({ width: 1, height: 1 })
  })
  it('formats and filenames', () => {
    expect(extensionFor('image/jpeg')).toBe('jpg')
    expect(defaultFormat('image/webp')).toBe('image/webp')
    expect(defaultFormat('image/gif')).toBe('image/png')
    expect(outputFilename('photo.final.JPG', { width: 10, height: 20 }, 'image/png')).toBe('photo.final-10x20.png')
    expect(outputFilename('', { width: 1, height: 1 }, 'image/webp')).toBe('image-1x1.webp')
  })
})
