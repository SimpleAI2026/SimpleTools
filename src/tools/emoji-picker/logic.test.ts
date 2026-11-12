import { describe, expect, it } from 'vitest'
import { codePoints, searchEmoji } from './logic'

const entries = [
  { emoji: '😀', name: 'grinning face', group: 'Smileys & Emotion' },
  { emoji: '🚀', name: 'rocket', group: 'Travel & Places' },
]

describe('emoji picker', () => {
  it('searches names and prints code points', () => {
    expect(searchEmoji(entries, 'rocket')).toEqual([entries[1]])
    expect(searchEmoji(entries, '').length).toBe(2)
    expect(codePoints('A')).toBe('U+41')
  })
})
