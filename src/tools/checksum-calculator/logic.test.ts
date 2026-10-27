import { describe, expect, it } from 'vitest'
import { adler32, checksums, crc32, findMatch, hmac, md5 } from './logic'

const enc = (s: string) => new TextEncoder().encode(s)
describe('checksum-calculator', () => {
  it('crc32 / adler32', () => {
    expect(crc32(enc('123456789')).toString(16)).toBe('cbf43926')
    expect(adler32(enc('Wikipedia')).toString(16)).toBe('11e60398')
  })
  it('md5 vectors', () => {
    expect(md5(enc(''))).toBe('d41d8cd98f00b204e9800998ecf8427e')
    expect(md5(enc('The quick brown fox jumps over the lazy dog'))).toBe('9e107d9d372bb6826bd81d3542a419d6')
    expect(md5(enc('a'.repeat(1000)))).toBe('cabe45dcc9ae5b66ba86600cca6b8ba8')
  })
  it('all sums and HMAC', async () => {
    const s = await checksums(enc('abc'))
    expect(s['SHA-256']).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad')
    expect(findMatch(' BA7816BF8F01CFEA414140DE5DAE2223B00361A396177A9CB410FF61F20015AD ', s)).toBe('SHA-256')
    expect(findMatch('00', s)).toBeNull()
    expect(await hmac(enc('The quick brown fox jumps over the lazy dog'), 'key', 'SHA-256')).toBe('f7bc83f430538424b13298e6aa6fb143ef4d59a14946175997479dbc2d1a3cd8')
  })
})
