import { describe, expect, it } from 'vitest'
import { pixelDiff, textDiff } from './logic'

describe('pdf-compare', () => {
  it('text diff', () => {
    const r = textDiff('the quick fox', 'the slow fox', 'words')
    expect(r.parts.filter((p) => p.removed).map((p) => p.value)).toEqual(['quick'])
    expect(r.added).toBe(1)
    expect(textDiff('a\nb\n', 'a\nb\n', 'lines').identical).toBe(true)
  })
  it('pixel diff', () => {
    const a = new Uint8ClampedArray([0, 0, 0, 255, 255, 255, 255, 255])
    const b = new Uint8ClampedArray([10, 0, 0, 255, 0, 0, 0, 255])
    const r = pixelDiff(a, b)
    expect(r.changed).toBe(1)
    expect(r.ratio).toBe(0.5)
    expect([...r.out.slice(4, 8)]).toEqual([230, 30, 30, 255])
  })
})
