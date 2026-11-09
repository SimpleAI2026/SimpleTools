import { describe, expect, it } from 'vitest'
import { testRegex } from './regexBudget'

describe('step-budget regex', () => {
  it('matches, misses, and rejects unsupported or broken patterns', () => {
    expect(testRegex('price', '', 'the price is 10').status).toBe('match')
    expect(testRegex('^a+', '', 'aaab').match).toBe('aaa')
    expect(testRegex('cat|dog', '', 'a dog')).toMatchObject({ status: 'match', match: 'dog' })
    expect(testRegex('\\d+', '', 'id 42').match).toBe('42')
    expect(testRegex('acme', 'i', 'ACME corp').status).toBe('match')
    expect(testRegex('nope', '', 'abc').status).toBe('nomatch')
    expect(testRegex('(abc', '', 'abc').status).toBe('invalid')
    expect(testRegex('(?=a)', '', 'a').status).toBe('invalid')
    expect(testRegex('(a)\\1', '', 'aa').status).toBe('invalid')
    expect(testRegex('a'.repeat(201), '', 'a').status).toBe('too-long')
    expect(testRegex('a', '', 'a'.repeat(20_001)).status).toBe('too-long')
  })

  it('returns timeout instead of a pass when backtracking exceeds the step budget', () => {
    const hit = testRegex('(a+)+b', '', `${'a'.repeat(24)}c`, 5_000)
    expect(hit.status).toBe('timeout')
    expect(hit.match).toBe('')
    expect(testRegex('a+', '', 'aaaa').status).toBe('match')
  })
})
