import { diffLines, diffWordsWithSpace } from 'diff'

export interface DiffPart {
  value: string
  added?: boolean
  removed?: boolean
}

export function textDiff(a: string, b: string, mode: 'words' | 'lines') {
  const parts: DiffPart[] = (mode === 'lines' ? diffLines(a, b) : diffWordsWithSpace(a, b)).map((p) => ({ value: p.value, added: p.added, removed: p.removed }))
  const count = (k: 'added' | 'removed') => parts.filter((p) => p[k] && p.value.trim()).length
  return { parts, added: count('added'), removed: count('removed'), identical: parts.every((p) => !p.added && !p.removed) }
}

/**
 * Compare two RGBA buffers of equal size. Output: faded grayscale of A with changed pixels in red.
 * `threshold` is the max per-channel difference (0-255) still treated as equal (anti-aliasing tolerance).
 */
export function pixelDiff(a: Uint8ClampedArray, b: Uint8ClampedArray, threshold = 24): { out: Uint8ClampedArray; changed: number; ratio: number } {
  if (a.length !== b.length) throw new Error('Size mismatch')
  const out = new Uint8ClampedArray(a.length)
  let changed = 0
  for (let i = 0; i < a.length; i += 4) {
    const d = Math.max(Math.abs(a[i]! - b[i]!), Math.abs(a[i + 1]! - b[i + 1]!), Math.abs(a[i + 2]! - b[i + 2]!))
    if (d > threshold) {
      changed++
      out[i] = 230
      out[i + 1] = 30
      out[i + 2] = 30
    } else {
      const g = 255 - (255 - (a[i]! * 0.3 + a[i + 1]! * 0.59 + a[i + 2]! * 0.11)) * 0.25
      out[i] = out[i + 1] = out[i + 2] = g
    }
    out[i + 3] = 255
  }
  return { out, changed, ratio: changed / (a.length / 4 || 1) }
}
