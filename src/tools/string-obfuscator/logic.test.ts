import { describe, expect, it } from 'vitest'
import { obfuscateLines } from './logic'

describe('string-obfuscator', () => {
  it('hides the middle and keeps graphemes', () => {
    expect(obfuscateLines('secret', { keepStart: 1, keepEnd: 1, mask: '*' })).toBe('s****t')
    expect(obfuscateLines('你好世界', { keepStart: 1, keepEnd: 1, mask: '•' })).toBe('你••界')
    expect(obfuscateLines('ab', { keepStart: 2, keepEnd: 2, mask: '*' })).toBe('ab')
    expect(obfuscateLines('a\nbb', { keepStart: 0, keepEnd: 0, mask: '#' })).toBe('#\n##')
  })
})
