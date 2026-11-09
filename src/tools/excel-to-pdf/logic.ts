export interface TableLayoutOptions {
  /** printable width/height in pt */
  width: number
  height: number
  fontSize: number
  padding: number
  maxColWidth: number
  repeatHeader: boolean
}

export interface TableLayout {
  colWidths: number[] // pt, already scaled
  scale: number
  rowHeight: number
  /** row indices per page (header row index 0 is prepended on later pages when repeatHeader) */
  pages: number[][]
}

/** Column widths from measured text, scaled to fit the page width, then paginated by row height. */
export function layoutTable(rows: string[][], measure: (s: string, fontSize: number) => number, o: TableLayoutOptions): TableLayout {
  const cols = Math.max(1, ...rows.map((r) => r.length))
  const natural = Array.from({ length: cols }, (_, c) => Math.min(o.maxColWidth, Math.max(24, ...rows.map((r) => measure(r[c] ?? '', o.fontSize) + o.padding * 2))))
  const total = natural.reduce((a, b) => a + b, 0)
  const scale = Math.max(0.35, Math.min(1, o.width / total))
  const colWidths = natural.map((w) => w * scale)
  const rowHeight = o.fontSize * scale * 1.8
  const perPage = Math.max(1, Math.floor(o.height / rowHeight))
  const pages: number[][] = []
  let current: number[] = []
  rows.forEach((_, i) => {
    if (current.length === 0 && pages.length > 0 && o.repeatHeader && i !== 0) current.push(0)
    current.push(i)
    if (current.length >= perPage) {
      pages.push(current)
      current = []
    }
  })
  if (current.length && !(current.length === 1 && current[0] === 0 && pages.length)) pages.push(current)
  return { colWidths, scale, rowHeight, pages }
}

/** Truncate text to fit `max` width using the measure function. */
export function fitText(s: string, max: number, measure: (s: string) => number): string {
  if (measure(s) <= max) return s
  let lo = 0
  let hi = s.length
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2)
    if (measure(s.slice(0, mid) + '…') <= max) lo = mid
    else hi = mid - 1
  }
  return lo ? s.slice(0, lo) + '…' : ''
}
