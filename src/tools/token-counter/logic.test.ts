import { describe, expect, it } from 'vitest'
import { analyzeText, countTokensForFamily, estimateTokensHeuristic, formatPercent } from './logic'

describe('token-counter', () => {
  it('counts empty as zero', () => {
    expect(countTokensForFamily('', 'o200k')).toEqual({ tokens: 0, accurate: true })
    expect(analyzeText('', 'claude').tokens).toBe(0)
  })

  it('uses o200k accurately for ascii', () => {
    const r = countTokensForFamily('Hello world!', 'o200k')
    expect(r.accurate).toBe(true)
    expect(r.tokens).toBeGreaterThan(0)
    expect(r.tokens).toBeLessThan(10)
  })

  it('cl100k differs from o200k on CJK-heavy text', () => {
    const text = '你好世界 Hello'
    const a = countTokensForFamily(text, 'o200k')
    const b = countTokensForFamily(text, 'cl100k')
    expect(a.accurate && b.accurate).toBe(true)
    expect(a.tokens).toBeGreaterThan(0)
    expect(b.tokens).toBeGreaterThan(0)
  })

  it('heuristic counts CJK ~1 and ASCII ~0.25', () => {
    expect(estimateTokensHeuristic('你好')).toBe(2)
    expect(estimateTokensHeuristic('abcd')).toBe(1) // 4 * 0.25
    expect(estimateTokensHeuristic('abcdefgh')).toBe(2)
  })

  it('reports context ratio', () => {
    const s = analyzeText('a'.repeat(400), 'claude', 8000)
    expect(s.contextWindow).toBe(8000)
    expect(s.contextRatio).toBeGreaterThan(0)
    expect(formatPercent(0.5)).toBe('50.0%')
  })

  it('marks non-openai as estimate', () => {
    expect(countTokensForFamily('hi', 'gemini').accurate).toBe(false)
    expect(countTokensForFamily('hi', 'deepseek').accurate).toBe(false)
  })
})
