import { zipSync } from 'fflate'
import { parseCsv, stringifyCsv } from '@/lib/csv'

export const SCHEMA = 'simpletools.workflow/1'
export const MAX_IMPORT_BYTES = 2_000_000
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

export function isNumericLiteral(s: string): boolean {
  return /^[-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?$/.test(s)
}

/** Neutralize spreadsheet formula prefixes. Plain numeric literals stay unchanged. */
export function csvSafeCell(value: unknown): string {
  if (value == null) return ''
  const s = typeof value === 'string' ? value : typeof value === 'number' || typeof value === 'boolean' ? String(value) : JSON.stringify(value)
  if (!s) return ''
  const head = s[0]!
  if (head === '=' || head === '@' || head === '\t' || head === '\r') return `'${s}`
  if ((head === '+' || head === '-') && !isNumericLiteral(s)) return `'${s}`
  return s
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
  const headers = (table[0] ?? []).map((h) => h.trim())
  if (headers.length === 0 || headers.every((h) => !h)) throw new IntakeError('invalid-csv')
  const out: Record<string, string>[] = []
  for (const row of table.slice(1)) {
    if (row.every((cell) => cell.trim() === '')) continue
    const rec: Record<string, string> = {}
    headers.forEach((h, i) => {
      if (h) rec[h] = row[i] ?? ''
    })
    out.push(rec)
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
  const o = value as Record<string, unknown>
  return o.schema === SCHEMA && o.kind === kind && 'input' in o
}

/** Accept raw JSON/CSV or a previous artifact envelope and return the original input. */
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
  return { format: 'csv', value: csvToRecords(trimmed), text: trimmed }
}

export function str(value: unknown): string {
  if (value == null) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  return JSON.stringify(value)
}

export function num(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim() && isNumericLiteral(value.trim())) return Number(value.trim())
  return null
}

export function boolish(value: unknown): boolean | null {
  if (typeof value === 'boolean') return value
  const s = str(value).trim().toLowerCase()
  if (['1', 'true', 'yes', 'y'].includes(s)) return true
  if (['0', 'false', 'no', 'n'].includes(s)) return false
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
    const o = value as Record<string, unknown>
    for (const key of keys) if (Array.isArray(o[key])) return asRecords(o[key])
  }
  throw new IntakeError('bad-input')
}

export function fnv(parts: string[]): string {
  let h = 0x811c9dc5
  const s = parts.join('\u001f')
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return (h >>> 0).toString(16).padStart(8, '0')
}

export function inertText(value: string): string {
  return value.replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch] ?? ch)
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

export function zipTextFiles(entries: { name: string; text: string }[]): Uint8Array {
  const enc = new TextEncoder()
  const files: Record<string, Uint8Array> = {}
  for (const entry of entries) {
    const name = safeZipName(entry.name)
    if (files[name]) throw new IntakeError('bad-input')
    files[name] = enc.encode(entry.text)
  }
  return zipSync(files, { level: 0 })
}

export function safeZipName(name: string): string {
  const cleaned = name.replace(/\\/g, '/').replace(/^\/+/, '')
  const parts = cleaned.split('/').filter((p) => p && p !== '.' && p !== '..')
  if (parts.length === 0) throw new IntakeError('bad-input')
  return parts.join('/')
}

export function sha256Hex(bytes: Uint8Array): string {
  const k = new Uint32Array([
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da, 0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070, 0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ])
  const h = new Uint32Array([0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19])
  const bitLen = bytes.length * 8
  const pad = (bytes.length + 9) % 64 === 0 ? 0 : 64 - ((bytes.length + 9) % 64)
  const data = new Uint8Array(bytes.length + 1 + pad + 8)
  data.set(bytes)
  data[bytes.length] = 0x80
  const view = new DataView(data.buffer)
  view.setUint32(data.length - 4, bitLen >>> 0)
  view.setUint32(data.length - 8, Math.floor(bitLen / 0x100000000))
  const w = new Uint32Array(64)
  for (let off = 0; off < data.length; off += 64) {
    for (let i = 0; i < 16; i++) w[i] = view.getUint32(off + i * 4)
    for (let i = 16; i < 64; i++) {
      const s0 = rotr(w[i - 15]!, 7) ^ rotr(w[i - 15]!, 18) ^ (w[i - 15]! >>> 3)
      const s1 = rotr(w[i - 2]!, 17) ^ rotr(w[i - 2]!, 19) ^ (w[i - 2]! >>> 10)
      w[i] = (w[i - 16]! + s0 + w[i - 7]! + s1) >>> 0
    }
    let [a, b, c, d, e, f, g, hh] = h
    for (let i = 0; i < 64; i++) {
      const S1 = rotr(e!, 6) ^ rotr(e!, 11) ^ rotr(e!, 25)
      const ch = (e! & f!) ^ (~e! & g!)
      const t1 = (hh! + S1 + ch + k[i]! + w[i]!) >>> 0
      const S0 = rotr(a!, 2) ^ rotr(a!, 13) ^ rotr(a!, 22)
      const maj = (a! & b!) ^ (a! & c!) ^ (b! & c!)
      const t2 = (S0 + maj) >>> 0
      hh = g; g = f; f = e; e = (d! + t1) >>> 0; d = c; c = b; b = a; a = (t1 + t2) >>> 0
    }
    h[0] = (h[0]! + a!) >>> 0
    h[1] = (h[1]! + b!) >>> 0
    h[2] = (h[2]! + c!) >>> 0
    h[3] = (h[3]! + d!) >>> 0
    h[4] = (h[4]! + e!) >>> 0
    h[5] = (h[5]! + f!) >>> 0
    h[6] = (h[6]! + g!) >>> 0
    h[7] = (h[7]! + hh!) >>> 0
  }
  return [...h].map((n) => n.toString(16).padStart(8, '0')).join('')
}

function rotr(n: number, s: number): number {
  return (n >>> s) | (n << (32 - s))
}

export function bytesToBase64(bytes: Uint8Array): string {
  let bin = ''
  const chunk = 0x8000
  for (let i = 0; i < bytes.length; i += chunk) bin += String.fromCharCode(...bytes.subarray(i, i + chunk))
  return btoa(bin)
}

export function base64ToBytes(b64: string): Uint8Array {
  const clean = b64.replace(/\s/g, '')
  if (!clean || !/^[A-Za-z0-9+/]*={0,2}$/.test(clean) || clean.length % 4 === 1) throw new IntakeError('bad-input')
  const bin = atob(clean)
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
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
    const r = fn(input)
    const jsonText = JSON.stringify(r.json, null, 2)
    return {
      summary: r.summary,
      jsonText,
      csv: r.csv,
      files: [{ name: 'result.json', text: jsonText }, { name: 'result.csv', text: r.csv }, ...r.files],
      error: '',
    }
  } catch (e) {
    return { summary: '', jsonText: '', csv: '', files: [], error: e instanceof IntakeError ? e.code : 'bad-input' }
  }
}
