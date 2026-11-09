import { describe, expect, it } from 'vitest'
import { cidrInfo, parseCidr, splitSubnets } from './logic'

describe('cidr-calculator', () => {
  it('parses', () => {
    expect(parseCidr('192.168.1.10/24')).toEqual({ ip: 3232235786, prefix: 24 })
    expect(parseCidr('10.0.0.1 255.255.0.0')?.prefix).toBe(16)
    expect(parseCidr('10.0.0.1/33')).toBeNull()
    expect(parseCidr('nope')).toBeNull()
  })
  it('computes info', () => {
    const p = parseCidr('192.168.1.10/24')!
    expect(cidrInfo(p.ip, p.prefix)).toMatchObject({ network: '192.168.1.0', broadcast: '192.168.1.255', netmask: '255.255.255.0', wildcard: '0.0.0.255', firstHost: '192.168.1.1', lastHost: '192.168.1.254', usableHosts: 254, ipClass: 'C', isPrivate: true })
    const q = parseCidr('8.8.8.8/31')!
    expect(cidrInfo(q.ip, q.prefix)).toMatchObject({ usableHosts: 2, firstHost: '8.8.8.8', isPrivate: false })
    expect(cidrInfo(0, 0).totalAddresses).toBe(4294967296)
  })
  it('splits', () => {
    expect(splitSubnets(parseCidr('10.0.0.0/24')!.ip, 24, 26)).toEqual(['10.0.0.0/26', '10.0.0.64/26', '10.0.0.128/26', '10.0.0.192/26'])
    expect(splitSubnets(0, 24, 20)).toEqual([])
  })
})
