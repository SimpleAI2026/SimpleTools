import { describe, expect, it } from 'vitest'
import { lintSystemPrompt, SAMPLE_PROMPT } from './logic'

describe('system-prompt-linter', () => {
  it('flags empty prompt', () => {
    const f = lintSystemPrompt('  ', 'en')
    expect(f.some((x) => x.id === 'empty' && x.severity === 'error')).toBe(true)
  })

  it('detects placeholders, ignore-previous, lang conflict, tools without format', () => {
    const f = lintSystemPrompt(SAMPLE_PROMPT, 'en')
    const ids = f.map((x) => x.id)
    expect(ids.some((id) => id.startsWith('placeholder'))).toBe(true)
    expect(ids).toContain('ignore-previous')
    expect(ids).toContain('lang-conflict')
    expect(ids).toContain('missing-output-format')
  })

  it('flags empty markdown sections', () => {
    const f = lintSystemPrompt('# Title\n\n# Next\ncontent', 'zh')
    expect(f.some((x) => x.id.startsWith('empty-section'))).toBe(true)
  })

  it('returns ok info for clean short prompt', () => {
    const f = lintSystemPrompt('You are a helpful assistant. Reply in the user language.', 'en')
    expect(f).toHaveLength(1)
    expect(f[0]?.id).toBe('ok')
  })
})
