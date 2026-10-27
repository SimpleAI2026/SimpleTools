import { describe, expect, it } from 'vitest'
import { hashAll, hashData, toHex } from './logic'

describe('hash-generator', () => {
  it('hex encodes', () => {
    expect(toHex(new Uint8Array([0, 15, 255]).buffer)).toBe('000fff')
  })
  it('computes known digests', async () => {
    expect(await hashData('abc', 'SHA-256')).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad')
    expect(await hashData('abc', 'SHA-1')).toBe('a9993e364706816aba3e25717850c26c9cd0d89d')
    expect(await hashData('', 'SHA-256')).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855')
  })
  it('hashes ArrayBuffer same as string', async () => {
    const buf = new TextEncoder().encode('中文').buffer as ArrayBuffer
    expect(await hashData(buf, 'SHA-512')).toBe(await hashData('中文', 'SHA-512'))
  })
  it('hashAll returns all algorithms with correct lengths', async () => {
    const r = await hashAll('x')
    expect(r['SHA-1']).toHaveLength(40)
    expect(r['SHA-256']).toHaveLength(64)
    expect(r['SHA-384']).toHaveLength(96)
    expect(r['SHA-512']).toHaveLength(128)
  })
})
