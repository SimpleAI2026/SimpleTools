import { describe, expect, it } from 'vitest'
import { toNato } from './logic'

describe('nato-alphabet', () => {
  it('spells letters, digits and keeps other symbols', () => {
    expect(toNato('Ab 12')).toBe('Alfa Bravo / One Two')
    expect(toNato('OK!')).toBe('Oscar Kilo !')
  })
})
