import { describe, expect, it } from 'vitest'
import { describeChars, escapeUnicode, unescapeUnicode } from './logic'

describe('utf8-converter', () => {
  it('describes characters', () => {
    const [a, zh, emoji] = describeChars('a中😀')
    expect(a).toMatchObject({ codePoint: 'U+0061', utf8: '61' })
    expect(zh).toMatchObject({ codePoint: 'U+4E2D', utf8: 'E4 B8 AD', utf16: '4E2D', html: '&#x4E2D;' })
    expect(emoji).toMatchObject({ codePoint: 'U+1F600', utf8: 'F0 9F 98 80', utf16: 'D83D DE00', escape: '\\u{1F600}' })
  })
  it('escapes and unescapes', () => {
    expect(escapeUnicode('a中😀')).toBe('a\\u4E2D\\u{1F600}')
    expect(escapeUnicode('a', true)).toBe('\\u0061')
    expect(unescapeUnicode('a\\u4E2D\\u{1F600} U+0041 &#x42; &#67; \\x44')).toBe('a中😀 A B C D')
    expect(unescapeUnicode('\\ud83d\\ude00')).toBe('😀')
  })
})
