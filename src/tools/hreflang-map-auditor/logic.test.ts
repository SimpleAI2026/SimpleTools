import { describe, expect, it } from 'vitest'
import { present, run, SAMPLE } from './logic'

describe('hreflang-map-auditor', () => {
  it('reports a missing return link', () => {
    const result = run(SAMPLE)
    expect(result.csv).toContain('return-link')
    expect(present(SAMPLE).files.map((file) => file.name)).toContain('result.json')
  })

  it('accepts reciprocal mappings and x-default', () => {
    const input = JSON.stringify({ rows: [
      { url: 'https://ex.com/en', lang: 'en', alternates: ['https://ex.com/en', 'https://ex.com/de', 'https://ex.com/'] },
      { url: 'https://ex.com/de', lang: 'de', alternates: ['https://ex.com/de', 'https://ex.com/en', 'https://ex.com/'] },
      { url: 'https://ex.com/', lang: 'x-default', alternates: ['https://ex.com/', 'https://ex.com/en', 'https://ex.com/de'] },
    ] })
    const result = (run(input).json as { result: { issues: unknown[] } }).result
    expect(result.issues).toEqual([])
  })

  it('accepts full-width separators and rejects invalid URLs and duplicate pages', () => {
    const result = run(JSON.stringify({ rows: [
      { url: 'bad', lang: 'EN', alternates: 'bad｜https://ex.com/en' },
      { url: 'bad', lang: 'en', alternates: 'bad' },
    ] }))
    const packed = JSON.stringify(result.json)
    expect(packed).toContain('invalid-url')
    expect(packed).toContain('duplicate-url')
    expect(present('').error).toBe('empty')
  })
})
