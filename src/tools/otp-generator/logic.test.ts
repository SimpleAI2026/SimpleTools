import { describe, expect, it } from 'vitest'
import { decodeBase32, encodeBase32, hotp, otpauthUri, secondsRemaining, totp, verifyOtp } from './logic'

const ascii = (s: string) => new TextEncoder().encode(s)

describe('otp-generator', () => {
  it('round-trips base32', () => {
    const bytes = Uint8Array.from([0, 1, 2, 255, 16, 32])
    const encoded = encodeBase32(bytes)
    expect(decodeBase32(encoded.toLowerCase() + '====')).toEqual(bytes)
    expect(decodeBase32('not base32!')).toBeNull()
  })

  it('matches RFC 4226 HOTP vectors', async () => {
    const secret = ascii('12345678901234567890')
    const expected = ['755224', '287082', '359152', '969429', '338314']
    for (let i = 0; i < expected.length; i++) {
      expect(await hotp(secret, BigInt(i), 6, 'SHA-1')).toBe(expected[i])
    }
  })

  it('matches the RFC 6238 TOTP SHA-1 vector', async () => {
    const secret = ascii('12345678901234567890')
    expect(await totp(secret, 59_000, 30, 8, 'SHA-1')).toBe('94287082')
    expect(secondsRemaining(59_000, 30)).toBe(1)
  })

  it('builds an otpauth URI and checks a window', async () => {
    const secret = encodeBase32(ascii('12345678901234567890'))
    const uri = otpauthUri({
      kind: 'totp',
      secret,
      account: 'ada',
      issuer: 'SimpleTools',
      digits: 8,
      period: 30,
      counter: 0,
      algo: 'SHA-1',
    })
    expect(uri.startsWith('otpauth://totp/SimpleTools%3Aada?')).toBe(true)
    expect(uri).toContain('algorithm=SHA1')
    const code = await totp(ascii('12345678901234567890'), 59_000, 30, 8, 'SHA-1')
    const hit = await verifyOtp(ascii('12345678901234567890'), code, { kind: 'totp', digits: 8, period: 30, counter: 0, algo: 'SHA-1', window: 1 }, 59_000)
    expect(hit.ok).toBe(true)
    const miss = await verifyOtp(ascii('12345678901234567890'), '00000000', { kind: 'totp', digits: 8, period: 30, counter: 0, algo: 'SHA-1', window: 0 }, 59_000)
    expect(miss).toEqual({ ok: false, delta: null })
  })
})
