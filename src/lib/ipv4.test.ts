import { describe, expect, it } from 'vitest'
import { formatIPv4, maskToPrefix, parseIPv4, prefixToMask } from './ipv4'

describe('ipv4 lib', () => {
  it('parses/formats', () => {
    expect(parseIPv4('192.168.1.1')).toBe(3232235777)
    expect(formatIPv4(3232235777)).toBe('192.168.1.1')
    expect(parseIPv4('256.0.0.1')).toBeNull()
  })
  it('masks', () => {
    expect(formatIPv4(prefixToMask(24))).toBe('255.255.255.0')
    expect(prefixToMask(0)).toBe(0)
    expect(maskToPrefix(parseIPv4('255.255.240.0')!)).toBe(20)
    expect(maskToPrefix(parseIPv4('255.0.255.0')!)).toBeNull()
  })
})
