import type { PDFDocumentProxy } from 'pdfjs-dist'
import { buildMatcher, findMatchRects, type MatchOptions, type RedactRect } from '@/lib/redact'
export { redactPdf, canvasRedactor } from '@/lib/redact'

/** Built-in patterns (regex). */
export const PRESETS: Record<string, string> = {
  email: String.raw`[\w.+-]+@[\w-]+(?:\.[\w-]+)+`,
  phoneCN: String.raw`(?<!\d)1[3-9]\d{9}(?!\d)`,
  phone: String.raw`\+?\d[\d\s().-]{7,}\d`,
  idCN: String.raw`(?<!\d)\d{17}[\dXx](?!\d)`,
  card: String.raw`(?<!\d)(?:\d[ -]?){13,19}(?!\d)`,
  ssn: String.raw`(?<!\d)\d{3}-\d{2}-\d{4}(?!\d)`,
  ip: String.raw`(?<!\d)(?:\d{1,3}\.){3}\d{1,3}(?!\d)`,
}

export type Match = RedactRect & { text: string }

export async function collectMatches(doc: PDFDocumentProxy, pages: number[], terms: string[], presets: string[], o: MatchOptions): Promise<Match[]> {
  const plain = buildMatcher(terms, o)
  const pre = presets.length ? buildMatcher(presets.map((p) => PRESETS[p]!).filter(Boolean), { ...o, regex: true, wholeWord: false }) : null
  const out: Match[] = []
  for (const n of pages) {
    const page = await doc.getPage(n)
    for (const re of [plain, pre]) if (re) out.push(...(await findMatchRects(page, n, re, o.padding)))
  }
  return out
}
