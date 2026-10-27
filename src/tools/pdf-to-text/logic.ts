import type { PDFDocumentProxy } from 'pdfjs-dist'
import { pageText } from '@/lib/pdf'

export async function extractPdfText(doc: PDFDocumentProxy, pages: number[], separators: boolean): Promise<string> {
  const parts: string[] = []
  for (const n of pages) {
    const t = await pageText(doc, n)
    parts.push(separators ? `----- ${n} -----\n${t}` : t)
  }
  return parts.join('\n\n')
}
