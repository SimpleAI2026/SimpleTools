import type { PDFDocumentProxy } from 'pdfjs-dist'
import { pageTextItems, type TextItemLite } from './pdf'

export interface PdfLine {
  text: string
  size: number
  y: number
  x: number
}

/** Group text items into visual lines (top-to-bottom). */
export function itemsToLines(items: TextItemLite[]): PdfLine[] {
  const lines: (PdfLine & { parts: { x: number; s: string; w: number }[] })[] = []
  for (const it of items) {
    if (!it.str) continue
    const x = it.transform[4] ?? 0
    const y = it.transform[5] ?? 0
    const size = Math.abs(it.transform[3] ?? 0) || it.height || 10
    const line = lines.find((l) => Math.abs(l.y - y) <= Math.max(2, size * 0.4))
    if (line) {
      line.parts.push({ x, s: it.str, w: it.width })
      line.size = Math.max(line.size, size)
    } else lines.push({ text: '', size, y, x, parts: [{ x, s: it.str, w: it.width }] })
  }
  return lines
    .sort((a, b) => b.y - a.y)
    .map((l) => {
      l.parts.sort((a, b) => a.x - b.x)
      let text = ''
      let end: number | null = null
      for (const p of l.parts) {
        if (end !== null && p.x - end > l.size * 0.25 && !text.endsWith(' ') && !p.s.startsWith(' ')) text += ' '
        text += p.s
        end = p.x + p.w
      }
      return { text: text.replace(/\s+/g, ' ').trim(), size: l.size, y: l.y, x: l.parts[0]!.x }
    })
    .filter((l) => l.text)
}

/** Most common font size, weighted by text length. */
export function bodySize(lines: PdfLine[]): number {
  const m = new Map<number, number>()
  for (const l of lines) m.set(Math.round(l.size), (m.get(Math.round(l.size)) ?? 0) + l.text.length)
  return [...m.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 12
}

const BULLET = /^[•·▪●○◦■□\-–*]\s*/
const NUMBERED = /^(\d+)[.)]\s+/

/** Heuristic Markdown: headings by relative font size, bullets, paragraph breaks by vertical gaps. */
export function linesToMarkdown(pages: PdfLine[][]): string {
  const body = bodySize(pages.flat())
  const out: string[] = []
  for (const lines of pages) {
    let para: string[] = []
    let prev: PdfLine | null = null
    const flush = () => {
      if (para.length) out.push(para.join(/[\u2e80-\u9fff]$/.test(para[0] ?? '') ? '' : ' '))
      para = []
    }
    for (const l of lines) {
      const r = l.size / body
      const level = r >= 1.6 ? 1 : r >= 1.3 ? 2 : r >= 1.12 ? 3 : 0
      const gap = prev ? prev.y - l.y : 0
      if (level) {
        flush()
        out.push(`${'#'.repeat(level)} ${l.text}`)
      } else if (BULLET.test(l.text)) {
        flush()
        out.push(`- ${l.text.replace(BULLET, '')}`)
      } else if (NUMBERED.test(l.text)) {
        flush()
        out.push(l.text.replace(NUMBERED, '$1. '))
      } else {
        if (prev && gap > l.size * 1.9) flush()
        para.push(l.text)
      }
      prev = l
    }
    flush()
  }
  return out.join('\n\n').trim() + '\n'
}

export async function pdfToMarkdown(doc: PDFDocumentProxy, pages: number[]): Promise<string> {
  const all: PdfLine[][] = []
  for (const n of pages) all.push(itemsToLines(await pageTextItems(doc, n)))
  return linesToMarkdown(all)
}
