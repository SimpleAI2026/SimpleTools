export type LineOp =
  | 'sortAsc'
  | 'sortDesc'
  | 'sortNatural'
  | 'sortLength'
  | 'reverse'
  | 'shuffle'
  | 'dedupe'
  | 'removeEmpty'
  | 'trim'
  | 'number'
  | 'addPrefix'
  | 'filter'

export const LINE_OPS: LineOp[] = ['sortAsc', 'sortDesc', 'sortNatural', 'sortLength', 'reverse', 'shuffle', 'dedupe', 'removeEmpty', 'trim', 'number', 'addPrefix', 'filter']

export interface LineOptions {
  caseInsensitive: boolean
  prefix: string
  suffix: string
  filter: string
  invertFilter: boolean
}

export function processLines(text: string, op: LineOp, o: LineOptions, rand: () => number = Math.random): string {
  const lines = text.replace(/\r\n?/g, '\n').split('\n')
  const key = (s: string) => (o.caseInsensitive ? s.toLowerCase() : s)
  const coll = new Intl.Collator(undefined, { numeric: op === 'sortNatural', sensitivity: o.caseInsensitive ? 'base' : 'variant' })
  switch (op) {
    case 'sortAsc':
    case 'sortNatural':
      return [...lines].sort(coll.compare).join('\n')
    case 'sortDesc':
      return [...lines].sort((a, b) => coll.compare(b, a)).join('\n')
    case 'sortLength':
      return [...lines].sort((a, b) => a.length - b.length || coll.compare(a, b)).join('\n')
    case 'reverse':
      return [...lines].reverse().join('\n')
    case 'shuffle': {
      const a = [...lines]
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1))
        ;[a[i], a[j]] = [a[j] as string, a[i] as string]
      }
      return a.join('\n')
    }
    case 'dedupe': {
      const seen = new Set<string>()
      return lines.filter((l) => (seen.has(key(l)) ? false : (seen.add(key(l)), true))).join('\n')
    }
    case 'removeEmpty':
      return lines.filter((l) => l.trim()).join('\n')
    case 'trim':
      return lines.map((l) => l.trim()).join('\n')
    case 'number': {
      const w = String(lines.length).length
      return lines.map((l, i) => `${String(i + 1).padStart(w, ' ')}. ${l}`).join('\n')
    }
    case 'addPrefix':
      return lines.map((l) => o.prefix + l + o.suffix).join('\n')
    case 'filter': {
      const needle = key(o.filter)
      return lines.filter((l) => key(l).includes(needle) !== o.invertFilter).join('\n')
    }
  }
}
