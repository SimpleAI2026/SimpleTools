/**
 * Pure helpers for the ID photo tool: spec table, geometry, sheet layout,
 * KB-targeted encoding search, DPI metadata and model weight unpacking.
 * No DOM access here, so everything is unit-testable in Node.
 */

export type SpecGroup = 'cn' | 'visa' | 'custom'

export interface PhotoSpec {
  id: string
  group: SpecGroup
  /** Printed size in millimetres. */
  widthMm: number
  heightMm: number
  /** Electronic size in pixels. */
  widthPx: number
  heightPx: number
  dpi: number
  /** Optional file-size window for uploads (KB, 1 KB = 1024 B). */
  kbMin?: number
  kbMax?: number
  /** Head height (crown to chin) as a share of photo height. */
  headRatio: number
  /** Gap above the crown as a share of photo height. */
  topRatio: number
  /** Suggested background preset id. */
  bg?: string
}

/** px = mm / 25.4 * dpi, rounded. */
export function mmToPx(mm: number, dpi: number): number {
  return Math.round((mm / 25.4) * dpi)
}

const spec = (id: string, group: SpecGroup, widthMm: number, heightMm: number, dpi: number, extra: Partial<PhotoSpec> = {}): PhotoSpec => ({
  id,
  group,
  widthMm,
  heightMm,
  widthPx: mmToPx(widthMm, dpi),
  heightPx: mmToPx(heightMm, dpi),
  dpi,
  headRatio: 0.62,
  topRatio: 0.1,
  ...extra,
})

/**
 * Written for SimpleTools from public requirements (GB/T 35936 sizes, ICAO 9303
 * 35×45 mm, U.S. Department of State 2×2 in, MOFA Japan 45×45 mm, PRC resident
 * ID 358×441 px @ 350 dpi). Not copied from any third-party data file.
 */
export const SPECS: PhotoSpec[] = [
  spec('one-inch', 'cn', 25, 35, 300),
  spec('small-one-inch', 'cn', 22, 32, 300),
  spec('large-one-inch', 'cn', 33, 48, 300),
  spec('two-inch', 'cn', 35, 49, 300),
  spec('small-two-inch', 'cn', 35, 45, 300),
  spec('large-two-inch', 'cn', 35, 53, 300),
  spec('cn-id-card', 'cn', 26, 32, 350, { widthPx: 358, heightPx: 441, bg: 'white', headRatio: 0.66, topRatio: 0.08 }),
  spec('cn-passport', 'cn', 33, 48, 300, { bg: 'white', headRatio: 0.64, topRatio: 0.08 }),
  spec('cn-hk-macau-permit', 'cn', 33, 48, 300, { bg: 'white', headRatio: 0.64, topRatio: 0.08 }),
  spec('cn-driving-license', 'cn', 22, 32, 300, { bg: 'white' }),
  spec('cn-social-security', 'cn', 26, 32, 350, { widthPx: 358, heightPx: 441, bg: 'white', kbMin: 9, kbMax: 20, headRatio: 0.66, topRatio: 0.08 }),
  spec('us-visa', 'visa', 51, 51, 300, { widthPx: 600, heightPx: 600, bg: 'white', kbMax: 240, headRatio: 0.58, topRatio: 0.12 }),
  spec('schengen-visa', 'visa', 35, 45, 300, { bg: 'white', headRatio: 0.75, topRatio: 0.07 }),
  spec('uk-visa', 'visa', 35, 45, 300, { bg: 'white', headRatio: 0.73, topRatio: 0.08 }),
  spec('jp-visa', 'visa', 45, 45, 300, { bg: 'white', headRatio: 0.68, topRatio: 0.1 }),
]

