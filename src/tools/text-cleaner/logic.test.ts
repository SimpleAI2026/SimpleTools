import { describe, expect, it } from 'vitest'
import { cleanText, DEFAULT_CLEAN } from './logic'

const none = Object.fromEntries(Object.keys(DEFAULT_CLEAN).map((k) => [k, false])) as unknown as typeof DEFAULT_CLEAN
describe('text-cleaner', () => {
  it('defaults', () => {
    expect(cleanText('  a   b  \n\n\n\nc\u200B\u00A0d ', DEFAULT_CLEAN)).toBe('a b\n\nc d')
  })
  it('individual options', () => {
    expect(cleanText('a\n\nb', { ...none, removeEmptyLines: true })).toBe('a\nb')
    expect(cleanText('a\nb\n\nc', { ...none, removeLineBreaks: true })).toBe('a b c')
    expect(cleanText('“Hi”—it’s…', { ...none, smartQuotes: true })).toBe('"Hi"-it\'s...')
    expect(cleanText('ＡＢＣ１２３！　x', { ...none, fullwidthToHalfwidth: true })).toBe('ABC123! x')
    expect(cleanText('<p>Hi <b>there</b></p><script>x()</script>', { ...none, stripHtml: true })).toBe('Hi there')
    expect(cleanText('\ta', { ...none, tabsToSpaces: true })).toBe('a')
  })
})
