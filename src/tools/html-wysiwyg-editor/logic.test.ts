import { describe, expect, it } from 'vitest'
import { htmlToText } from './logic'

describe('html editor export', () => {
  it('drops tags and decodes the common entities', () => {
    expect(htmlToText('<p>Hello <strong>A &amp; B</strong></p><p>Next</p>')).toBe('Hello A & B\nNext')
  })
})
