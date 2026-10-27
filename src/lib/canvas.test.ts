import { describe, expect, it } from 'vitest'
import { withExt } from './canvas'

describe('canvas helpers', () => {
  it('replaces extensions', () => {
    expect(withExt('a.b.png', 'jpg')).toBe('a.b.jpg')
    expect(withExt('photo', 'webp', '-1')).toBe('photo-1.webp')
    expect(withExt('.png', 'png')).toBe('image.png')
  })
})
