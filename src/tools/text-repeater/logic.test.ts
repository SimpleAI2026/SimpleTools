import { describe, expect, it } from 'vitest'
import { parseSeparator, repeatText } from './logic'

describe('text-repeater', () => {
  it('repeats', () => {
    expect(repeatText('ab', 3, '')).toBe('ababab')
    expect(repeatText('x', 2, '\n', true)).toBe('1. x\n2. x')
    expect(repeatText('x', 0, ',')).toBe('')
    expect(repeatText('', 5, ',')).toBe('')
  })
  it('limits output and parses separators', () => {
    expect(() => repeatText('x'.repeat(1000), 10000, '')).toThrow('too-large')
    expect(parseSeparator('\\n,\\t')).toBe('\n,\t')
  })
})
