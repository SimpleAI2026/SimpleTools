import { describe, expect, it } from 'vitest'
import { collectWordBoxes, formatBlocks, isOcrLang, parseRoi } from './logic'

describe('image-ocr logic', () => {
  it('validates langs and roi', () => {
    expect(isOcrLang('eng')).toBe(true)
    expect(isOcrLang('eng+chi_sim')).toBe(true)
    expect(isOcrLang('jpn')).toBe(false)
    expect(parseRoi(0, 0, 0, 10)).toBeUndefined()
    expect(parseRoi(1, 2, 3, 4)).toEqual({ left: 1, top: 2, width: 3, height: 4 })
  })
  it('collects words and formats blocks', () => {
    expect(collectWordBoxes({ words: [{ text: 'a', confidence: 90, bbox: { x0: 0, y0: 0, x1: 1, y1: 1 } }] })).toHaveLength(1)
    expect(formatBlocks({ blocks: [{ text: 'hi', confidence: 88.2 }] })).toContain('conf=88')
  })
})
