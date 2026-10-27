import { describe, expect, it } from 'vitest'
import { markdownToDocx } from '@/tools/word-creator/logic'
import { cleanDocxHtml, docxToMarkdown } from './logic'

describe('word-to-markdown', () => {
  it('cleans html', () => {
    expect(cleanDocxHtml('<p><a id="_x"></a>a<img src="data:x"></p>', { stripImages: true })).toBe('<p>a</p>')
  })
  it('round trips markdown through docx', async () => {
    const blob = await markdownToDocx('# Title\n\nSome **bold** text.\n\n- item\n\n| a | b |\n|---|---|\n| 1 | 2 |', { font: 'Arial', fontSize: 11, title: 'x' })
    const { markdown } = await docxToMarkdown(await blob.arrayBuffer(), { stripImages: true })
    expect(markdown).toContain('# Title')
    expect(markdown).toContain('**bold**')
    expect(markdown).toMatch(/-\s+item/)
    expect(markdown).toContain('| **a** | **b** |\n| --- | --- |\n| 1 | 2 |')
  })
})
