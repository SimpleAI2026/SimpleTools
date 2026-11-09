import { describe, expect, it } from 'vitest'
import { htmlToMarkdown, markdownToHtml } from './logic'

describe('html-markdown', () => {
  it('html → md', () => {
    expect(htmlToMarkdown('<h1>T</h1><p>a <strong>b</strong> <em>c</em> <del>d</del></p><ul><li>x</li></ul><script>bad()</script>')).toBe('# T\n\na **b** _c_ ~~d~~\n\n-   x')
  })
  it('tables', () => {
    expect(htmlToMarkdown('<table><thead><tr><th>a</th><th>b</th></tr></thead><tbody><tr><td>1</td><td>2</td></tr></tbody></table>')).toBe('| a | b |\n| --- | --- |\n| 1 | 2 |')
  })
  it('md → html', () => expect(markdownToHtml('**x**')).toBe('<p><strong>x</strong></p>'))
})
