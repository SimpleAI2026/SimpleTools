import { describe, expect, it } from 'vitest'
import { textToBlocks } from './logic'

describe('text-to-pdf', () => {
  it('splits lines and page breaks', () => {
    expect(textToBlocks('a\r\n\nb\fc', 10)).toEqual([{ text: 'a', size: 10 }, { text: '', size: 10 }, { text: 'b', size: 10 }, { text: '', size: 10, pageBreak: true }, { text: 'c', size: 10 }])
  })
})
