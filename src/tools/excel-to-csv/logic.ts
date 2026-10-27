import { stringifyCsv } from '@/lib/csv'
import type { SheetData } from '@/lib/excel'

export interface CsvExportOptions {
  delimiter: string
  bom: boolean
}

export function sheetToCsv(s: SheetData, o: CsvExportOptions): string {
  const cols = Math.max(0, ...s.rows.map((r) => r.length))
  const rows = s.rows.map((r) => [...r, ...Array<string>(cols - r.length).fill('')])
  return (o.bom ? '\uFEFF' : '') + stringifyCsv(rows, o.delimiter)
}

export function csvFileName(base: string, sheet: string, delimiter: string, multiple: boolean): string {
  const ext = delimiter === '\t' ? 'tsv' : 'csv'
  return multiple ? `${base}-${sheet.replace(/[\\/:*?"<>|]/g, '_')}.${ext}` : `${base}.${ext}`
}