export function customSpec(widthPx: number, heightPx: number, dpi: number, kbMin?: number, kbMax?: number): PhotoSpec {
  const w = clampInt(widthPx, 16, 4000)
  const h = clampInt(heightPx, 16, 4000)
  const d = clampInt(dpi, 72, 1200)
  return {
    id: 'custom',
    group: 'custom',
    widthPx: w,
    heightPx: h,
    dpi: d,
    widthMm: Math.round(((w / d) * 25.4) * 10) / 10,
    heightMm: Math.round(((h / d) * 25.4) * 10) / 10,
    kbMin: kbMin && kbMin > 0 ? kbMin : undefined,
    kbMax: kbMax && kbMax > 0 ? kbMax : undefined,
    headRatio: 0.62,
    topRatio: 0.1,
  }
}

function clampInt(v: number, lo: number, hi: number): number {
  const n = Math.round(Number(v) || 0)
  return Math.min(hi, Math.max(lo, n))
}

export interface BgPreset {
  id: string
  color: string
}
export const BG_PRESETS: BgPreset[] = [
  { id: 'white', color: '#ffffff' },
  { id: 'blue', color: '#438edb' },
  { id: 'deep-blue', color: '#1e4f9c' },
  { id: 'red', color: '#d9001b' },
  { id: 'gray', color: '#c8c8c8' },
]

