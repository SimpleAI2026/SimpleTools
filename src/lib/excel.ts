import type { CellValue, Workbook } from 'exceljs'
import { parseCsv } from './csv'

/** exceljs (browser build) loaded on demand. */
export async function loadExcel() {
  const m = await import('exceljs')
  return ((m as unknown as { default?: typeof m }).default ?? m) as typeof import('exceljs')
}

export interface SheetData {
  name: string
  rows: string[][]
}

const pad = (n: number) => String(n).padStart(2, '0')

export function cellText(v: CellValue): string {
  if (v === null || v === undefined) return ''
  if (v instanceof Date) {
    const d = `${v.getUTCFullYear()}-${pad(v.getUTCMonth() + 1)}-${pad(v.getUTCDate())}`
    const hasTime = v.getUTCHours() || v.getUTCMinutes() || v.getUTCSeconds()
    return hasTime ? `${d} ${pad(v.getUTCHours())}:${pad(v.getUTCMinutes())}:${pad(v.getUTCSeconds())}` : d
  }
  if (typeof v !== 'object') return String(v)
  if ('richText' in v) return v.richText.map((r) => r.text).join('')
  if ('formula' in v || 'sharedFormula' in v) return cellText((v as { result?: CellValue }).result ?? null)
  if ('hyperlink' in v) return String((v as { text?: unknown }).text ?? v.hyperlink)
  if ('error' in v) return String(v.error)
  return ''
}

export function workbookToSheets(wb: Workbook): SheetData[] {
  const out: SheetData[] = []
  wb.eachSheet((ws) => {
    const rows: string[][] = []
    const cols = ws.actualColumnCount ? ws.columnCount : 0
    for (let r = 1; r <= ws.rowCount; r++) {
      const row = ws.getRow(r)
      const cells: string[] = []
      for (let c = 1; c <= cols; c++) cells.push(cellText(row.getCell(c).value))
      rows.push(cells)
    }
    while (rows.length && rows[rows.length - 1]!.every((c) => c === '')) rows.pop()
    out.push({ name: ws.name, rows })
  })
  return out
}

/** Read .xlsx (via exceljs) or .csv/.tsv/.txt (via papaparse) into plain string grids. */
export async function readSpreadsheet(data: ArrayBuffer, fileName: string): Promise<SheetData[]> {
  if (/\.(csv|tsv|txt)$/i.test(fileName)) {
    const text = new TextDecoder().decode(data)
    return [{ name: fileName.replace(/\.[^.]+$/, '').slice(0, 31) || 'Sheet1', rows: parseCsv(text).rows }]
  }
  if (/\.xls$/i.test(fileName)) throw new Error('Legacy .xls is not supported; please save as .xlsx')
  const ExcelJS = await loadExcel()
  const wb = new ExcelJS.Workbook()
  await wb.xlsx.load(data)
  return workbookToSheets(wb)
}

export type CellInput = string | number | boolean | Date | null

/** Excel sheet names: ≤31 chars, no []:*?/\ and unique (case-insensitive). */
export function safeSheetName(name: string, used: Set<string>): string {
  const base = (name.replace(/[[\]:*?/\\]/g, '_').trim() || 'Sheet').slice(0, 31)
  let n = base
  for (let i = 2; used.has(n.toLowerCase()); i++) n = `${base.slice(0, 31 - String(i).length - 1)}_${i}`
  used.add(n.toLowerCase())
  return n
}

/** Convert numeric-looking strings to numbers (keeps leading zeros / long ids as text). */
export function coerce(v: string): CellInput {
  const t = v.trim()
  if (/^-?(0|[1-9]\d{0,14})(\.\d+)?$/.test(t)) return Number(t)
  if (/^(true|false)$/i.test(t)) return t.toLowerCase() === 'true'
  return v
}

export interface SheetInput {
  name: string
  rows: CellInput[][]
  /** bold + freeze first row */
  header?: boolean
}

export async function buildWorkbook(sheets: SheetInput[]): Promise<Uint8Array> {
  const ExcelJS = await loadExcel()
  const wb = new ExcelJS.Workbook()
  wb.creator = 'SimpleTools'
  const used = new Set<string>()
  for (const s of sheets) {
    const ws = wb.addWorksheet(safeSheetName(s.name, used), s.header ? { views: [{ state: 'frozen', ySplit: 1 }] } : undefined)
    ws.addRows(s.rows)
    if (s.header && s.rows.length) ws.getRow(1).font = { bold: true }
    const widths: number[] = []
    for (const r of s.rows) r.forEach((c, i) => (widths[i] = Math.max(widths[i] ?? 6, Math.min(60, String(c ?? '').length + 2))))
    widths.forEach((w, i) => (ws.getColumn(i + 1).width = w))
  }
  return new Uint8Array(await wb.xlsx.writeBuffer())
}

export const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
export const SPREADSHEET_ACCEPT = '.xlsx,.csv,.tsv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv'
