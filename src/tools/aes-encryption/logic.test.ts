import { describe, expect, it } from 'vitest'
import { decryptText, encryptText } from './logic'

describe('aes-encryption', () => {
  it('round-trips with random salt/iv', async () => {
    const a = await encryptText('秘密 message', 'pw', 1000)
    const b = await encryptText('秘密 message', 'pw', 1000)
    expect(a).not.toBe(b)
    expect(await decryptText(a, 'pw', 1000)).toBe('秘密 message')
  })
  it('fails with wrong password or bad payload', async () => {
    const a = await encryptText('x', 'pw', 1000)
    await expect(decryptText(a, 'nope', 1000)).rejects.toThrow('wrong-password')
    await expect(decryptText('abc', 'pw', 1000)).rejects.toThrow('bad-format')
    await expect(decryptText('%%%', 'pw', 1000)).rejects.toThrow('bad-format')
    await expect(encryptText('x', '')).rejects.toThrow('no-password')
  })
})
