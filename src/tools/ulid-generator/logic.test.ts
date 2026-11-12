import { describe, expect, it } from 'vitest'
import { encodeTime, generateUlids, MAX_ULID_COUNT, parseUlid } from './logic'

describe('ulid-generator', () => {
  it('encodes the timestamp in Crockford base32', () => {
    expect(encodeTime(0)).toBe('0000000000')
    expect(encodeTime(31)).toBe('000000000Z')
    expect(encodeTime(32)).toBe('0000000010')
  })

  it('generates sortable ids and parses the time back', () => {
    const now = 1_469_918_176_385
    const list = generateUlids(3, now, (bytes) => bytes.fill(0))
    expect(list).toEqual([
      '01ARYZ6S410000000000000000',
      '01ARYZ6S410000000000000001',
      '01ARYZ6S410000000000000002',
    ])
    expect(parseUlid(list[0] ?? '')).toEqual({ time: now, randomHex: '00000000000000000000' })
    expect(parseUlid('not-an-ulid')).toBeNull()
    expect(parseUlid('01ARYZ6S41OOOOOOOOOOOOOOOO')).toBeNull()
  })

  it('clamps the batch size and uses fresh randomness', () => {
    expect(generateUlids(0)).toHaveLength(1)
    expect(generateUlids(9999)).toHaveLength(MAX_ULID_COUNT)
    const [a, b] = generateUlids(2)
    expect(a).not.toBe(b)
    expect(a?.slice(0, 10)).toBe(b?.slice(0, 10))
  })
})