/** Parse #rgb / #rrggbb into [r,g,b]; falls back to white. */
export function hexToRgb(hex: string): [number, number, number] {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim())
  if (!m) return [255, 255, 255]
  let h = m[1]!
  if (h.length === 3) h = h.split('').map((c) => c + c).join('')
  const n = parseInt(h, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

// ---------------------------------------------------------------- geometry

export interface Point {
  x: number
  y: number
}

/**
 * Roll of the eye line in degrees (image coordinates, y down). Positive means
 * the subject's left eye (image right) sits lower; rotate by the negative to level.
 */
export function eyeAngle(imageLeftEye: Point, imageRightEye: Point): number {
  return (Math.atan2(imageRightEye.y - imageLeftEye.y, imageRightEye.x - imageLeftEye.x) * 180) / Math.PI
}

/** Size of the canvas needed to hold a w×h image rotated by `deg`. */
export function rotatedSize(w: number, h: number, deg: number): { width: number; height: number } {
  const r = (Math.abs(deg) * Math.PI) / 180
  const c = Math.abs(Math.cos(r))
  const s = Math.abs(Math.sin(r))
  // Subtract a hair so 90° (cos ≈ 6e-17) does not round up a whole pixel.
  return { width: Math.ceil(w * c + h * s - 1e-6), height: Math.ceil(w * s + h * c - 1e-6) }
}

/**
 * Map a point of a w×h image into the canvas produced by rotating that image by
 * `deg` (clockwise on screen) about its centre into a `rotatedSize` canvas.
 */
export function rotatePoint(p: Point, w: number, h: number, deg: number): Point {
  const { width, height } = rotatedSize(w, h, deg)
  const r = (deg * Math.PI) / 180
  const dx = p.x - w / 2
  const dy = p.y - h / 2
  return {
    x: width / 2 + dx * Math.cos(r) - dy * Math.sin(r),
    y: height / 2 + dx * Math.sin(r) + dy * Math.cos(r),
  }
}

export interface FaceBox {
  xMin: number
  yMin: number
  width: number
  height: number
}

/** Rough crown (top of head) from the eye line and chin when no matte is available. */
export function estimateCrown(eyeY: number, chinY: number): number {
  return eyeY - (chinY - eyeY) * 1.05
}

/**
 * Topmost row in an alpha map (values 0..1, row-major, mw×mh) whose pixels in
 * columns [x0, x1) exceed `thr`; null when nothing qualifies.
 */
export function crownFromAlpha(alpha: ArrayLike<number>, mw: number, mh: number, x0: number, x1: number, thr = 0.5): number | null {
  const a = Math.max(0, Math.floor(x0))
  const b = Math.min(mw, Math.ceil(x1))
  if (b <= a) return null
  const need = Math.max(1, Math.round((b - a) * 0.04))
  for (let y = 0; y < mh; y++) {
    let hits = 0
    for (let x = a; x < b; x++) if (alpha[y * mw + x]! > thr) hits++
    if (hits >= need) return y
  }
  return null
}

/** Pick the matte crown when it is plausible, otherwise the landmark estimate. */
export function chooseCrown(matteCrown: number | null, eyeY: number, chinY: number): number {
  const est = estimateCrown(eyeY, chinY)
  if (matteCrown == null) return est
  const faceH = chinY - eyeY
  if (matteCrown > eyeY - faceH * 0.5 || matteCrown < est - faceH * 1.2) return est
  return matteCrown
}

export interface Adjust {
  /** 1 = spec framing; >1 zooms in. */
  zoom: number
  /** Offsets as a share of crop width / height. */
  dx: number
  dy: number
}
export const NO_ADJUST: Adjust = { zoom: 1, dx: 0, dy: 0 }

export interface CropRect {
  x: number
  y: number
  width: number
  height: number
}

/** Crop rectangle in source pixels for the given head geometry and spec. */
export function computeCrop(head: { crownY: number; chinY: number; centerX: number }, s: Pick<PhotoSpec, 'widthPx' | 'heightPx' | 'headRatio' | 'topRatio'>, adj: Adjust = NO_ADJUST): CropRect {
  const headH = Math.max(1, head.chinY - head.crownY)
  const zoom = adj.zoom > 0 ? adj.zoom : 1
  const height = headH / s.headRatio / zoom
  const width = (height * s.widthPx) / s.heightPx
  const crownGap = s.topRatio * height
  // Keep the head's vertical centre fixed while zooming.
  const headMid = (head.crownY + head.chinY) / 2
  const baseTop = head.crownY - (s.topRatio * headH) / s.headRatio
  const baseHeight = headH / s.headRatio
  const midShare = (headMid - baseTop) / baseHeight
  const y = zoom === 1 ? head.crownY - crownGap : headMid - midShare * height
  return {
    x: head.centerX - width / 2 + adj.dx * width,
    y: y + adj.dy * height,
    width,
    height,
  }
}

// ----------------------------------------------------------------- layout

export interface Sheet {
  id: string
  widthIn: number
  heightIn: number
}
/** 5-inch (3R, 3.5×5 in) and 6-inch (4R, 4×6 in) photo paper. */
export const SHEETS: Sheet[] = [
  { id: '5inch', widthIn: 3.5, heightIn: 5 },
  { id: '6inch', widthIn: 4, heightIn: 6 },
]

export interface SheetLayout {
  width: number
  height: number
  cols: number
  rows: number
  /** Top-left corner of every photo cell. */
  cells: Point[]
}

/** Grid that fits the most photos, trying portrait and landscape paper. */
export function layoutSheet(sheet: Sheet, photoW: number, photoH: number, dpi = 300, gapPx = 24, marginPx = 30): SheetLayout {
  const best = [true, false].map((portrait) => {
    const W = Math.round((portrait ? sheet.widthIn : sheet.heightIn) * dpi)
    const H = Math.round((portrait ? sheet.heightIn : sheet.widthIn) * dpi)
    const cols = Math.max(0, Math.floor((W - 2 * marginPx + gapPx) / (photoW + gapPx)))
    const rows = Math.max(0, Math.floor((H - 2 * marginPx + gapPx) / (photoH + gapPx)))
    return { W, H, cols, rows }
  }).sort((a, b) => b.cols * b.rows - a.cols * a.rows)[0]!
  const { W, H, cols, rows } = best
  const gridW = cols * photoW + Math.max(0, cols - 1) * gapPx
  const gridH = rows * photoH + Math.max(0, rows - 1) * gapPx
  const ox = Math.round((W - gridW) / 2)
  const oy = Math.round((H - gridH) / 2)
  const cells: Point[] = []
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) cells.push({ x: ox + c * (photoW + gapPx), y: oy + r * (photoH + gapPx) })
  return { width: W, height: H, cols, rows, cells }
}

// --------------------------------------------------------- size targeting

