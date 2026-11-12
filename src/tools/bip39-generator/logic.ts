import { generateMnemonic, validateMnemonic } from '@scure/bip39'
import { wordlist } from '@scure/bip39/wordlists/english.js'

export const BIP39_STRENGTHS = [128, 160, 192, 224, 256] as const
export type Bip39Strength = (typeof BIP39_STRENGTHS)[number]

export function createMnemonic(strength: Bip39Strength = 128): string {
  return generateMnemonic(wordlist, strength)
}

export function checkMnemonic(phrase: string): boolean {
  return validateMnemonic(phrase.trim().replace(/\s+/g, ' '), wordlist)
}

export function mnemonicWordCount(strength: Bip39Strength): number {
  return strength / 32 * 3
}
