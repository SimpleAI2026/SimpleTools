import { describe, expect, it } from 'vitest'
import { present, run, SAMPLE } from './logic'

describe("ab-test-analyzer", () => {
  it('builds a real artifact and keeps the boundary marker', () => {
    const result = run(SAMPLE)
    const packed = JSON.stringify(result.json) + '\n' + result.csv + '\n' + result.summary
    expect(result.csv.split('\n').length).toBeGreaterThan(1)
    expect(packed).toContain('"z":"0"')
    expect(present(SAMPLE).files.map((file) => file.name)).toContain('result.json')
  })

  it('rejects empty input, broken syntax, and an oversized import', () => {
    expect(present('').error).toBe('empty')
    expect(present('{').error).not.toBe('')
    expect(present('x'.repeat(1_500_001)).error).toBe('too-large')
  })
})
