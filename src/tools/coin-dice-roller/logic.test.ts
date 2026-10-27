import { describe, expect, it } from 'vitest'
import { flipCoins, parseNotation, rollDice, summarize } from './logic'

describe('coin-dice-roller', () => {
  it('flips and rolls within bounds', () => {
    expect(flipCoins(50).every((c) => c === 'heads' || c === 'tails')).toBe(true)
    expect(flipCoins(0)).toHaveLength(1)
    const r = rollDice(100, 6)
    expect(r.every((v) => v >= 1 && v <= 6)).toBe(true)
    expect(rollDice(3, 20, () => 7)).toEqual([7, 7, 7])
  })
  it('parses notation', () => {
    expect(parseNotation('2d6+3')).toEqual({ count: 2, sides: 6, modifier: 3 })
    expect(parseNotation('d20')).toEqual({ count: 1, sides: 20, modifier: 0 })
    expect(parseNotation('3D8 - 1')).toEqual({ count: 3, sides: 8, modifier: -1 })
    expect(parseNotation('0d6')).toBeNull()
    expect(parseNotation('hello')).toBeNull()
  })
  it('summarizes', () => {
    expect(summarize([1, 2, 3])).toEqual({ total: 6, min: 1, max: 3, avg: 2 })
    expect(summarize([])).toEqual({ total: 0, min: 0, max: 0, avg: 0 })
  })
})
