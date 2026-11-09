import type { PDFDocumentProxy } from 'pdfjs-dist'
import { pageTextItems, type TextItemLite } from '@/lib/pdf'
import { coerce, type CellInput, type SheetInput } from '@/lib/excel'

interface Cell {
  x: number
  end: number
  text: string
}

/** Cluster positioned text into a table: rows by baseline, columns by left edges shared across rows. */
export function itemsToTable(items: TextItemLite[], gapFactor = 0.8): string[][] {
  const lines: { y: number; size: number; cells: Cell[] }[] = []
  for (const it of items) {
    if (!it.str.trim()) continue
    const x = it.transform[4] ?? 0
    const y = it.transform[5] ?? 0
    const size = Math.abs(it.transform[3] ?? 0) || it.height || 10
    let line = lines.find((l) => Math.abs(l.y - y) <= size * 0.4)
    if (!line) lines.push((line = { y, size, cells: [] }))
    line.cells.push({ x, end: x + it.width, text: it.str })
  }
  lines.sort((a, b) => b.y - a.y)
  // merge items within a line separated by small gaps (same cell)
  for (const l of lines) {
    l.cells.sort((a, b) => a.x - b.x)
    const merged: Cell[] = []
    for (const c of l.cells) {
      const last = merged[merged.length - 1]
      if (last && c.x - last.end < l.size * gapFactor) {
        last.text += (c.x - last.end > l.size * 0.15 ? ' ' : '') + c.text
        last.end = Math.max(last.end, c.end)
      } else merged.push({ ...c })
    }
    l.cells = merged
  }
  // column anchors: cluster left edges
  const xs = lines.flatMap((l) => l.cells.map((c) => c.x)).sort((a, b) => a - b)
  const cols: number[] = []
  for (const x of xs) if (!cols.length || x - cols[cols.length - 1]! > 6) cols.push(x)
  return lines.map((l) => {
    const row: string[] = Array<string>(cols.length).fill('')
    for (const c of l.cells) {
      let idx = 0
      for (let i = 0; i < cols.length; i++) if (cols[i]! <= c.x + 6) idx = i
      row[idx] = row[idx] ? `${row[idx]} ${c.text.trim()}` : c.text.trim()
    }
    return row
  })
}

/** Drop columns that are empty in every row. */
export function compactColumns(rows: string[][]): string[][] {
  const width = Math.max(0, ...rows.map((r) => r.length))
  const keep = Array.from({ length: width }, (_, i) => rows.some((r) => (r[i] ?? '').trim()))
  return rows.map((r) => r.filter((_, i) => keep[i]))
}

export async function pdfToSheets(doc: PDFDocumentProxy, pages: number[], mode: 'per-page' | 'single', convertNumbers: boolean): Promise<SheetInput[]> {
  const conv = (rows: string[][]): CellInput[][] => rows.map((r) => r.map((v) => (convertNumbers ? coerce(v) : v)))
  const all: string[][][] = []
  for (const n of pages) all.push(compactColumns(itemsToTable(await pageTextItems(doc, n))))
  if (mode === 'single') return [{ name: 'PDF', rows: conv(all.flat()) }]
  return all.map((rows, i) => ({ name: `Page ${pages[i]}`, rows: conv(rows) }))
}
