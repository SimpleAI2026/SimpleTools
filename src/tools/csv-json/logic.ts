import { parseCsv, stringifyCsv } from '@/lib/csv'

export interface CsvJsonOptions {
  header: boolean
  inferTypes: boolean
  indent: number
}

function infer(v: string): unknown {
  if (v === '') return null
  if (/^-?(0|[1-9]\d*)(\.\d+)?([eE][-+]?\d+)?$/.test(v) && Number.isFinite(Number(v))) return Number(v)
  if (v === 'true' || v === 'false') return v === 'true'
  return v
}

export function csvToJson(text: string, o: CsvJsonOptions): string {
  const { rows } = parseCsv(text)
  const val = (v: string) => (o.inferTypes ? infer(v) : v)
  if (!o.header) return JSON.stringify(rows.map((r) => r.map(val)), null, o.indent)
  const [head = [], ...body] = rows
  const keys = head.map((h, i) => h.trim() || `column${i + 1}`)
  return JSON.stringify(body.map((r) => Object.fromEntries(keys.map((k, i) => [k, val(r[i] ?? '')]))), null, o.indent)
}

/** Flatten nested objects into dot-separated keys; arrays are JSON encoded. */
export function flatten(obj: unknown, prefix = '', out: Record<string, unknown> = {}): Record<string, unknown> {
  if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
    const entries = Object.entries(obj)
    if (!entries.length && prefix) out[prefix] = ''
    for (const [k, v] of entries) flatten(v, prefix ? `${prefix}.${k}` : k, out)
  } else out[prefix || 'value'] = obj
  return out
}

const cell = (v: unknown) => (v === null || v === undefined ? '' : typeof v === 'object' ? JSON.stringify(v) : String(v))

export function jsonToCsv(json: string, delimiter = ','): string {
  const data: unknown = JSON.parse(json)
  const arr = Array.isArray(data) ? data : [data]
  if (arr.every(Array.isArray)) return stringifyCsv((arr as unknown[][]).map((r) => r.map(cell)), delimiter)
  const flat = arr.map((x) => flatten(x))
  const keys: string[] = []
  for (const f of flat) for (const k of Object.keys(f)) if (!keys.includes(k)) keys.push(k)
  return stringifyCsv([keys, ...flat.map((f) => keys.map((k) => cell(f[k])))], delimiter)
}
