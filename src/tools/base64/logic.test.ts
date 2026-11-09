import { describe, expect, it } from 'vitest'
import { decodeBase64, encodeBase64 } from './logic'

describe('base64', () => {
  it('encodes ASCII and UTF-8', () => {
    expect(encodeBase64('hello')).toBe('aGVsbG8=')
    expect(encodeBase64('你好')).toBe('5L2g5aW9')
  })
  it('url-safe variant strips padding and swaps chars', () => {
    expect(encodeBase64('??>>', true)).toBe('Pz8-Pg')
    expect(encodeBase64('??>>')).toBe('Pz8+Pg==')
  })
  it('decodes standard, url-safe and unpadded', () => {
    expect(decodeBase64('aGVsbG8=')).toBe('hello')
    expect(decodeBase64('Pz8-Pg')).toBe('??>>')
    expect(decodeBase64('5L2g\n5aW9')).toBe('你好')
  })
  it('round-trips', () => {
    const s = 'Emoji 😀 and 中文'
    expect(decodeBase64(encodeBase64(s))).toBe(s)
    expect(decodeBase64(encodeBase64(s, true))).toBe(s)
  })
  it('throws on invalid input', () => {
    expect(() => decodeBase64('abc$')).toThrow()
    expect(() => decodeBase64('a')).toThrow()
    expect(() => decodeBase64('/w==')).toThrow()
  })
})
