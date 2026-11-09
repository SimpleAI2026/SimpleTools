import { describe, expect, it } from 'vitest'
import { ipv4Formats, parseAnyIPv4 } from './logic'

describe('ipv4-converter', () => {
  it('parses many formats', () => {
    expect(parseAnyIPv4('192.168.0.1')).toBe(3232235521)
    expect(parseAnyIPv4('3232235521')).toBe(3232235521)
    expect(parseAnyIPv4('0xC0A80001')).toBe(3232235521)
    expect(parseAnyIPv4('11000000.10101000.00000000.00000001')).toBe(3232235521)
    expect(parseAnyIPv4('4294967296')).toBeNull()
    expect(parseAnyIPv4('x')).toBeNull()
  })
  it('formats', () => {
    expect(ipv4Formats(3232235521)).toEqual({ dotted: '192.168.0.1', decimal: '3232235521', hex: '0xC0A80001', binary: '11000000.10101000.00000000.00000001', octalDotted: '0300.0250.00.01', hexDotted: '0xc0.0xa8.0x00.0x01', ipv6Mapped: '::ffff:c0a8:0001' })
  })
})
