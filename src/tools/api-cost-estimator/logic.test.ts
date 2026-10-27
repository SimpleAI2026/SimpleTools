import { describe, expect, it } from 'vitest'
import { DEFAULT_PRICING_MODELS, estimateCost, findModel, formatUsd } from './logic'

describe('api-cost-estimator', () => {
  it('computes per-call and monthly cost', () => {
    const r = estimateCost({ inputTokens: 1_000_000, outputTokens: 1_000_000, inputPerMillion: 2.5, outputPerMillion: 10, requestsPerMonth: 100 })
    expect(r.inputCost).toBe(2.5)
    expect(r.outputCost).toBe(10)
    expect(r.perCall).toBe(12.5)
    expect(r.monthly).toBe(1250)
  })

  it('handles zeros and negatives as zero', () => {
    const r = estimateCost({ inputTokens: -1, outputTokens: 0, inputPerMillion: 1, outputPerMillion: 1 })
    expect(r.perCall).toBe(0)
    expect(r.monthly).toBe(0)
  })

  it('formats usd', () => {
    expect(formatUsd(0)).toBe('$0.00')
    expect(formatUsd(12.5)).toBe('$12.50')
    expect(formatUsd(0.0000123)).toMatch(/^\$/)
  })

  it('finds preset models', () => {
    expect(findModel('gpt-4o')?.provider).toBe('OpenAI')
    expect(DEFAULT_PRICING_MODELS.length).toBeGreaterThan(5)
  })
})
