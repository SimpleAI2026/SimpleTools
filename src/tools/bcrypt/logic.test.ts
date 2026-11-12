import { describe, expect, it } from 'vitest'
import { bcryptMeta, clampRounds, hashBcrypt, verifyBcrypt } from './logic'

describe('bcrypt', () => {
  it('clamps cost', () => {
    expect(clampRounds(1)).toBe(4)
    expect(clampRounds(99)).toBe(12)
    expect(clampRounds(Number.NaN)).toBe(10)
    expect(clampRounds(7.6)).toBe(8)
  })

  it('hashes and verifies at the chosen cost', async () => {
    const hash = await hashBcrypt('correct horse battery', 4)
    expect(bcryptMeta(hash)).toEqual({ valid: true, rounds: 4 })
    expect(await verifyBcrypt('correct horse battery', hash)).toBe(true)
    expect(await verifyBcrypt('wrong', hash)).toBe(false)
    expect(hash.startsWith('$2')).toBe(true)
  })

  it('rejects malformed hashes without throwing', async () => {
    expect(bcryptMeta('not-a-hash')).toEqual({ valid: false, rounds: null })
    expect(await verifyBcrypt('x', 'not-a-hash')).toBe(false)
    expect(await verifyBcrypt('x', '')).toBe(false)
  })
})
