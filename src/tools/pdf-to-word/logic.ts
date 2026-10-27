import type { PDFDocumentProxy } from 'pdfjs-dist'
import { pdfToMarkdown } from '@/lib/pdfMarkdown'
import { markdownToDocx, type DocOptions } from '@/tools/word-creator/logic'

/** PDF text → heuristic Markdown → editable .docx (headings, lists, paragraphs). */
export async function pdfToDocx(doc: PDFDocumentProxy, pages: number[], o: DocOptions): Promise<{ blob: Blob; markdown: string }> {
  const markdown = await pdfToMarkdown(doc, pages)
  return { blob: await markdownToDocx(markdown, o), markdown }
}
