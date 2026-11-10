import { parseCsv, stringifyCsv } from '@/lib/csv'

export const SCHEMA = 'simpletools.workflow/1'
export const MAX_TEXT_CHARS = 1_500_000
export const MAX_ROWS = 20_000
export const MAX_JSON_DEPTH = 32

export class IntakeError extends Error {
  readonly code: string
  constructor(code: string) {
    super(code)
    this.name = 'IntakeError'
    this.code = code
  }
}

export function assertTextSize(text: string): void {
  if (text.length > MAX_TEXT_CHARS) throw new IntakeError('too-large')
}

export function parseJsonValue(text: string): unknown {
  assertTextSize(text)
  const trimmed = text.trim()
  if (!trimmed) throw new IntakeError('empty')
  let value: unknown
  try {
    value = JSON.parse(trimmed) as unknown
  } catch {
    throw new IntakeError('invalid-json')
  }
  rejectDanger(value, 0)
  return value
}

function rejectDanger(value: unknown, depth: number): void {
  if (depth > MAX_JSON_DEPTH) throw new IntakeError('too-deep')
  if (!value || typeof value !== 'object') return
  if (Array.isArray(value)) {
    if (value.length > MAX_ROWS) throw new IntakeError('too-many-rows')
    for (const item of value) rejectDanger(item, depth + 1)
    return
  }
  for (const key of Object.keys(value)) {
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') throw new IntakeError('forbidden-key')
    rejectDanger((value as Record<string, unknown>)[key], depth + 1)
  }
}

function isNumericLiteral(value: string): boolean {
  return /^[-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?$/.test(value)
}

export function csvSafeCell(value: unknown): string {
  if (value == null) return ''
  const text = typeof value === 'string' ? value : typeof value === 'number' || typeof value === 'boolean' ? String(value) : JSON.stringify(value)
  if (!text) return ''
  const head = text[0]!
  if (head === '=' || head === '@' || head === '\t' || head === '\r') return `'${text}`
  if ((head === '+' || head === '-') && !isNumericLiteral(text)) return `'${text}`
  return text
}

export function toCsv(headers: string[], rows: unknown[][]): string {
  const body = [headers, ...rows].map((row) => row.map((cell) => csvSafeCell(cell)))
  return `\uFEFF${stringifyCsv(body)}`
}

export function csvToRecords(text: string): Record<string, string>[] {
  assertTextSize(text)
  if (!text.trim()) throw new IntakeError('empty')
  let table: string[][]
  try {
    table = parseCsv(text).rows
  } catch {
    throw new IntakeError('invalid-csv')
  }
  if (table.length === 0 || table.every((row) => row.every((cell) => cell.trim() === ''))) throw new IntakeError('empty')
  if (table.length - 1 > MAX_ROWS) throw new IntakeError('too-many-rows')
  const headers = (table[0] ?? []).map((header) => header.trim())
  if (headers.length === 0 || headers.every((header) => !header)) throw new IntakeError('invalid-csv')
  const out: Record<string, string>[] = []
  for (const row of table.slice(1)) {
    if (row.every((cell) => cell.trim() === '')) continue
    const record: Record<string, string> = {}
    headers.forEach((header, index) => {
      if (header) record[header] = row[index] ?? ''
    })
    out.push(record)
  }
  return out
}

export interface LoadedDoc {
  format: 'json' | 'csv'
  value: unknown
  text: string
}

function isEnvelope(value: unknown, kind: string): value is { input: unknown } {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const object = value as Record<string, unknown>
  return object.schema === SCHEMA && object.kind === kind && 'input' in object
}

export function readDocument(text: string, kind: string): LoadedDoc {
  assertTextSize(text)
  const trimmed = text.trim()
  if (!trimmed) throw new IntakeError('empty')
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    let value = parseJsonValue(trimmed)
    if (isEnvelope(value, kind)) value = value.input
    if (typeof value === 'string') {
      const inner = value.trim()
      if (!inner) throw new IntakeError('empty')
      if (inner.startsWith('{') || inner.startsWith('[')) return { format: 'json', value: parseJsonValue(inner), text: inner }
      return { format: 'csv', value: csvToRecords(inner), text: inner }
    }
    return { format: 'json', value, text: trimmed }
  }
  return { format: 'csv', value: csvToRecords(trimmed), text }
}

export function str(value: unknown): string {
  if (value == null) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  return JSON.stringify(value)
}

export function num(value: unknown): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  if (typeof value === 'string' && value.trim() && isNumericLiteral(value.trim())) return Number(value.trim())
  return null
}

export function asRecords(value: unknown): Record<string, unknown>[] {
  if (Array.isArray(value)) {
    return value.map((item) => {
      if (!item || typeof item !== 'object' || Array.isArray(item)) throw new IntakeError('bad-input')
      return item as Record<string, unknown>
    })
  }
  throw new IntakeError('bad-input')
}

export function listFrom(value: unknown, keys: string[]): Record<string, unknown>[] {
  if (Array.isArray(value)) return asRecords(value)
  if (value && typeof value === 'object') {
    const object = value as Record<string, unknown>
    for (const key of keys) if (Array.isArray(object[key])) return asRecords(object[key])
  }
  throw new IntakeError('bad-input')
}

export function rootObject(text: string, kind: string): Record<string, unknown> {
  const doc = readDocument(text, kind)
  if (doc.format === 'csv' || !doc.value || typeof doc.value !== 'object' || Array.isArray(doc.value)) throw new IntakeError('bad-input')
  return doc.value as Record<string, unknown>
}

export function rowsOf(text: string, kind: string, keys: string[]): { rows: Record<string, unknown>[]; extra: Record<string, unknown> } {
  const doc = readDocument(text, kind)
  if (doc.format === 'csv') return { rows: asRecords(doc.value), extra: {} }
  if (Array.isArray(doc.value)) return { rows: asRecords(doc.value), extra: {} }
  if (doc.value && typeof doc.value === 'object') {
    const extra = doc.value as Record<string, unknown>
    return { rows: listFrom(extra, keys), extra }
  }
  throw new IntakeError('bad-input')
}

export function fnv(parts: string[]): string {
  let hash = 0x811c9dc5
  const text = parts.join('\u001f')
  for (let index = 0; index < text.length; index++) {
    hash ^= text.charCodeAt(index)
    hash = Math.imul(hash, 0x01000193)
  }
  return (hash >>> 0).toString(16).padStart(8, '0')
}

export interface WorkflowResult {
  summary: string
  json: unknown
  csv: string
  files: { name: string; text: string }[]
}

export function finish(
  kind: string,
  input: unknown,
  summary: string,
  result: unknown,
  headers: string[],
  rows: unknown[][],
  files: { name: string; text: string }[] = [],
): WorkflowResult {
  const json = { schema: SCHEMA, kind, summary, input, result }
  return { summary, json, csv: toCsv(headers, rows), files }
}

export interface Presented {
  summary: string
  jsonText: string
  csv: string
  files: { name: string; text: string }[]
  error: string
}

export function presentResult(fn: (input: string) => WorkflowResult, input: string): Presented {
  try {
    const result = fn(input)
    const jsonText = JSON.stringify(result.json, null, 2)
    return {
      summary: result.summary,
      jsonText,
      csv: result.csv,
      files: [{ name: 'result.json', text: jsonText }, { name: 'result.csv', text: result.csv }, ...result.files],
      error: '',
    }
  } catch (error) {
    return { summary: '', jsonText: '', csv: '', files: [], error: error instanceof IntakeError ? error.code : 'bad-input' }
  }
}
