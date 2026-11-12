import { describe, expect, it } from 'vitest'
import { estimateEta, formatDuration } from './logic'

describe('eta-calculator', () => {
  it('estimates the remaining time from a steady rate', () => {
    const result = estimateEta(25, 100, 50, 1_000)
    expect(result?.remainingSeconds).toBe(150)
    expect(result?.finishAt).toBe(151_000)
    expect(formatDuration(150)).toBe('2m 30s')
    expect(estimateEta(0, 10, 5)).toBeNull()
    expect(estimateEta(10, 5, 5)).toBeNull()
  })
})
