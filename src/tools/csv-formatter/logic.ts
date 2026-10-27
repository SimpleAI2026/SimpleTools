import { parseCsv, stringifyCsv } from '@/lib/csv'

export type CsvOutput = 'csv' | 'markdown' | 'aligned'

export interface CsvFormatOptions {
  inDelimiter: string
  outDelimiter: string
  output: CsvOutput
  quoteAll: boolean
  trim: boolean
}

/** Display width: CJK / full-width characters take two columns. */
export function displayWidth(s: string): number {
  let w = 0
  for (const ch of s) w += /[\u1100-\u115f\u2e80-\ua4cf\uac00-\ud7a3\uf900-\ufaff\ufe30-\ufe4f\uff00-\uff60\uffe0-\uffe6]/.test(ch) ? 2 : 1
  return w
}

const pad = (s: string, w: number) => s + ' '.repeat(Math.max(0, w - displayWidth(s)))

export function formatCsv(text: string, o: CsvFormatOptions): { text: string; rows: number; cols: number } {
  let { rows } = parseCsv(text, o.inDelimiter)
  if (o.trim) rows = rows.map((r) => r.map((c) => c.trim()))
  const cols = Math.max(0, ...rows.map((r) => r.length))
  rows = rows.map((r) => [...r, ...Array<string>(cols - r.length).fill('')])
  const widths = Array.from({ length: cols }, (_, i) => Math.max(3, ...rows.map((r) => displayWidth(r[i]!))))
  let out: string
  if (o.output === 'csv') out = stringifyCsv(rows, o.outDelimiter, o.quoteAll)
  else if (o.output === 'aligned') out = rows.map((r) => r.map((c, i) => pad(c, widths[i]!)).join('  ').trimEnd()).join('\n')
  else {
    const esc = (c: string) => c.replace(/\|/g, '\\|').replace(/\n/g, '<br>')
    const line = (r: string[]) => `| ${r.map((c, i) => pad(esc(c), widths[i]!)).join(' | ')} |`
    out = rows.length ? [line(rows[0]!), `| ${widths.map((w) => '-'.repeat(w)).join(' | ')} |`, ...rows.slice(1).map(line)].join('\n') : ''
  }
  return { text: out, rows: rows.length, cols }
}
