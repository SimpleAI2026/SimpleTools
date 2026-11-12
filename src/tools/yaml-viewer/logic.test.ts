import { describe, expect, it } from 'vitest'
import { parseYamlValue, searchYaml } from './logic'

describe('yaml-viewer', () => {
  it('parses a document and finds a nested value', () => {
    const parsed = parseYamlValue('name: SimpleTools\nflags:\n  - offline\n')
    expect(parsed.ok).toBe(true)
    if (!parsed.ok) return
    expect(parsed.value).toEqual({ name: 'SimpleTools', flags: ['offline'] })
    expect(searchYaml(parsed.value, 'offline').some((path) => path.includes('flags'))).toBe(true)
  })

  it('keeps multiple documents as an array', () => {
    const parsed = parseYamlValue('a: 1\n---\nb: 2\n')
    expect(parsed.ok && parsed.documents).toBe(2)
    expect(parseYamlValue('[unterminated')).toMatchObject({ ok: false })
  })
})