export { renderMarkdown, wrapHtmlDocument } from '@/tools/markdown-preview/logic'
import { renderMarkdown, wrapHtmlDocument } from '@/tools/markdown-preview/logic'

/** First heading text, used as the document title. */
export function guessTitle(md: string): string {
  return /^#{1,6}\s+(.+)$/m.exec(md)?.[1]?.trim() ?? 'Document'
}

export function mdToHtml(md: string, fullDocument: boolean, sanitize: (html: string) => string = (h) => h): string {
  const body = sanitize(renderMarkdown(md)).trim()
  return fullDocument ? wrapHtmlDocument(body, guessTitle(md)) : body
}
