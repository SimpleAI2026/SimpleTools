import { describe, expect, it } from 'vitest'
import { gridTiles, sizeTiles, tileName } from './logic'

describe('image-splitter', () => {
  it('grid covers image', () => {
    const t = gridTiles(10, 7, 2, 3)
    expect(t).toHaveLength(6)
    expect(t.reduce((s, x) => s + x.w * x.h, 0)).toBe(70)
    expect(t[5]).toMatchObject({ row: 1, col: 2, x: 7, w: 3 })
  })
  it('fixed tiles', () => {
    const t = sizeTiles(10, 5, 4, 5)
    expect(t.map((x) => x.w)).toEqual([4, 4, 2])
  })
  it('names', () => expect(tileName('img', { row: 0, col: 1, x: 0, y: 0, w: 1, h: 1 }, 'png')).toBe('img_r1_c2.png'))
})
