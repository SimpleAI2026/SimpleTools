export interface RGBA {
  r: number
  g: number
  b: number
  a: number
}

export function hexToRgba(hex: string, alpha = 1): RGBA {
  let h = hex.replace(/^#/, '')
  if (h.length === 3 || h.length === 4) h = [...h].map((c) => c + c).join('')
  if (!/^[0-9a-f]{6}([0-9a-f]{2})?$/i.test(h)) throw new Error(`Invalid hex color: ${hex}`)
  const n = (i: number) => parseInt(h.slice(i, i + 2), 16)
  return { r: n(0), g: n(2), b: n(4), a: h.length === 8 ? Math.round((n(6) / 255) * 1000) / 1000 : alpha }
}

export function rgbaCss({ r, g, b, a }: RGBA): string {
  return a >= 1 ? `rgb(${r} ${g} ${b})` : `rgb(${r} ${g} ${b} / ${Math.round(a * 100)}%)`
}

/** Hex + opacity → the most compact CSS color. */
export function colorWithAlpha(hex: string, opacity: number): string {
  if (opacity >= 1) return hex.toLowerCase()
  return rgbaCss(hexToRgba(hex, Math.max(0, opacity)))
}
