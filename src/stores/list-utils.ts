export const MAX_RECENT = 20

export function pushRecent(list: readonly string[], slug: string, max = MAX_RECENT): string[] {
  return [slug, ...list.filter((s) => s !== slug)].slice(0, max)
}

export function toggleItem(list: readonly string[], slug: string): string[] {
  return list.includes(slug) ? list.filter((s) => s !== slug) : [slug, ...list]
}

/** Keep only known slugs, deduplicated (guards against corrupt or stale storage). */
export function sanitizeSlugs(value: unknown, known: ReadonlySet<string>): string[] {
  if (!Array.isArray(value)) return []
  return [...new Set(value.filter((s): s is string => typeof s === 'string' && known.has(s)))]
}
