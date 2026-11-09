import { diffChars, diffLines, diffWordsWithSpace, type ChangeObject } from 'diff'

export type DiffMode = 'lines' | 'words' | 'chars'

export interface DiffPart {
  value: string
  type: 'added' | 'removed' | 'same'
}

export interface DiffOptions {
  ignoreCase?: boolean
  ignoreWhitespace?: boolean
}

function normalize(s: string, o: DiffOptions): string {
  let r = s.replace(/\r\n/g, '\n')
  if (o.ignoreWhitespace) r = r.split('\n').map((l) => l.trim().replace(/\s+/g, ' ')).join('\n')
  return r
}

export function computeDiff(a: string, b: string, mode: DiffMode = 'lines', o: DiffOptions = {}): DiffPart[] {
  // diffLines has no ignoreCase option, so compare lowercased copies in line mode.
  const lower = mode === 'lines' && !!o.ignoreCase
  const x = lower ? normalize(a, o).toLowerCase() : normalize(a, o)
  const y = lower ? normalize(b, o).toLowerCase() : normalize(b, o)
  const opts = { ignoreCase: !!o.ignoreCase }
  const parts: ChangeObject<string>[] =
    mode === 'lines' ? diffLines(x, y) : mode === 'words' ? diffWordsWithSpace(x, y, opts) : diffChars(x, y, opts)
  return parts.map((p) => ({ value: p.value, type: p.added ? 'added' : p.removed ? 'removed' : 'same' }))
}

export function diffStats(parts: DiffPart[], mode: DiffMode): { added: number; removed: number } {
  const count = (v: string) => (mode === 'lines' ? v.split('\n').filter((_, i, arr) => i < arr.length - 1 || arr[i] !== '').length : mode === 'words' ? v.split(/\s+/).filter(Boolean).length : v.length)
  return parts.reduce(
    (acc, p) => {
      if (p.type === 'added') acc.added += count(p.value)
      if (p.type === 'removed') acc.removed += count(p.value)
      return acc
    },
    { added: 0, removed: 0 },
  )
}

/** Unified-diff-like text output (lines mode). */
export function toUnified(parts: DiffPart[]): string {
  return parts
    .flatMap((p) => {
      const lines = p.value.replace(/\n$/, '').split('\n')
      const prefix = p.type === 'added' ? '+ ' : p.type === 'removed' ? '- ' : '  '
      return lines.map((l) => prefix + l)
    })
    .join('\n')
}
