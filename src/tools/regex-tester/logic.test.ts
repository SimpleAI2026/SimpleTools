import { describe, expect, it } from 'vitest'
import { buildRegex, runRegex, segments } from './logic'

describe('regex-tester', () => {
  it('finds matches with groups', () => {
    const r = runRegex('(?<y>\\d{4})-(\\d{2})', 'g', 'a 2024-01 b 2025-12', null)
    expect(r.matches.map((m) => m.text)).toEqual(['2024-01', '2025-12'])
    expect(r.matches[0]?.named.y).toBe('2024')
    expect(r.matches[1]?.groups).toEqual(['2025', '12'])
  })
  it('non-global returns first only and replaces', () => {
    const r = runRegex('o', 'i', 'fOo', 'X')
    expect(r.matches).toHaveLength(1)
    expect(r.replaced).toBe('fXo')
    expect(runRegex('o', 'gi', 'fOo', '[$&]').replaced).toBe('f[O][o]')
  })
  it('handles empty matches and invalid patterns', () => {
    expect(runRegex('x*', 'g', 'ab', null).matches.length).toBe(3)
    expect(() => buildRegex('(', 'g')).toThrow()
  })
  it('segments', () => {
    const r = runRegex('b', 'g', 'abcb', null)
    expect(segments('abcb', r.matches)).toEqual([{ text: 'a', match: null }, { text: 'b', match: 0 }, { text: 'c', match: null }, { text: 'b', match: 1 }])
  })
})
