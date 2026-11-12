import db from 'mime-db'

export interface MimeHit {
  type: string
  extensions: string[]
  compressible: boolean | null
  charset: string
}

const ENTRIES = Object.entries(db).map(([type, entry]) => ({
  type,
  extensions: [...(entry.extensions ?? [])],
  compressible: entry.compressible ?? null,
  charset: entry.charset ?? '',
}))

export function searchMime(query: string, limit = 50): MimeHit[] {
  const needle = query.trim().toLowerCase().replace(/^\./, '')
  if (!needle) return ENTRIES.slice(0, limit).map(toHit)
  const hits = ENTRIES.filter((entry) => entry.type.includes(needle) || entry.extensions.some((ext) => ext.includes(needle)))
  hits.sort((a, b) => rank(a, needle) - rank(b, needle) || a.type.localeCompare(b.type))
  return hits.slice(0, limit).map(toHit)
}

function rank(entry: (typeof ENTRIES)[number], needle: string): number {
  if (entry.extensions.includes(needle)) return 0
  if (entry.type === needle) return 1
  if (entry.extensions.some((ext) => ext.startsWith(needle))) return 2
  return 3
}

function toHit(entry: (typeof ENTRIES)[number]): MimeHit {
  return { type: entry.type, extensions: entry.extensions, compressible: entry.compressible, charset: entry.charset }
}
