export type JsonResult =
  | { ok: true; output: string }
  | { ok: false; message: string; line?: number; column?: number }

/** Convert a character offset into 1-based line/column. */
export function offsetToLineColumn(text: string, offset: number): { line: number; column: number } {
  const before = text.slice(0, Math.max(0, offset))
  const lines = before.split('\n')
  return { line: lines.length, column: (lines[lines.length - 1]?.length ?? 0) + 1 }
}

function extractPosition(message: string, text: string): { line?: number; column?: number } {
  const lc = /line (\d+) column (\d+)/i.exec(message)
  if (lc) return { line: Number(lc[1]), column: Number(lc[2]) }
  const pos = /position (\d+)/i.exec(message)
  if (pos) return offsetToLineColumn(text, Number(pos[1]))
  return {}
}

function parse(text: string): { ok: true; value: unknown } | { ok: false; message: string; line?: number; column?: number } {
  if (text.trim() === '') return { ok: false, message: 'empty' }
  try {
    return { ok: true, value: JSON.parse(text) as unknown }
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    return { ok: false, message, ...extractPosition(message, text) }
  }
}

function sortDeep(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortDeep)
  if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>
    return Object.fromEntries(
      Object.keys(obj)
        .sort()
        .map((k) => [k, sortDeep(obj[k])]),
    )
  }
  return value
}

export function formatJson(text: string, indent: number | 'tab' = 2, sortKeys = false): JsonResult {
  const r = parse(text)
  if (!r.ok) return r
  const value = sortKeys ? sortDeep(r.value) : r.value
  return { ok: true, output: JSON.stringify(value, null, indent === 'tab' ? '\t' : indent) }
}

export function minifyJson(text: string): JsonResult {
  const r = parse(text)
  if (!r.ok) return r
  return { ok: true, output: JSON.stringify(r.value) }
}
