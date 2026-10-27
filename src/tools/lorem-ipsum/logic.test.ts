import { describe, expect, it } from 'vitest'
import { generateLorem } from './logic'

describe('lorem-ipsum', () => {
  it('words count exact', () => {
    expect(generateLorem('words', 10).split(' ')).toHaveLength(10)
    expect(generateLorem('words', 3)).toBe('Lorem ipsum dolor')
    expect(generateLorem('words', 5, 'chinese')).toHaveLength(5)
  })
  it('paragraphs and sentences', () => {
    expect(generateLorem('paragraphs', 3).split('\n\n')).toHaveLength(3)
    const s = generateLorem('sentences', 4, 'latin', false)
    expect(s.match(/\./g)).toHaveLength(4)
    expect(generateLorem('sentences', 2, 'chinese').match(/。/g)).toHaveLength(2)
    expect(generateLorem('paragraphs', 1).startsWith('Lorem ipsum dolor sit amet, ')).toBe(true)
  })
  it('clamps count', () => {
    expect(generateLorem('words', 0, 'latin', false).split(' ')).toHaveLength(1)
  })
})
