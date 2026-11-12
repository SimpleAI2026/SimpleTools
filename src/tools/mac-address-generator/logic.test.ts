import { describe, expect, it } from 'vitest'
import { formatMac, randomMacs } from './logic'

describe('mac-address-generator', () => {
  it('formats and honors a prefix', () => {
    expect(formatMac([0, 26, 43], ':', false)).toBe('00:1a:2b')
    const [mac] = randomMacs({ prefix: 'AC-DE-48', separator: ':', uppercase: true, local: false, count: 1 }, () => 1)
    expect(mac?.startsWith('AC:DE:48:')).toBe(true)
    expect(mac).toHaveLength(17)
  })

  it('sets the locally administered bit when asked and no prefix is given', () => {
    const [mac] = randomMacs({ prefix: '', separator: '-', uppercase: false, local: true, count: 1 }, () => 0)
    expect(mac?.slice(0, 2)).toBe('02')
  })
})
