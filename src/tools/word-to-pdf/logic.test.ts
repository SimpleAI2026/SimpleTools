import { describe, expect, it } from 'vitest'
import { Document, Packer, Paragraph } from 'docx'
import { docxToHtml } from '@/lib/word'
import { wordHtmlDocument } from './logic'

describe('word-to-pdf', () => {
  it('wraps converted docx html', async () => {
    const buf = await Packer.toBuffer(new Document({ sections: [{ children: [new Paragraph('Hello Word')] }] }))
    const { html } = await docxToHtml(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer)
    expect(wordHtmlDocument(html)).toContain('<p>Hello Word</p>')
    expect(wordHtmlDocument('')).toContain('&nbsp;')
  })
})
