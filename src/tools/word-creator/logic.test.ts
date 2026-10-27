import { describe, expect, it } from 'vitest'
import { docxToHtml, docxToText } from '@/lib/word'
import { markdownToDocx } from './logic'

describe('word-creator', () => {
  it('builds a docx that mammoth can read back', async () => {
    const md = '# Title\n\nHello **bold** and _it_ [link](https://x.y).\n\n- one\n- two\n\n1. first\n\n| a | b |\n|---|---|\n| 1 | 2 |\n\n```\ncode line\n```\n'
    const blob = await markdownToDocx(md, { font: 'Calibri', fontSize: 11, title: 'T' })
    const buf = await blob.arrayBuffer()
    const { html } = await docxToHtml(buf)
    expect(html).toContain('<h1>Title</h1>')
    expect(html).toContain('<strong>bold</strong>')
    expect(html).toContain('<table>')
    expect(html).toContain('href="https://x.y"')
    const text = await docxToText(buf)
    expect(text).toContain('code line')
    expect(text).toContain('two')
  })
})
