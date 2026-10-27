import type { RedactRect } from '@/lib/redact'
export { redactPdf, canvasRedactor, type RedactRect } from '@/lib/redact'

/** Rect from two drag corners; returns null for accidental tiny drags. */
export function rectFromDrag(page: number, a: { x: number; y: number }, b: { x: number; y: number }, min = 2): RedactRect | null {
  const w = Math.abs(b.x - a.x)
  const h = Math.abs(b.y - a.y)
  if (w < min || h < min) return null
  return { page, x: Math.min(a.x, b.x), y: Math.min(a.y, b.y), w, h }
}
