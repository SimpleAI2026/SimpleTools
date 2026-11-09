import { describe, expect, it } from 'vitest'
import { countText } from './logic'

describe('word-counter', () => {
  it('handles empty', () => {
    expect(countText('')).toEqual({
      characters: 0,
      charactersNoSpaces: 0,
      words: 0,
      cjkCharacters: 0,
      sentences: 0,
      paragraphs: 0,
      lines: 0,
      readingMinutes: 0,
    })
  })
  it('counts English', () => {
    const s = countText("Hello world. It's a well-known test!\n\nSecond paragraph here.")
    expect(s.words).toBe(9)
    expect(s.sentences).toBe(3)
    expect(s.paragraphs).toBe(2)
    expect(s.lines).toBe(3)
    expect(s.readingMinutes).toBe(1)
  })
  it('counts CJK characters as words', () => {
    const s = countText('你好，世界。Hello 世界！')
    expect(s.cjkCharacters).toBe(6)
    expect(s.words).toBe(7)
    expect(s.sentences).toBe(2)
  })
  it('counts characters by code point', () => {
    const s = countText('a 😀 b')
    expect(s.characters).toBe(5)
    expect(s.charactersNoSpaces).toBe(3)
  })
})
