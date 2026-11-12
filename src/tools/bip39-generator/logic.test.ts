import { describe, expect, it } from 'vitest'
import { checkMnemonic, createMnemonic, mnemonicWordCount } from './logic'

const VECTOR = 'legal winner thank year wave sausage worth useful legal winner thank yellow'

describe('bip39', () => {
  it('accepts the BIP-39 English test vector', () => {
    expect(checkMnemonic(VECTOR)).toBe(true)
    expect(checkMnemonic('legal winner thank year wave sausage worth useful legal winner thank zoo')).toBe(false)
  })

  it('generates a phrase with the requested length', () => {
    expect(mnemonicWordCount(128)).toBe(12)
    expect(createMnemonic(128).split(' ')).toHaveLength(12)
    expect(checkMnemonic(createMnemonic(256))).toBe(true)
  })
})
