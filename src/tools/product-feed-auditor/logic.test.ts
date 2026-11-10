import { describe, expect, it } from 'vitest'
import { gtinCheck, present, run, SAMPLE } from './logic'

describe('product-feed-auditor', () => {
  it('locates duplicate IDs, bad GTINs, and variant currency conflicts', () => {
    const packed = JSON.stringify(run(SAMPLE).json)
    expect(packed).toContain('duplicate-id')
    expect(packed).toContain('gtin')
    expect(packed).toContain('variant-currency')
    expect(packed).toContain('ai_source')
    expect(present(SAMPLE).files.map((file) => file.name)).toContain('result.json')
  })

  it('validates GTIN check digits', () => {
    expect(gtinCheck('96385074')).toEqual({ ok: true, kind: 'GTIN-8' })
    expect(gtinCheck('96385075').ok).toBe(false)
    expect(gtinCheck('12').kind).toBe('format')
  })

  it('accepts CSV and reports row numbers and invalid values', () => {
    const result = run('id,title,price,currency\n1,Hat,-2,US\n')
    expect(result.csv).toContain('invalid-price')
    expect(result.csv).toContain('invalid-currency')
    expect(result.csv).toContain('2,1,')
    expect(present('').error).toBe('empty')
  })
})
