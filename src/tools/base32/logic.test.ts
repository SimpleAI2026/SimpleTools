import { describe, expect, it } from 'vitest'
import { decodeBase32, encodeBase32 } from './logic'

describe('base32', () => {
  it('RFC 4648 vectors', () => {
    expect(encodeBase32('f')).toBe('MY======')
    expect(encodeBase32('foobar')).toBe('MZXW6YTBOI======')
    expect(encodeBase32('foob', false)).toBe('MZXW6YQ')
    expect(decodeBase32('MZXW6YTBOI======')).toBe('foobar')
    expect(decodeBase32('mzxw6yq')).toBe('foob')
  })
  it('round-trips UTF-8 and rejects invalid', () => {
    expect(decodeBase32(encodeBase32('你好 😀'))).toBe('你好 😀')
    expect(() => decodeBase32('MZ1!')).toThrow()
  })
})
