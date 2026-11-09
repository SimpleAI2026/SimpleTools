import { DOC_CSS } from '@/lib/htmlPdf'

/** Wrap mammoth HTML for rendering; empty documents get a placeholder paragraph. */
export function wordHtmlDocument(html: string): string {
  return `${DOC_CSS}<div>${html.trim() || '<p>&nbsp;</p>'}</div>`
}
