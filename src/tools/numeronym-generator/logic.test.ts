import { describe, expect, it } from 'vitest'
import { numeronym, numeronyms } from './logic'

describe('numeronym-generator', () => {
  it('builds i18n-style abbreviations', () => {
    expect(numeronym('internationalization')).toBe('i18n')
    expect(numeronym('accessibility')).toBe('a11y')
    expect(numeronym('cat')).toBe('cat')
    expect(numeronyms('kubernetes service')).toBe('k8s s5e')
  })
})
