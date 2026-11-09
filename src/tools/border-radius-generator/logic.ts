export type Corner = 'topLeft' | 'topRight' | 'bottomRight' | 'bottomLeft'
export const CORNERS: Corner[] = ['topLeft', 'topRight', 'bottomRight', 'bottomLeft']
export interface RadiusState {
  /** horizontal radius per corner */
  h: Record<Corner, number>
  /** vertical radius per corner, used only when elliptical */
  v: Record<Corner, number>
  elliptical: boolean
  unit: 'px' | '%'
}

/** Shorten "a b c d" following CSS shorthand rules. */
export function shorthand(vals: string[]): string {
  const [a, b, c, d] = vals as [string, string, string, string]
  if (b === d) {
    if (a === c) return a === b ? a : `${a} ${b}`
    return `${a} ${b} ${c}`
  }
  return `${a} ${b} ${c} ${d}`
}

export function borderRadiusValue(s: RadiusState): string {
  const fmt = (n: number) => (n === 0 ? '0' : `${n}${s.unit}`)
  const h = shorthand(CORNERS.map((c) => fmt(s.h[c])))
  if (!s.elliptical) return h
  const v = shorthand(CORNERS.map((c) => fmt(s.v[c])))
  return h === v ? h : `${h} / ${v}`
}

export function borderRadiusCss(s: RadiusState): string {
  return `border-radius: ${borderRadiusValue(s)};`
}