export interface QualityResult {
  quality: number
  bytes: number
  /** True when the result lies inside [min, max]. */
  ok: boolean
}

/**
 * Binary-search a JPEG quality so the encoded size lands in [minBytes, maxBytes].
 * `encode` returns the byte size for a quality in (0, 1].
 */
export async function searchQuality(encode: (q: number) => Promise<number>, minBytes: number | undefined, maxBytes: number | undefined, steps = 8): Promise<QualityResult> {
  const hi0 = 0.95
  const top = await encode(hi0)
  if (!maxBytes || top <= maxBytes) {
    return { quality: hi0, bytes: top, ok: !minBytes || top >= minBytes }
  }
  let lo = 0.05
  let hi = hi0
  let best: QualityResult | null = null
  for (let i = 0; i < steps; i++) {
    const q = (lo + hi) / 2
    const bytes = await encode(q)
    if (bytes <= maxBytes) {
      best = { quality: q, bytes, ok: !minBytes || bytes >= minBytes }
      lo = q
    } else {
      hi = q
    }
  }
  if (!best) {
    const bytes = await encode(lo)
    best = { quality: lo, bytes, ok: bytes <= maxBytes && (!minBytes || bytes >= minBytes) }
  }
  return best
}

// ------------------------------------------------------------------- DPI

/**
 * Write a JFIF APP0 segment with the given DPI. Updates an existing JFIF header,
 * otherwise inserts one right after SOI. Returns a new array.
 */
export function setJpegDpi(jpeg: Uint8Array, dpi: number): Uint8Array {
  if (jpeg[0] !== 0xff || jpeg[1] !== 0xd8) throw new Error('Not a JPEG')
  const d = Math.max(1, Math.min(65535, Math.round(dpi)))
  const isJfif = jpeg[2] === 0xff && jpeg[3] === 0xe0 && String.fromCharCode(...jpeg.subarray(6, 11)) === 'JFIF\0'
  if (isJfif) {
    const out = jpeg.slice()
    out[13] = 1
    out[14] = d >> 8
    out[15] = d & 255
    out[16] = d >> 8
    out[17] = d & 255
    return out
  }
  const app0 = new Uint8Array([0xff, 0xe0, 0, 16, 0x4a, 0x46, 0x49, 0x46, 0, 1, 1, 1, d >> 8, d & 255, d >> 8, d & 255, 0, 0])
  const out = new Uint8Array(jpeg.length + app0.length)
  out.set(jpeg.subarray(0, 2), 0)
  out.set(app0, 2)
  out.set(jpeg.subarray(2), 2 + app0.length)
  return out
}

/** Read the JFIF density as DPI (null if absent or not in dots per inch). */
export function readJpegDpi(jpeg: Uint8Array): number | null {
  if (jpeg[2] !== 0xff || jpeg[3] !== 0xe0 || String.fromCharCode(...jpeg.subarray(6, 11)) !== 'JFIF\0') return null
  if (jpeg[13] !== 1) return null
  return (jpeg[14]! << 8) | jpeg[15]!
}

