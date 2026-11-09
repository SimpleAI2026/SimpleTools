import { describe, expect, it } from 'vitest'
import { slugify } from './logic'

const d = { separator: '-' as const, lowercase: true, maxLength: 0, stopWords: false }
describe('slug-generator', () => {
  it('basic', () => {
    expect(slugify('Hello, World!  Ça va?', d)).toBe('hello-world-ca-va')
    expect(slugify('Straße & Œuvre', d)).toBe('strasse-and-oeuvre')
    expect(slugify('myVariableName', d)).toBe('my-variable-name')
    expect(slugify('中文 标题 2026', d)).toBe('中文-标题-2026')
  })
  it('options', () => {
    expect(slugify('The Art of War', { ...d, stopWords: true })).toBe('art-war')
    expect(slugify('Hello World', { ...d, separator: '_', lowercase: false })).toBe('Hello_World')
    expect(slugify('one two three four', { ...d, maxLength: 10 })).toBe('one-two')
  })
})
