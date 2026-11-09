import { describe, expect, it } from 'vitest'
import { clampScale, pageLabel, parsePageList } from './logic'

describe('pdfium-preview logic', () => {
  it('clamps scale and parses ranges', () => {
    expect(clampScale(0.1)).toBe(0.25)
    expect(clampScale(9)).toBe(8)
    expect(pageLabel(2, 10)).toBe('2 / 10')
    expect(parsePageList('1-3,5', 10)).toEqual([0, 1, 2, 4])
    expect(parsePageList('', 3)).toEqual([0, 1, 2])
  })
})
