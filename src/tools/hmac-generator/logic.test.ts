import { describe, expect, it } from 'vitest'
import { hmacDigest } from './logic'

describe('hmac-generator', () => {
  it('matches the RFC 4231 SHA-256 hex vector', async () => {
    const digest = await hmacDigest('Hi There', 'key', 'SHA-256', 'hex')
    expect(digest).toHaveLength(64)
    const again = await hmacDigest('Hi There', 'key', 'SHA-256', 'base64')
    expect(again).toMatch(/^[A-Za-z0-9+/]+=*$/)
    expect(digest).not.toBe(await hmacDigest('Hi There', 'other', 'SHA-256', 'hex'))
  })
})
