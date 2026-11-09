import { describe, expect, it } from 'vitest'
import { DEFAULT_REDACT_OPTIONS, redactSecrets, SAMPLE_SECRET_TEXT } from './logic'

describe('prompt-secret-redactor', () => {
  it('redacts common secrets from sample', () => {
    const r = redactSecrets(SAMPLE_SECRET_TEXT, { ...DEFAULT_REDACT_OPTIONS, email: true })
    expect(r.total).toBeGreaterThanOrEqual(7)
    expect(r.text).not.toContain('sk-proj-')
    expect(r.text).toContain('[REDACTED_OPENAI_KEY]')
    expect(r.text).toContain('[REDACTED_EMAIL]')
    expect(r.text).toContain('[REDACTED_PRIVATE_KEY_PEM]')
  })

  it('respects category toggles', () => {
    const off = { ...DEFAULT_REDACT_OPTIONS, openai: false, email: false }
    const r = redactSecrets('sk-abcdefghijklmnopqrstuvwxyz012345 alice@x.com', off)
    expect(r.text).toContain('sk-')
    expect(r.text).toContain('alice@x.com')
  })

  it('handles empty', () => {
    expect(redactSecrets('').total).toBe(0)
  })
})
