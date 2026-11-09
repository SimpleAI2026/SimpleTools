export type JsonType = 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null'

export function typeOf(v: unknown): JsonType {
  if (v === null) return 'null'
  if (Array.isArray(v)) return 'array'
  return typeof v as JsonType
}

/** JSONPath-like path segment: `.key`, `["weird key"]`, `[0]`. */
export function childPath(parent: string, key: string | number): string {
  if (typeof key === 'number') return `${parent}[${key}]`
  return /^[A-Za-z_$][\w$]*$/.test(key) ? `${parent}.${key}` : `${parent}[${JSON.stringify(key)}]`
}

export interface JsonStats {
  objects: number
  arrays: number
  values: number
  maxDepth: number
}

export function jsonStats(v: unknown, depth = 1): JsonStats {
  const t = typeOf(v)
  if (t !== 'object' && t !== 'array') return { objects: 0, arrays: 0, values: 1, maxDepth: depth - 1 }
  const children = t === 'array' ? (v as unknown[]) : Object.values(v as object)
  return children.reduce<JsonStats>(
    (acc, c) => {
      const s = jsonStats(c, depth + 1)
      return { objects: acc.objects + s.objects, arrays: acc.arrays + s.arrays, values: acc.values + s.values, maxDepth: Math.max(acc.maxDepth, s.maxDepth) }
    },
    { objects: t === 'object' ? 1 : 0, arrays: t === 'array' ? 1 : 0, values: 0, maxDepth: depth },
  )
}

/** Paths of all nodes whose key or primitive value contains the query (case-insensitive). */
export function searchJson(v: unknown, query: string, path = '$', out: string[] = [], limit = 500): string[] {
  const q = query.toLowerCase()
  if (!q || out.length >= limit) return out
  const t = typeOf(v)
  if (t === 'object' || t === 'array') {
    const entries: [string | number, unknown][] = t === 'array' ? (v as unknown[]).map((x, i) => [i, x]) : Object.entries(v as object)
    for (const [k, c] of entries) {
      const p = childPath(path, k)
      if (typeof k === 'string' && k.toLowerCase().includes(q)) out.push(p)
      else if (typeOf(c) !== 'object' && typeOf(c) !== 'array' && String(c).toLowerCase().includes(q)) out.push(p)
      searchJson(c, query, p, out, limit)
    }
  }
  return out
}
