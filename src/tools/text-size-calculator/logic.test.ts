import { describe, expect, it } from 'vitest'
import { measureText, smsSegments } from './logic'

describe('text-size-calculator', () => {
  it('measures', () => {
    expect(measureText('aé中😀')).toEqual({ chars: 4, utf8: 1 + 2 + 3 + 4, utf16: 10, utf32: 16, latin1: null, base64: 16, urlEncoded: 1 + 6 + 9 + 12, lines: 1 })
    expect(measureText('ab\ncd').latin1).toBe(5)
    expect(measureText('').lines).toBe(0)
  })
  it('sms segments', () => {
    expect(smsSegments('hello')).toEqual({ encoding: 'GSM-7', segments: 1 })
    expect(smsSegments('a'.repeat(161))).toEqual({ encoding: 'GSM-7', segments: 2 })
    expect(smsSegments('你好')).toEqual({ encoding: 'UCS-2', segments: 1 })
    expect(smsSegments('中'.repeat(71)).segments).toBe(2)
  })
})
