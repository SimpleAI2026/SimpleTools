import { coerce, type SheetData } from '@/lib/excel'

export interface JsonExportOptions {
  header: boolean
  inferTypes: boolean
  skipEmpty: boolean
}

export function sheetToJson(s: SheetData, o: JsonExportOptions): unknown[] {
  const val = (v: string) => (o.inferTypes ? (v === '' ? null : coerce(v)) : v)
  let rows = s.rows
  if (o.skipEmpty) rows = rows.filter((r) => r.some((c) => c !== ''))
  if (!o.header) return rows.map((r) => r.map(val))
  const [head = [], ...body] = rows
  const keys = head.map((h, i) => h.trim() || `column${i + 1}`)
  const width = Math.max(keys.length, ...body.map((r) => r.length))
  for (let i = keys.length; i < width; i++) keys.push(`column${i + 1}`)
  return body.map((r) => Object.fromEntries(keys.map((k, i) => [k, val(r[i] ?? '')])))
}

export function workbookToJson(sheets: SheetData[], o: JsonExportOptions, indent = 2): string {
  if (sheets.length === 1) return JSON.stringify(sheetToJson(sheets[0]!, o), null, indent)
  return JSON.stringify(Object.fromEntries(sheets.map((s) => [s.name, sheetToJson(s, o)])), null, indent)
}
