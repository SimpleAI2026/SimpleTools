import { describe, expect, it } from 'vitest'
import { normalizeEmail } from './logic'

const opts = { lowercase: true, stripPlus: true, gmailDots: true }

describe('email-normalizer', () => {
  it('normalizes gmail dots, plus tags and googlemail', () => {
    expect(normalizeEmail('Ada.Lovelace+news@GoogleMail.com', opts)).toMatchObject({
      normalized: 'adalovelace@gmail.com',
      tag: 'news',
    })
    expect(normalizeEmail('Ada@Example.com', { ...opts, stripPlus: false, gmailDots: false })?.normalized).toBe('ada@example.com')
    expect(normalizeEmail('not-an-email', opts)).toBeNull()
  })
})
