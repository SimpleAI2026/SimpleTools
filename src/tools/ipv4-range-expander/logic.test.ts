import { describe, expect, it } from 'vitest'
import { ipv4RangeToCidrs } from './logic'

describe('ipv4-range-expander', () => {
  it('finds the smallest CIDR cover', () => {
    expect(ipv4RangeToCidrs('10.0.0.0', '10.0.0.255')).toEqual(['10.0.0.0/24'])
    expect(ipv4RangeToCidrs('10.0.0.0', '10.0.1.255')).toEqual(['10.0.0.0/23'])
    expect(ipv4RangeToCidrs('10.0.0.1', '10.0.0.1')).toEqual(['10.0.0.1/32'])
    expect(ipv4RangeToCidrs('10.0.0.5', '10.0.0.1')).toBeNull()
    expect(ipv4RangeToCidrs('10.0.0', '10.0.0.1')).toBeNull()
  })
})