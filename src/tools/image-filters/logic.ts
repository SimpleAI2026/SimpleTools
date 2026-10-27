export interface FilterSettings {
  brightness: number // 1 = unchanged
  contrast: number // 1 = unchanged
  saturate: number // 1 = unchanged
  grayscale: number // 0..1
  sepia: number // 0..1
  hueRotate: number // degrees
  invert: number // 0..1
  blur: number // px radius
}

export const IDENTITY_FILTERS: FilterSettings = { brightness: 1, contrast: 1, saturate: 1, grayscale: 0, sepia: 0, hueRotate: 0, invert: 0, blur: 0 }

export const FILTER_PRESETS: Record<string, Partial<FilterSettings>> = {
  none: {},
  mono: { grayscale: 1, contrast: 1.1 },
  vintage: { sepia: 0.6, contrast: 1.1, brightness: 1.05, saturate: 0.8 },
  vivid: { saturate: 1.6, contrast: 1.15 },
  cool: { hueRotate: 200, saturate: 0.7, brightness: 1.05 },
  warm: { sepia: 0.3, saturate: 1.3, hueRotate: -10 },
  fade: { contrast: 0.8, brightness: 1.1, saturate: 0.7 },
  invert: { invert: 1 },
}

/** 3x4 affine colour transform: rows are [r, g, b, offset] for each output channel (0..255 domain). */
type Affine = number[][]
const I: Affine = [
  [1, 0, 0, 0],
  [0, 1, 0, 0],
  [0, 0, 1, 0],
]

function compose(next: Affine, prev: Affine): Affine {
  return next.map((row) => [0, 1, 2, 3].map((c) => row[0]! * prev[0]![c]! + row[1]! * prev[1]![c]! + row[2]! * prev[2]![c]! + (c === 3 ? row[3]! : 0)))
}

const linear = (m: number[][]): Affine => m.map((r) => [...r, 0])
function saturateM(s: number): Affine {
  return linear([
    [0.213 + 0.787 * s, 0.715 - 0.715 * s, 0.072 - 0.072 * s],
    [0.213 - 0.213 * s, 0.715 + 0.285 * s, 0.072 - 0.072 * s],
    [0.213 - 0.213 * s, 0.715 - 0.715 * s, 0.072 + 0.928 * s],
  ])
}
function hueM(deg: number): Affine {
  const a = (deg * Math.PI) / 180
  const c = Math.cos(a)
  const s = Math.sin(a)
  return linear([
    [0.213 + c * 0.787 - s * 0.213, 0.715 - c * 0.715 - s * 0.715, 0.072 - c * 0.072 + s * 0.928],
    [0.213 - c * 0.213 + s * 0.143, 0.715 + c * 0.285 + s * 0.14, 0.072 - c * 0.072 - s * 0.283],
    [0.213 - c * 0.213 - s * 0.787, 0.715 - c * 0.715 + s * 0.715, 0.072 + c * 0.928 + s * 0.072],
  ])
}
function sepiaM(k: number): Affine {
  const sep = [
    [0.393, 0.769, 0.189],
    [0.349, 0.686, 0.168],
    [0.272, 0.534, 0.131],
  ]
  return linear(sep.map((row, i) => row.map((v, j) => (1 - k) * (i === j ? 1 : 0) + k * v)))
}

/** Build the combined colour matrix in CSS filter order. */
export function filterMatrix(f: FilterSettings): Affine {
  let m = I
  const push = (x: Affine) => (m = compose(x, m))
  if (f.brightness !== 1) push(linear([[f.brightness, 0, 0], [0, f.brightness, 0], [0, 0, f.brightness]]))
  if (f.contrast !== 1) {
    const o = 127.5 * (1 - f.contrast)
    push([[f.contrast, 0, 0, o], [0, f.contrast, 0, o], [0, 0, f.contrast, o]])
  }
  if (f.saturate !== 1) push(saturateM(f.saturate))
  if (f.grayscale > 0) push(saturateM(1 - f.grayscale))
  if (f.sepia > 0) push(sepiaM(f.sepia))
  if (f.hueRotate % 360 !== 0) push(hueM(f.hueRotate))
  if (f.invert > 0) push([[1 - 2 * f.invert, 0, 0, 255 * f.invert], [0, 1 - 2 * f.invert, 0, 255 * f.invert], [0, 0, 1 - 2 * f.invert, 255 * f.invert]])
  return m
}

/** Apply colour filters in place on RGBA pixel data. */
export function applyColorFilters(data: Uint8ClampedArray, f: FilterSettings): void {
  const m = filterMatrix(f)
  if (m === I) return
  const [r, g, b] = m as [number[], number[], number[]]
  for (let i = 0; i < data.length; i += 4) {
    const R = data[i]!
    const G = data[i + 1]!
    const B = data[i + 2]!
    data[i] = r[0]! * R + r[1]! * G + r[2]! * B + r[3]!
    data[i + 1] = g[0]! * R + g[1]! * G + g[2]! * B + g[3]!
    data[i + 2] = b[0]! * R + b[1]! * G + b[2]! * B + b[3]!
  }
}

/** Separable box blur (3 passes ≈ gaussian) on RGBA data. */
export function boxBlur(data: Uint8ClampedArray, w: number, h: number, radius: number, passes = 3): void {
  const r = Math.round(radius)
  if (r < 1) return
  const tmp = new Float32Array(data.length)
  const pass = (src: ArrayLike<number>, dst: { [i: number]: number }, horizontal: boolean) => {
    const outer = horizontal ? h : w
    const inner = horizontal ? w : h
    for (let o = 0; o < outer; o++) {
      for (let c = 0; c < 4; c++) {
        const idx = (k: number) => ((horizontal ? o * w + k : k * w + o) << 2) + c
        let sum = 0
        for (let k = -r; k <= r; k++) sum += src[idx(Math.min(inner - 1, Math.max(0, k)))]!
        for (let k = 0; k < inner; k++) {
          dst[idx(k)] = sum / (2 * r + 1)
          sum += src[idx(Math.min(inner - 1, k + r + 1))]! - src[idx(Math.max(0, k - r))]!
        }
      }
    }
  }
  for (let p = 0; p < passes; p++) {
    pass(data, tmp, true)
    pass(tmp, data, false)
  }
}

export function applyFilters(img: { data: Uint8ClampedArray; width: number; height: number }, f: FilterSettings): void {
  applyColorFilters(img.data, f)
  if (f.blur > 0) boxBlur(img.data, img.width, img.height, f.blur)
}

export function isIdentity(f: FilterSettings): boolean {
  return (Object.keys(IDENTITY_FILTERS) as (keyof FilterSettings)[]).every((k) => f[k] === IDENTITY_FILTERS[k])
}

/** Equivalent CSS `filter` value, used for the live preview. */
export function cssFilter(f: FilterSettings): string {
  const parts: string[] = []
  if (f.brightness !== 1) parts.push(`brightness(${f.brightness})`)
  if (f.contrast !== 1) parts.push(`contrast(${f.contrast})`)
  if (f.saturate !== 1) parts.push(`saturate(${f.saturate})`)
  if (f.grayscale) parts.push(`grayscale(${f.grayscale})`)
  if (f.sepia) parts.push(`sepia(${f.sepia})`)
  if (f.hueRotate) parts.push(`hue-rotate(${f.hueRotate}deg)`)
  if (f.invert) parts.push(`invert(${f.invert})`)
  if (f.blur) parts.push(`blur(${f.blur}px)`)
  return parts.join(' ') || 'none'
}
