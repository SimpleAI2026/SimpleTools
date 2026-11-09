import { describe, expect, it } from 'vitest'
import { formatUuid, generateUuids, isValidUuid, MAX_UUID_COUNT, UUID_V4_RE } from './logic'

const plain = { uppercase: false, hyphens: true, braces: false }
const sample = '123e4567-e89b-42d3-a456-426614174000'

describe('uuid-generator', () => {
  it('generates valid unique v4 uuids', () => {
    const list = generateUuids(100, plain)
    expect(list).toHaveLength(100)
    expect(new Set(list).size).toBe(100)
    list.forEach((u) => expect(u).toMatch(UUID_V4_RE))
  })
  it('clamps count', () => {
    expect(generateUuids(0, plain)).toHaveLength(1)
    expect(generateUuids(99999, plain)).toHaveLength(MAX_UUID_COUNT)
    expect(generateUuids(Number.NaN, plain)).toHaveLength(1)
  })
  it('formats', () => {
    expect(formatUuid(sample, { uppercase: true, hyphens: false, braces: true })).toBe('{123E4567E89B42D3A456426614174000}')
    expect(generateUuids(1, plain, () => sample.toUpperCase())).toEqual([sample])
  })
  it('validates', () => {
    expect(isValidUuid(sample)).toBe(true)
    expect(isValidUuid('{123E4567E89B42D3A456426614174000}')).toBe(true)
    expect(isValidUuid('not-a-uuid')).toBe(false)
  })
})
