import { describe, expect, it } from 'vitest'
import { markdownToBlocks } from './logic'

describe('pdf-creator', () => {
  it('parses markdown-lite', () => {
    const b = markdownToBlocks('# Title\n\nHello **world**\nagain\n\n- a\n1. b\n> q\n---\n\\pagebreak', 10)
    expect(b.map((x) => [x.text, x.size, !!x.bold])).toEqual([
      ['Title', 20, true], ['Hello world again', 10, false], ['• a', 10, false], ['1. b', 10, false], ['q', 10, false], ['', 10, false], ['', 10, false],
    ])
    expect(b[5]!.rule).toBe(true)
    expect(b[6]!.pageBreak).toBe(true)
  })
})
