import { describe, expect, it } from 'vitest'
import { present, run, SAMPLE, twoProportion } from './logic'

describe('ab-test-analyzer', () => {
  it('returns equal rates with z=0 and p=1', () => {
    const result = twoProportion(50, 100, 50, 100, 'two-sided')
    expect(result).toMatchObject({ z: '0', p: '1', rateA: 0.5, rateB: 0.5, significant: false })
    expect(present(SAMPLE).files.map((file) => file.name)).toContain('result.json')
  })

  it('handles one-sided hypotheses in the observed direction', () => {
    expect(Number(twoProportion(100, 1000, 130, 1000, 'greater').p)).toBeGreaterThan(0.98)
    expect(Number(twoProportion(100, 1000, 130, 1000, 'less').p)).toBeLessThan(0.02)
    expect(twoProportion(100, 1000, 130, 1000, 'two-sided').significant).toBe(true)
  })

  it('does not call small or invalid samples significant', () => {
    expect(twoProportion(1, 5, 4, 5, 'two-sided')).toMatchObject({ applicable: false, significant: false })
    expect(twoProportion(6, 5, 1, 5, 'two-sided').status).toBe('invalid')
    expect(run(JSON.stringify({ successA: 1, trialsA: 5, successB: 4, trialsB: 5 })).csv).toContain('false')
    expect(present('').error).toBe('empty')
  })
})
