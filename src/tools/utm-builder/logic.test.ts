import { describe, expect, it } from 'vitest'
import { present, run, SAMPLE } from './logic'

describe('utm-builder', () => {
  it('preserves existing query and hash and encodes values once', () => {
    const result = run(SAMPLE)
    const report = (result.json as { result: { links: { url: string }[] } }).result
    expect(report.links[0]!.url).toBe('https://ex.com/a?x=1&utm_source=newsletter&utm_medium=email&utm_campaign=%E6%98%A5%E4%BF%83#hero')
    expect(result.csv).toContain('%E6%98%A5%E4%BF%83')
    expect(present(SAMPLE).files.map((file) => file.name)).toContain('result.json')
  })

  it('supports keep and error policies for existing UTM values', () => {
    const input = JSON.stringify({ onDuplicate: 'keep', links: [{ url: 'https://ex.com/?utm_source=old', utm_source: 'new', utm_medium: 'email', utm_campaign: 'sale' }] })
    expect(JSON.stringify(run(input).json)).toContain('utm_source=old')
    const flagged = run(input.replace('"keep"', '"error"'))
    expect(JSON.stringify(flagged.json)).toContain('duplicate-utm')
    expect(JSON.stringify(flagged.json)).toContain('utm_source=old')
  })

  it('rejects non-web URLs and reports missing required fields', () => {
    const result = run(JSON.stringify({ links: [{ url: 'javascript:alert(1)', utm_medium: 'email' }] }))
    const packed = JSON.stringify(result.json)
    expect(packed).toContain('bad-url')
    const missing = run(JSON.stringify({ links: [{ url: 'https://ex.com/', utm_medium: 'email' }] }))
    expect(JSON.stringify(missing.json)).toContain('missing-required')
    expect(present('').error).toBe('empty')
    expect(present('{').error).not.toBe('')
  })
})
