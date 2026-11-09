import TurndownService from 'turndown'
import { renderMarkdown } from '@/tools/markdown-preview/logic'

export interface TurndownOptions {
  headingStyle: 'atx' | 'setext'
  bulletListMarker: '-' | '*' | '+'
  codeBlockStyle: 'fenced' | 'indented'
}

export function htmlToMarkdown(html: string, o: TurndownOptions = { headingStyle: 'atx', bulletListMarker: '-', codeBlockStyle: 'fenced' }): string {
  const td = new TurndownService({ ...o, emDelimiter: '_' })
  td.remove(['script', 'style'])
  // minimal GFM: strikethrough and tables
  td.addRule('strike', { filter: ['del', 's'], replacement: (c) => `~~${c}~~` })
  td.addRule('tableCell', { filter: ['th', 'td'], replacement: (c, node) => `${node.previousSibling ? '' : '|'} ${c.replace(/\n+/g, ' ').trim()} |` })
  td.addRule('tableRow', {
    filter: 'tr',
    replacement: (c, node) => {
      const el = node as HTMLElement
      const isHead = el.parentNode?.nodeName === 'THEAD' || (!el.previousElementSibling && el.parentNode?.parentNode?.nodeName === 'TABLE' && el.querySelector('th'))
      const sep = isHead ? `\n|${Array.from(el.children, () => ' --- |').join('')}` : ''
      return `\n${c}${sep}`
    },
  })
  td.addRule('table', { filter: 'table', replacement: (c) => `\n\n${c.replace(/\n\n+/g, '\n').trim()}\n\n` })
  td.addRule('tableSection', { filter: ['thead', 'tbody', 'tfoot'], replacement: (c) => c })
  return td.turndown(html)
}

export function markdownToHtml(md: string): string {
  return renderMarkdown(md).trim()
}
