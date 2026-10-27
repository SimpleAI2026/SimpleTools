import { describe, expect, it } from 'vitest'
import { decodeJwt, verifyHmac } from './logic'

// Standard example token from RFC 7519 tooling (HS256, secret "your-256-bit-secret").
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'

describe('jwt-decoder', () => {
  it('decodes', () => {
    const d = decodeJwt(`Bearer ${TOKEN}`)
    expect(d.header).toEqual({ alg: 'HS256', typ: 'JWT' })
    expect(d.payload.name).toBe('John Doe')
    expect(d.times[0]?.claim).toBe('iat')
    expect(d.expired).toBeNull()
  })
  it('expiry', () => {
    const payload = btoa(JSON.stringify({ exp: 100 })).replace(/=+$/, '')
    expect(decodeJwt(`eyJhbGciOiJub25lIn0.${payload}.`, 200_000).expired).toBe(true)
  })
  it('errors', () => {
    expect(() => decodeJwt('abc')).toThrow('parts')
    expect(() => decodeJwt('a.b.c')).toThrow('decode')
  })
  it('verifies HMAC', async () => {
    expect(await verifyHmac(TOKEN, 'your-256-bit-secret')).toBe(true)
    expect(await verifyHmac(TOKEN, 'wrong')).toBe(false)
  })
})
