import { describe, expect, it } from 'vitest'
import { decodeUrl, encodeUrl } from './logic'

describe('url-encoder', () => {
  it('encodes components', () => {
    expect(encodeUrl('a b&c=d/中')).toBe('a%20b%26c%3Dd%2F%E4%B8%AD')
  })
  it('encodes full URIs keeping reserved chars', () => {
    expect(encodeUrl('https://x.com/a b?q=中', 'uri')).toBe('https://x.com/a%20b?q=%E4%B8%AD')
  })
  it('decodes, optionally treating + as space', () => {
    expect(decodeUrl('a%20b%26c')).toBe('a b&c')
    expect(decodeUrl('a+b')).toBe('a+b')
    expect(decodeUrl('a+b', 'component', true)).toBe('a b')
    expect(decodeUrl('%E4%B8%AD%2F', 'uri')).toBe('中%2F')
  })
  it('throws on malformed input', () => {
    expect(() => decodeUrl('%E4%B8')).toThrow()
  })
})
