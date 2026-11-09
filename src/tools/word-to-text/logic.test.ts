import { describe, expect, it } from 'vitest'
import { docxToText } from '@/lib/word'
import { markdownToDocx } from '@/tools/word-creator/logic'
import { tidyText } from './logic'

describe('word-to-text', () => {
  it('tidies', () => {
    expect(tidyText('  a  \r\n\n\n\n b', { collapseBlankLines: true, trimLines: true })).toBe('a\n\nb')
    expect(tidyText('a\n\n\n\nb', { collapseBlankLines: false, trimLines: false })).toBe('a\n\n\n\nb')
  })
  it('extracts text from docx', async () => {
    const blob = await markdownToDocx('# Head\n\nBody 中文', { font: 'Arial', fontSize: 11, title: 'x' })
    const text = tidyText(await docxToText(await blob.arrayBuffer()), { collapseBlankLines: true, trimLines: true })
    expect(text).toBe('Head\n\nBody 中文')
  })
})
