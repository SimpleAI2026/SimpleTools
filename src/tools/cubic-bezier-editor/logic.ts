export type Bezier = [number, number, number, number]

export const BEZIER_PRESETS: Record<string, Bezier> = {
  ease: [0.25, 0.1, 0.25, 1],
  linear: [0, 0, 1, 1],
  'ease-in': [0.42, 0, 1, 1],
  'ease-out': [0, 0, 0.58, 1],
  'ease-in-out': [0.42, 0, 0.58, 1],
  easeInBack: [0.36, 0, 0.66, -0.56],
  easeOutBack: [0.34, 1.56, 0.64, 1],
  easeInOutCubic: [0.65, 0, 0.35, 1],
  easeOutExpo: [0.16, 1, 0.3, 1],
}

/** Keywords valid in CSS itself (the other presets need cubic-bezier()). */
export const CSS_KEYWORDS = ['ease', 'linear', 'ease-in', 'ease-out', 'ease-in-out'] as const

const r = (n: number) => String(Math.round(n * 100) / 100)

export function formatBezier(b: Bezier): string {
  for (const name of CSS_KEYWORDS) if (BEZIER_PRESETS[name]!.every((v, i) => v === b[i])) return name
  return `cubic-bezier(${b.map(r).join(', ')})`
}

/** Parse "cubic-bezier(a,b,c,d)", "a, b, c, d" or a CSS keyword. x values must be within [0, 1]. */
export function parseBezier(s: string): Bezier | null {
  const t = s.trim().toLowerCase()
  if ((CSS_KEYWORDS as readonly string[]).includes(t)) return [...BEZIER_PRESETS[t]!]
  const nums = t.replace(/^cubic-bezier\(|\)$/g, '').split(/[\s,]+/).filter(Boolean).map(Number)
  if (nums.length !== 4 || nums.some((n) => !Number.isFinite(n))) return null
  if (nums[0]! < 0 || nums[0]! > 1 || nums[2]! < 0 || nums[2]! > 1) return null
  return nums as Bezier
}

/** Point on the curve at parameter t (P0 = (0,0), P3 = (1,1)). */
export function bezierPoint(b: Bezier, t: number): [number, number] {
  const u = 1 - t
  const f = (p1: number, p2: number) => 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t
  return [f(b[0], b[2]), f(b[1], b[3])]
}

/** Progress (y) for a given time fraction (x), solved by bisection. */
export function bezierAt(b: Bezier, x: number): number {
  let lo = 0
  let hi = 1
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2
    if (bezierPoint(b, mid)[0] < x) lo = mid
    else hi = mid
  }
  return bezierPoint(b, (lo + hi) / 2)[1]
}
