import { describe, expect, it } from 'vitest'
import { guessFormat, isBinaryFormat, isPdfFormat, outputFileName } from './logic'

describe('pandoc logic', () => {
  it('guesses formats and detects pdf', () => {
    expect(guessFormat('a.MD')).toBe('markdown')
    expect(guessFormat('x.docx')).toBe('docx')
    expect(isBinaryFormat('epub')).toBe(true)
    expect(isPdfFormat('pdf')).toBe(true)
    expect(outputFileName('r.md', 'html')).toBe('r.html')
  })
})
