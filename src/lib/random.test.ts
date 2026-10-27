import { describe, expect, it } from 'vitest'
import { randomBetween, randomInt, shuffle } from './random'

describe('random', () => {
  it('stays in range', () => {
    for (let i = 0; i < 300; i++) {
      const v = randomBetween(-3, 3)
      expect(v).toBeGreaterThanOrEqual(-3)
      expect(v).toBeLessThanOrEqual(3)
    }
    expect(() => randomInt(0)).toThrow()
  })
  it('shuffle is a permutation', () => {
    const s = shuffle([1, 2, 3, 4, 5])
    expect([...s].sort()).toEqual([1, 2, 3, 4, 5])
  })
})
