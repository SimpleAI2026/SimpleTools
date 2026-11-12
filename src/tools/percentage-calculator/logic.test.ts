import { describe, expect, it } from 'vitest'
import { formatPercentResult, percentage } from './logic'

describe('percentage-calculator', () => {
  it('covers the five modes', () => {
    expect(percentage('of', 20, 150)).toBe(30)
    expect(percentage('ratio', 30, 150)).toBe(20)
    expect(percentage('change', 80, 100)).toBe(25)
    expect(percentage('add', 80, 25)).toBe(100)
    expect(percentage('sub', 80, 25)).toBe(60)
    expect(percentage('ratio', 1, 0)).toBeNull()
    expect(formatPercentResult(0.1 + 0.2)).toBe('0.3')
  })
})