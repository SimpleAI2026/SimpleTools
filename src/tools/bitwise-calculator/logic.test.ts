import { describe, expect, it } from 'vitest'
import { compute, formatBits, parseBigInt, toSigned } from './logic'

describe('bitwise-calculator', () => {
  it('parses', () => {
    expect(parseBigInt('0xff')).toBe(255n)
    expect(parseBigInt('0b1010')).toBe(10n)
    expect(parseBigInt('-0o17')).toBe(-15n)
    expect(parseBigInt('1_000')).toBe(1000n)
    expect(parseBigInt('abc')).toBeNull()
  })
  it('computes', () => {
    expect(compute(12n, 10n, 'and', 8)).toBe(8n)
    expect(compute(12n, 10n, 'or', 8)).toBe(14n)
    expect(compute(12n, 10n, 'xor', 8)).toBe(6n)
    expect(compute(12n, 10n, 'nand', 8)).toBe(247n)
    expect(compute(1n, 7n, 'shl', 8)).toBe(128n)
    expect(compute(0x80n, 7n, 'shr', 8)).toBe(1n)
    expect(compute(0x80n, 7n, 'sar', 8)).toBe(255n)
    expect(compute(0n, 0n, 'notA', 16)).toBe(65535n)
    expect(compute(-1n, 0n, 'or', 64)).toBe(2n ** 64n - 1n)
  })
  it('formats', () => {
    expect(formatBits(5n, 8)).toBe('0000 0101')
    expect(toSigned(255n, 8)).toBe(-1n)
  })
})
