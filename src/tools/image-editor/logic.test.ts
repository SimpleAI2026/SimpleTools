import { describe, expect, it } from 'vitest'
import { aspectCrop, clampCrop, outputSize, rotate } from './logic'

describe('image-editor', () => {
  it('clamps crop', () => {
    expect(clampCrop({ x: -5, y: 10, w: 500, h: 0 }, 100, 50)).toEqual({ x: 0, y: 10, w: 100, h: 1 })
  })
  it('aspect crop', () => {
    expect(aspectCrop(400, 300, 1)).toEqual({ x: 50, y: 0, w: 300, h: 300 })
    expect(aspectCrop(400, 300, 16 / 9)).toEqual({ x: 0, y: 37, w: 400, h: 225 })
    expect(aspectCrop(400, 300, null)).toEqual({ x: 0, y: 0, w: 400, h: 300 })
  })
  it('rotation size', () => {
    const s = { crop: { x: 0, y: 0, w: 40, h: 10 }, rotation: 90 as const, flipH: false, flipV: false }
    expect(outputSize(s)).toEqual({ width: 10, height: 40 })
    expect(rotate(0, -1)).toBe(270)
    expect(rotate(270, 1)).toBe(0)
  })
})