let crcTable: Uint32Array | null = null
export function crc32(bytes: Uint8Array): number {
  if (!crcTable) {
    crcTable = new Uint32Array(256)
    for (let n = 0; n < 256; n++) {
      let c = n
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
      crcTable[n] = c >>> 0
    }
  }
  let c = 0xffffffff
  for (const b of bytes) c = crcTable[(c ^ b) & 255]! ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

/** Insert or replace a PNG pHYs chunk (pixels per metre) for the given DPI. */
export function setPngDpi(png: Uint8Array, dpi: number): Uint8Array {
  const sig = [137, 80, 78, 71, 13, 10, 26, 10]
  if (!sig.every((b, i) => png[i] === b)) throw new Error('Not a PNG')
  const ppm = Math.round(dpi / 0.0254)
  const chunk = new Uint8Array(21)
  const dv = new DataView(chunk.buffer)
  dv.setUint32(0, 9)
  chunk.set([0x70, 0x48, 0x59, 0x73], 4) // pHYs
  dv.setUint32(8, ppm)
  dv.setUint32(12, ppm)
  chunk[16] = 1
  dv.setUint32(17, crc32(chunk.subarray(4, 17)))
  // Walk chunks: drop any existing pHYs, insert ours right after IHDR.
  const parts: Uint8Array[] = [png.subarray(0, 8)]
  let off = 8
  const view = new DataView(png.buffer, png.byteOffset, png.byteLength)
  while (off + 8 <= png.length) {
    const len = view.getUint32(off)
    const type = String.fromCharCode(...png.subarray(off + 4, off + 8))
    const end = off + 12 + len
    if (type !== 'pHYs') parts.push(png.subarray(off, end))
    if (type === 'IHDR') parts.push(chunk)
    off = end
  }
  const out = new Uint8Array(parts.reduce((s, p) => s + p.length, 0))
  let pos = 0
  for (const p of parts) {
    out.set(p, pos)
    pos += p.length
  }
  return out
}

/** Read pHYs as DPI (null if absent or unit is not metres). */
export function readPngDpi(png: Uint8Array): number | null {
  const view = new DataView(png.buffer, png.byteOffset, png.byteLength)
  let off = 8
  while (off + 8 <= png.length) {
    const len = view.getUint32(off)
    const type = String.fromCharCode(...png.subarray(off + 4, off + 8))
    if (type === 'pHYs') return png[off + 16] === 1 ? Math.round(view.getUint32(off + 8) * 0.0254) : null
    off += 12 + len
  }
  return null
}

// --------------------------------------------------------- model weights

export interface WeightSpec {
  name: string
  shape: number[]
  dtype: string
}
export interface Q8Entry {
  kind: 'raw' | 'q8'
  axis?: number
  channels?: number
}

/**
 * Restore float32/int32 weights from SimpleTools' per-channel uint8 packing
 * (see scripts/id-photo-model/pack_q8.py). Returns one contiguous buffer in
 * weightSpecs order, as tf.io.ModelArtifacts expects.
 */
export function dequantizeQ8(specs: WeightSpec[], entries: Q8Entry[], packed: ArrayBuffer): ArrayBuffer {
  if (specs.length !== entries.length) throw new Error('Q8 manifest mismatch')
  const total = specs.reduce((s, w) => s + w.shape.reduce((a, b) => a * b, 1), 0)
  const out = new ArrayBuffer(total * 4)
  const outU8 = new Uint8Array(out)
  const outF = new Float32Array(out)
  const src = new Uint8Array(packed)
  const dv = new DataView(packed)
  let inOff = 0
  let outIdx = 0
  specs.forEach((w, i) => {
    const n = w.shape.reduce((a, b) => a * b, 1)
    const e = entries[i]!
    let used: number
    if (e.kind === 'raw') {
      outU8.set(src.subarray(inOff, inOff + n * 4), outIdx * 4)
      used = n * 4
    } else {
      const C = e.channels!
      const axis = e.axis!
      const stride = w.shape.slice(axis + 1).reduce((a, b) => a * b, 1)
      const lo = new Float32Array(C)
      const sc = new Float32Array(C)
      for (let c = 0; c < C; c++) {
        lo[c] = dv.getFloat32(inOff + c * 4, true)
        sc[c] = dv.getFloat32(inOff + (C + c) * 4, true)
      }
      const q = inOff + C * 8
      for (let k = 0; k < n; k++) {
        const c = Math.floor(k / stride) % C
        outF[outIdx + k] = src[q + k]! * sc[c]! + lo[c]!
      }
      used = C * 8 + n
    }
    inOff += used + ((4 - (used % 4)) % 4)
    outIdx += n
  })
  if (inOff !== packed.byteLength) throw new Error('Q8 payload size mismatch')
  return out
}

/** Bytes → "12.3 KB" style label using 1 KB = 1024 B. */
export function kb(bytes: number): string {
  return `${(bytes / 1024).toFixed(1)} KB`
}
