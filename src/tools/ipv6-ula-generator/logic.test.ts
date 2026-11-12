import { describe, expect, it } from 'vitest'
import { generateUla, isUlaPrefix } from './logic'

describe('ipv6-ula-generator', () => {
  it('builds an fd00::/8 prefix from SHA-1', async () => {
    const result = await generateUla(1_700_000_000_000, Uint8Array.from([1, 2, 3, 4, 5, 6, 7, 8]))
    expect(result.prefix.startsWith('fd')).toBe(true)
    expect(result.prefix.endsWith('::/48')).toBe(true)
    expect(isUlaPrefix(result.prefix)).toBe(true)
    expect(result.firstSubnet.endsWith(':1::/64')).toBe(true)
    const again = await generateUla(1_700_000_000_000, Uint8Array.from([1, 2, 3, 4, 5, 6, 7, 8]))
    expect(again.prefix).toBe(result.prefix)
  })
})