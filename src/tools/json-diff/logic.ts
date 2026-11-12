export type DiffKind = 'added' | 'removed' | 'changed'

export interface JsonChange {
  path: string
  kind: DiffKind
  before?: unknown
  after?: unknown
}

export function jsonPath(parent: string, key: string | number): string {
  if (typeof key === 'number') return `${parent}[${key}]`
  return /^[A-Za-z_$][\w$]*$/.test(key) ? `${parent}.${key}` : `${parent}[${JSON.stringify(key)}]`
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function diffJson(left: unknown, right: unknown, path = '$', out: JsonChange[] = [], limit = 500): JsonChange[] {
  if (out.length >= limit) return out
  if (Object.is(left, right)) return out
  if (Array.isArray(left) && Array.isArray(right)) {
    const length = Math.max(left.length, right.length)
    for (let i = 0; i < length && out.length < limit; i++) {
      if (i >= left.length) out.push({ path: jsonPath(path, i), kind: 'added', after: right[i] })
      else if (i >= right.length) out.push({ path: jsonPath(path, i), kind: 'removed', before: left[i] })
      else diffJson(left[i], right[i], jsonPath(path, i), out, limit)
    }
    return out
  }
  if (isObject(left) && isObject(right)) {
    const keys = [...new Set([...Object.keys(left), ...Object.keys(right)])]
    for (const key of keys) {
      if (out.length >= limit) break
      const hasLeft = Object.prototype.hasOwnProperty.call(left, key)
      const hasRight = Object.prototype.hasOwnProperty.call(right, key)
      if (!hasLeft) out.push({ path: jsonPath(path, key), kind: 'added', after: right[key] })
      else if (!hasRight) out.push({ path: jsonPath(path, key), kind: 'removed', before: left[key] })
      else diffJson(left[key], right[key], jsonPath(path, key), out, limit)
    }
    return out
  }
  out.push({ path, kind: 'changed', before: left, after: right })
  return out
}

export function formatValue(value: unknown): string {
  if (typeof value === 'undefined') return 'undefined'
  return JSON.stringify(value)
}

export function formatDiff(changes: JsonChange[]): string {
  const mark = { added: '+', removed: '-', changed: '~' }
  return changes
    .map((change) => {
      if (change.kind === 'added') return `+ ${change.path}: ${formatValue(change.after)}`
      if (change.kind === 'removed') return `- ${change.path}: ${formatValue(change.before)}`
      return `${mark.changed} ${change.path}: ${formatValue(change.before)} => ${formatValue(change.after)}`
    })
    .join('\n')
}

export function parseJsonSide(text: string): { ok: true; value: unknown } | { ok: false; message: string } {
  const trimmed = text.trim()
  if (!trimmed) return { ok: false, message: 'empty' }
  try {
    return { ok: true, value: JSON.parse(trimmed) as unknown }
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : 'invalid' }
  }
}
