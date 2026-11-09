export interface RGB {
  r: number
  g: number
  b: number
  a: number
}

const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v))
const round = (v: number, d = 0) => {
  const k = 10 ** d
  return Math.round(v * k) / k
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const k = (n: number) => (n + h / 30) % 12
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1))
  return [f(0) * 255, f(8) * 255, f(4) * 255]
}
function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
  const f = (n: number) => {
    const k = (n + h / 60) % 6
    return v - v * s * Math.max(0, Math.min(k, 4 - k, 1))
  }
  return [f(5) * 255, f(3) * 255, f(1) * 255]
}

function num(token: string, scale: number): number {
  if (token.endsWith('%')) return (parseFloat(token) / 100) * scale
  return parseFloat(token)
}

/** Parse hex, rgb(), hsl(), hsv(), hwb(), cmyk() strings (CSS level 4 syntax with spaces or commas). */
export function parseColor(input: string): RGB | null {
  const s = input.trim().toLowerCase()
  const hex = /^#?([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/.exec(s)
  if (hex) {
    let h = hex[1]!
    if (h.length <= 4) h = [...h].map((c) => c + c).join('')
    const n = (i: number) => parseInt(h.slice(i, i + 2), 16)
    return { r: n(0), g: n(2), b: n(4), a: h.length === 8 ? round(n(6) / 255, 3) : 1 }
  }
  const fn = /^(rgba?|hsla?|hsv|hwb|cmyk)\(([^)]*)\)$/.exec(s)
  if (!fn) return null
  const parts = fn[2]!.split(/[\s,/]+/).filter(Boolean)
  const name = fn[1]!
  const alphaTok = name === 'cmyk' ? parts[4] : parts[3]
  const a = alphaTok === undefined ? 1 : clamp(num(alphaTok, 1))
  if (parts.some((p) => !Number.isFinite(parseFloat(p)))) return null
  let rgb: [number, number, number]
  if (name.startsWith('rgb')) {
    if (parts.length < 3) return null
    rgb = [num(parts[0]!, 255), num(parts[1]!, 255), num(parts[2]!, 255)]
  } else if (name === 'cmyk') {
    if (parts.length < 4) return null
    const [c, m, y, k] = parts.slice(0, 4).map((p) => (p.endsWith('%') ? parseFloat(p) / 100 : parseFloat(p) > 1 ? parseFloat(p) / 100 : parseFloat(p))) as [number, number, number, number]
    rgb = [255 * (1 - c) * (1 - k), 255 * (1 - m) * (1 - k), 255 * (1 - y) * (1 - k)]
  } else {
    if (parts.length < 3) return null
    const h = (((parseFloat(parts[0]!) % 360) + 360) % 360)
    const x = clamp(num(parts[1]!.endsWith('%') ? parts[1]! : `${parts[1]}%`, 1))
    const y = clamp(num(parts[2]!.endsWith('%') ? parts[2]! : `${parts[2]}%`, 1))
    if (name.startsWith('hsl')) rgb = hslToRgb(h, x, y)
    else if (name === 'hsv') rgb = hsvToRgb(h, x, y)
    else {
      // hwb: whiteness x, blackness y
      const sum = x + y
      const w = sum > 1 ? x / sum : x
      const bl = sum > 1 ? y / sum : y
      rgb = hsvToRgb(h, 1, 1).map((c) => (c / 255) * (1 - w - bl) * 255 + w * 255) as [number, number, number]
    }
  }
  const [r, g, b] = rgb.map((c) => Math.round(clamp(c, 0, 255)))
  return { r: r!, g: g!, b: b!, a }
}

function rgbToHsl({ r, g, b }: RGB) {
  const [R, G, B] = [r / 255, g / 255, b / 255]
  const max = Math.max(R, G, B)
  const min = Math.min(R, G, B)
  const l = (max + min) / 2
  const d = max - min
  let h = 0
  if (d) h = max === R ? ((G - B) / d) % 6 : max === G ? (B - R) / d + 2 : (R - G) / d + 4
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1))
  return { h: (h * 60 + 360) % 360, s, l, max, min }
}

const lin = (c: number) => {
  const v = c / 255
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
}

export function toOklch({ r, g, b }: RGB): [number, number, number] {
  const [R, G, B] = [lin(r), lin(g), lin(b)]
  const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B)
  const m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B)
  const s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B)
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s
  const Bb = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s
  const C = Math.sqrt(A * A + Bb * Bb)
  const H = C < 1e-4 ? 0 : ((Math.atan2(Bb, A) * 180) / Math.PI + 360) % 360
  return [L, C, H]
}

export function relativeLuminance({ r, g, b }: RGB): number {
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
}

export function contrastRatio(a: RGB, b: RGB): number {
  const [x, y] = [relativeLuminance(a), relativeLuminance(b)].sort((p, q) => q - p) as [number, number]
  return round((x + 0.05) / (y + 0.05), 2)
}

export type ColorFormat = 'hex' | 'rgb' | 'hsl' | 'hsv' | 'hwb' | 'cmyk' | 'oklch'

export function formatColor(c: RGB, f: ColorFormat): string {
  const alpha = c.a < 1 ? ` / ${round(c.a * 100)}%` : ''
  const pct = (v: number) => `${round(v * 100)}%`
  const { h, s, l, max, min } = rgbToHsl(c)
  switch (f) {
    case 'hex': {
      const hx = [c.r, c.g, c.b, ...(c.a < 1 ? [Math.round(c.a * 255)] : [])].map((v) => v.toString(16).padStart(2, '0')).join('')
      return `#${hx}`
    }
    case 'rgb':
      return `rgb(${c.r} ${c.g} ${c.b}${alpha})`
    case 'hsl':
      return `hsl(${round(h)} ${pct(s)} ${pct(l)}${alpha})`
    case 'hsv':
      return `hsv(${round(h)} ${pct(max === 0 ? 0 : (max - min) / max)} ${pct(max)})`
    case 'hwb':
      return `hwb(${round(h)} ${pct(min)} ${pct(1 - max)}${alpha})`
    case 'cmyk': {
      const k = 1 - max
      const f2 = (v: number) => (k === 1 ? 0 : (1 - v / 255 - k) / (1 - k))
      return `cmyk(${pct(f2(c.r))} ${pct(f2(c.g))} ${pct(f2(c.b))} ${pct(k)})`
    }
    case 'oklch': {
      const [L, C, H] = toOklch(c)
      return `oklch(${round(L * 100, 2)}% ${round(C, 4)} ${round(H, 2)}${alpha})`
    }
  }
}

export const COLOR_FORMATS: ColorFormat[] = ['hex', 'rgb', 'hsl', 'hsv', 'hwb', 'cmyk', 'oklch']
