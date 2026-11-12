import { describe, expect, it } from 'vitest'
import { parsePhone } from './logic'

describe('phone parser', () => {
  it('formats a UK number with the min metadata', () => {
    const info = parsePhone('+44 20 7183 8750')
    expect(info).toMatchObject({ valid: true, country: 'GB', e164: '+442071838750' })
  })

  it('returns null for text that is not a number', () => {
    expect(parsePhone('hello')).toBeNull()
  })
})
