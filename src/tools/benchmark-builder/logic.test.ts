import { describe, expect, it } from 'vitest'
import { parseNumbers, summarize } from './logic'

describe('benchmark-builder', () => {
  it('summarizes a sample with median and sample variance', () => {
    expect(parseNumbers('1, 2; 3\n4')).toEqual([1, 2, 3, 4])
    const stats = summarize([1, 2, 3, 4])
    expect(stats).toMatchObject({ count: 4, min: 1, max: 4, mean: 2.5, median: 2.5 })
    expect(stats?.variance).toBeCloseTo(1.666666, 5)
    expect(summarize([])).toBeNull()
  })
})
