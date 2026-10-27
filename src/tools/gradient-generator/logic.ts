import { colorWithAlpha } from '@/lib/color'

export type GradientType = 'linear' | 'radial' | 'conic'
export interface Stop {
  color: string
  opacity: number
  pos: number
}
export interface GradientState {
  type: GradientType
  angle: number
  shape: 'circle' | 'ellipse'
  cx: number
  cy: number
  repeating: boolean
  stops: Stop[]
}

export function gradientValue(g: GradientState): string {
  const stops = [...g.stops].sort((a, b) => a.pos - b.pos).map((s) => `${colorWithAlpha(s.color, s.opacity)} ${s.pos}%`)
  const at = `at ${g.cx}% ${g.cy}%`
  const head = g.type === 'linear' ? `${g.angle}deg` : g.type === 'radial' ? `${g.shape} ${at}` : `from ${g.angle}deg ${at}`
  return `${g.repeating ? 'repeating-' : ''}${g.type}-gradient(${head}, ${stops.join(', ')})`
}

export function gradientCss(g: GradientState): string {
  return `background: ${gradientValue(g)};`
}

/** Insert a stop halfway into the widest gap. */
export function insertStop(stops: Stop[]): Stop[] {
  const s = [...stops].sort((a, b) => a.pos - b.pos)
  if (s.length < 2) return [...s, { color: '#ffffff', opacity: 1, pos: 100 }]
  let best = 0
  for (let i = 1; i < s.length - 1; i++) if (s[i + 1]!.pos - s[i]!.pos > s[best + 1]!.pos - s[best]!.pos) best = i
  const pos = Math.round((s[best]!.pos + s[best + 1]!.pos) / 2)
  s.splice(best + 1, 0, { color: s[best]!.color, opacity: 1, pos })
  return s
}

export function randomGradient(rand: () => number = Math.random): Stop[] {
  const hex = () => '#' + Math.floor(rand() * 0xffffff).toString(16).padStart(6, '0')
  return [
    { color: hex(), opacity: 1, pos: 0 },
    { color: hex(), opacity: 1, pos: 100 },
  ]
}
