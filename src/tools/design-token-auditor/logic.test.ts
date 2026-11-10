import { describe, expect, it } from 'vitest'
import { present, run, SAMPLE } from './logic'

describe('design-token-auditor', () => {
  it('detects and deduplicates reference cycles', () => {
    const result = (run(SAMPLE).json as { result: { tokenCount: number; issues: { code: string }[] } }).result
    expect(result.tokenCount).toBe(2)
    expect(result.issues.filter((issue) => issue.code === 'cycle')).toHaveLength(1)
    expect(present(SAMPLE).files.map((file) => file.name)).toContain('result.json')
  })

  it('reports missing references and case collisions', () => {
    const input = JSON.stringify({ tokens: {
      Color: { Text: { $value: '{color.missing}', $type: 'color' } },
      color: { text: { $value: '#000000', $type: 'color' } },
    } })
    const packed = JSON.stringify(run(input).json)
    expect(packed).toContain('missing-ref')
    expect(packed).toContain('case-collision')
  })

  it('accepts resolvable local references', () => {
    const input = JSON.stringify({ color: { base: { $value: '#fff' }, text: { $value: '{color.base}' } } })
    expect((run(input).json as { result: { issues: unknown[] } }).result.issues).toEqual([])
    expect(present('').error).toBe('empty')
    expect(present('{').error).toBe('invalid-json')
  })
})
