import { describe, expect, it } from 'vitest'
import { analyzePassword, formatDuration } from './logic'

describe('password strength', () => {
  it('scores a short lowercase password as weak', () => {
    const report = analyzePassword('horse')
    expect(report.charset).toBe(26)
    expect(report.entropyBits).toBeCloseTo(5 * Math.log2(26))
    expect(report.rating).toBe('weak')
  })

  it('counts mixed classes and formats a short crack time', () => {
    const report = analyzePassword('Aa1!')
    expect(report.charset).toBe(26 + 26 + 10 + 33)
    expect(report.rating).toBe('weak')
    expect(formatDuration(report.seconds)).toBe('< 1s')
    expect(formatDuration(null)).toBe('')
  })
})
