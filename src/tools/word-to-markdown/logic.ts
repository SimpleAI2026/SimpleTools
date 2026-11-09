import { docxToHtml } from '@/lib/word'
import { htmlToMarkdown } from '@/tools/html-markdown/logic'

export interface WordMdOptions {
  /** drop embedded images (mammoth inlines them as base64 data URIs, which bloats Markdown) */
  stripImages: boolean
}

export function cleanDocxHtml(html: string, o: WordMdOptions): string {
  let h = html.replace(/<a id="[^"]*"><\/a>/g, '') // bookmark anchors
  if (o.stripImages) h = h.replace(/<img[^>]*>/g, '')
  return h
}

export async function docxToMarkdown(data: ArrayBuffer, o: WordMdOptions): Promise<{ markdown: string; warnings: string[] }> {
  const r = await docxToHtml(data)
  return { markdown: htmlToMarkdown(cleanDocxHtml(r.html, o)), warnings: r.warnings }
}
