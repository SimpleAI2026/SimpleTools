import { describe, expect, it } from 'vitest'
import { parseIban } from './logic'

describe('iban', () => {
  it('accepts the published GB and DE examples', () => {
    expect(parseIban('GB82 WEST 1234 5698 7654 32')).toMatchObject({ country: 'GB', valid: true, knownLength: true })
    expect(parseIban('DE89370400440532013000')).toMatchObject({ country: 'DE', valid: true })
  })

  it('rejects a broken check digit', () => {
    expect(parseIban('DE89370400440532013001')?.valid).toBe(false)
    expect(parseIban('not an iban')).toBeNull()
  })
})
