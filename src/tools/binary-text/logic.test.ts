import { describe, expect, it } from 'vitest'
import { bytesToText, textToBytes } from './logic'

describe('binary-text', () => {
  it('encodes', () => {
    expect(textToBytes('Hi')).toBe('01001000 01101001')
    expect(textToBytes('Hi', 16)).toBe('48 69')
    expect(textToBytes('中', 10)).toBe('228 184 173')
  })
  it('decodes and round-trips', () => {
    expect(bytesToText('01001000 01101001')).toBe('Hi')
    expect(bytesToText('0x48,0x69', 16)).toBe('Hi')
    for (const r of [2, 8, 10, 16] as const) expect(bytesToText(textToBytes('Ünï 😀', r), r)).toBe('Ünï 😀')
  })
  it('rejects bad input', () => {
    expect(() => bytesToText('012')).toThrow()
    expect(() => bytesToText('256', 10)).toThrow()
    expect(() => bytesToText('ff', 16)).toThrow()
  })
})
