import { describe, expect, it } from 'vitest'
import { linesToMarkdown } from './logic'

describe('pdf-to-markdown', () => {
  it('numbered lists and sub-headings', () => {
    expect(linesToMarkdown([[{ text: 'Section', size: 14, y: 500, x: 0 }, { text: '1) first', size: 10, y: 480, x: 0 }, { text: 'plain body text', size: 10, y: 460, x: 0 }]])).toBe('## Section\n\n1. first\n\nplain body text\n')
  })
})
