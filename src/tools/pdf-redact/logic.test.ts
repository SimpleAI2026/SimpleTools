import { describe, expect, it } from 'vitest'
import { rectFromDrag } from './logic'

describe('pdf-redact', () => {
  it('normalises drag rects', () => {
    expect(rectFromDrag(2, { x: 50, y: 40 }, { x: 10, y: 60 })).toEqual({ page: 2, x: 10, y: 40, w: 40, h: 20 })
    expect(rectFromDrag(1, { x: 1, y: 1 }, { x: 2, y: 9 })).toBeNull()
  })
})
