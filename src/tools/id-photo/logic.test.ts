import { describe, expect, it } from 'vitest'
import {
  BG_PRESETS,
  chooseCrown,
  computeCrop,
  crc32,
  crownFromAlpha,
  customSpec,
  dequantizeQ8,
  estimateCrown,
  eyeAngle,
  hexToRgb,
  layoutSheet,
  mmToPx,
  readJpegDpi,
  readPngDpi,
  rotatedSize,
  rotatePoint,
  searchQuality,
  setJpegDpi,
  setPngDpi,
  SHEETS,
  SPECS,
} from './logic'

describe('spec table', () => {
  it('converts millimetres to pixels', () => {
    expect(mmToPx(25, 300)).toBe(295)
    expect(mmToPx(35, 300)).toBe(413)
    expect(mmToPx(51, 300)).toBe(602)
  })
  it('has unique ids and sane pixel sizes', () => {
    expect(new Set(SPECS.map((s) => s.id)).size).toBe(SPECS.length)
    const one = SPECS.find((s) => s.id === 'one-inch')!
    expect([one.widthPx, one.heightPx, one.dpi]).toEqual([295, 413, 300])
    const id = SPECS.find((s) => s.id === 'cn-id-card')!
    expect([id.widthPx, id.heightPx, id.dpi]).toEqual([358, 441, 350])
    const us = SPECS.find((s) => s.id === 'us-visa')!
    expect([us.widthPx, us.heightPx]).toEqual([600, 600])
    for (const s of SPECS) {
      expect(s.headRatio + s.topRatio).toBeLessThan(1)
      expect(Math.abs(s.widthPx / s.heightPx - s.widthMm / s.heightMm)).toBeLessThan(0.03)
    }
  })
  it('clamps custom specs and derives millimetres', () => {
    const c = customSpec(600, 800, 300, 10, 50)
    expect(c).toMatchObject({ id: 'custom', widthPx: 600, heightPx: 800, dpi: 300, kbMin: 10, kbMax: 50 })
    expect(c.widthMm).toBeCloseTo(50.8, 1)
    expect(customSpec(1, 99999, 10).widthPx).toBe(16)
    expect(customSpec(1, 99999, 10).heightPx).toBe(4000)
    expect(customSpec(100, 100, 300, 0, 0).kbMax).toBeUndefined()
  })
  it('parses background colors', () => {
    expect(hexToRgb('#438edb')).toEqual([67, 142, 219])
    expect(hexToRgb('#fff')).toEqual([255, 255, 255])
    expect(hexToRgb('nope')).toEqual([255, 255, 255])
    expect(BG_PRESETS.map((b) => b.id)).toEqual(expect.arrayContaining(['white', 'blue', 'red']))
  })
})

describe('geometry', () => {
  it('measures eye-line roll with the right sign', () => {
    expect(eyeAngle({ x: 0, y: 0 }, { x: 10, y: 0 })).toBe(0)
    expect(eyeAngle({ x: 0, y: 0 }, { x: 10, y: 10 })).toBeCloseTo(45)
    expect(eyeAngle({ x: 0, y: 10 }, { x: 10, y: 0 })).toBeCloseTo(-45)
  })
  it('rotating by minus the roll levels the eyes', () => {
    const w = 400
    const h = 300
    const l = { x: 150, y: 140 }
    const r = { x: 250, y: 160 }
    const a = -eyeAngle(l, r)
    const l2 = rotatePoint(l, w, h, a)
    const r2 = rotatePoint(r, w, h, a)
    expect(l2.y).toBeCloseTo(r2.y, 6)
    expect(Math.hypot(r2.x - l2.x, r2.y - l2.y)).toBeCloseTo(Math.hypot(100, 20), 6)
  })
  it('expands the canvas for rotation', () => {
    expect(rotatedSize(100, 50, 0)).toEqual({ width: 100, height: 50 })
    expect(rotatedSize(100, 50, 90)).toEqual({ width: 50, height: 100 })
    const s = rotatedSize(100, 100, 45)
    expect(s.width).toBe(Math.ceil(100 * Math.SQRT2))
    expect(rotatePoint({ x: 50, y: 50 }, 100, 100, 45)).toEqual({ x: s.width / 2, y: s.height / 2 })
  })
  it('finds the crown in an alpha map and falls back when implausible', () => {
    const w = 10
    const h = 10
    const a = new Float32Array(w * h)
    for (let y = 3; y < h; y++) for (let x = 4; x < 7; x++) a[y * w + x] = 1
    expect(crownFromAlpha(a, w, h, 0, 10)).toBe(3)
    expect(crownFromAlpha(a, w, h, 0, 3)).toBeNull()
    expect(crownFromAlpha(a, w, h, 5, 5)).toBeNull()
    expect(estimateCrown(100, 200)).toBeCloseTo(-5)
    expect(chooseCrown(null, 100, 200)).toBeCloseTo(-5)
    expect(chooseCrown(10, 100, 200)).toBe(10)
    expect(chooseCrown(90, 100, 200)).toBeCloseTo(-5) // below the forehead: reject
    expect(chooseCrown(-500, 100, 200)).toBeCloseTo(-5) // far above: reject
  })
  it('frames the head per spec and keeps it centred when zooming', () => {
    const s = { widthPx: 295, heightPx: 413, headRatio: 0.6, topRatio: 0.1 }
    const head = { crownY: 100, chinY: 400, centerX: 500 }
    const c = computeCrop(head, s)
    expect(c.height).toBeCloseTo(500)
    expect(c.width / c.height).toBeCloseTo(295 / 413)
    expect(c.y).toBeCloseTo(50)
    expect(c.x + c.width / 2).toBeCloseTo(500)
    const z = computeCrop(head, s, { zoom: 2, dx: 0, dy: 0 })
    expect(z.height).toBeCloseTo(250)
    const mid = (c.y + c.height * ((250 - c.y) / c.height))
    expect(z.y + z.height * ((250 - c.y) / c.height)).toBeCloseTo(mid)
    const moved = computeCrop(head, s, { zoom: 1, dx: 0.1, dy: -0.1 })
    expect(moved.x - c.x).toBeCloseTo(0.1 * c.width)
    expect(moved.y - c.y).toBeCloseTo(-0.1 * c.height)
  })
})

describe('sheet layout', () => {
  it('fits 1-inch photos on 6-inch paper', () => {
    const l = layoutSheet(SHEETS.find((s) => s.id === '6inch')!, 295, 413)
    expect([l.width, l.height].sort()).toEqual([1200, 1800])
    expect(l.cells.length).toBeGreaterThanOrEqual(8)
    for (const c of l.cells) {
      expect(c.x).toBeGreaterThanOrEqual(0)
      expect(c.y).toBeGreaterThanOrEqual(0)
      expect(c.x + 295).toBeLessThanOrEqual(l.width)
      expect(c.y + 413).toBeLessThanOrEqual(l.height)
    }
  })
  it('returns no cells when the photo is larger than the paper', () => {
    expect(layoutSheet(SHEETS[0]!, 5000, 5000).cells).toHaveLength(0)
  })
})

describe('KB targeting', () => {
  const linear = (q: number) => Promise.resolve(Math.round(1000 + q * 100000))
  it('keeps the top quality when it already fits', async () => {
    const r = await searchQuality(linear, undefined, 200000)
    expect(r.quality).toBe(0.95)
    expect(r.ok).toBe(true)
  })
  it('converges under the maximum and reports the window', async () => {
    const r = await searchQuality(linear, 20000, 30000)
    expect(r.bytes).toBeLessThanOrEqual(30000)
    expect(r.bytes).toBeGreaterThanOrEqual(20000)
    expect(r.ok).toBe(true)
  })
  it('flags a miss when even the lowest quality is too large', async () => {
    const r = await searchQuality(() => Promise.resolve(50000), undefined, 1000)
    expect(r.ok).toBe(false)
  })
})

describe('DPI metadata', () => {
  const jfif = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 16, 0x4a, 0x46, 0x49, 0x46, 0, 1, 1, 0, 0, 1, 0, 1, 0, 0, 0xff, 0xd9])
  it('updates an existing JFIF header', () => {
    const out = setJpegDpi(jfif, 300)
    expect(out.length).toBe(jfif.length)
    expect(readJpegDpi(out)).toBe(300)
    expect(readJpegDpi(jfif)).toBeNull() // unit 0 = aspect ratio only
  })
  it('inserts JFIF when missing', () => {
    const bare = new Uint8Array([0xff, 0xd8, 0xff, 0xdb, 0, 2, 0xff, 0xd9])
    const out = setJpegDpi(bare, 350)
    expect(out.length).toBe(bare.length + 18)
    expect(readJpegDpi(out)).toBe(350)
    expect(Array.from(out.subarray(-6))).toEqual(Array.from(bare.subarray(2)))
    expect(() => setJpegDpi(new Uint8Array([1, 2, 3]), 300)).toThrow()
  })
  it('computes CRC-32', () => {
    expect(crc32(new TextEncoder().encode('IEND'))).toBe(0xae426082)
  })
  it('writes PNG pHYs after IHDR and replaces old ones', () => {
    const chunk = (type: string, data: number[]) => {
      const body = new Uint8Array([...new TextEncoder().encode(type), ...data])
      const out = new Uint8Array(12 + data.length)
      const dv = new DataView(out.buffer)
      dv.setUint32(0, data.length)
      out.set(body, 4)
      dv.setUint32(8 + data.length, crc32(body))
      return out
    }
    const sig = [137, 80, 78, 71, 13, 10, 26, 10]
    const png = new Uint8Array([...sig, ...chunk('IHDR', new Array(13).fill(0)), ...chunk('IEND', [])])
    const once = setPngDpi(png, 300)
    expect(readPngDpi(once)).toBe(300)
    expect(String.fromCharCode(...once.subarray(8 + 25 + 4, 8 + 25 + 8))).toBe('pHYs')
    const twice = setPngDpi(once, 72)
    expect(twice.length).toBe(once.length)
    expect(readPngDpi(twice)).toBe(72)
    expect(readPngDpi(png)).toBeNull()
  })
})

describe('Q8 weight unpacking', () => {
  it('restores raw and per-channel quantized tensors in order', () => {
    // raw float32 [2]; q8 [2,3] per last-axis channel (C=3); raw int32 [1]
    const lo = [0, -1, 10]
    const sc = [1, 0.5, 2]
    const q = [0, 2, 1, 3, 4, 5] // row-major, channel = k % 3
    const parts: number[] = []
    const f32 = (v: number) => Array.from(new Uint8Array(new Float32Array([v]).buffer))
    parts.push(...f32(1.5), ...f32(-2))
    for (const v of lo) parts.push(...f32(v))
    for (const v of sc) parts.push(...f32(v))
    parts.push(...q, 0, 0) // 6 bytes + 2 padding
    parts.push(...Array.from(new Uint8Array(new Int32Array([7]).buffer)))
    const buf = new Uint8Array(parts).buffer
    const out = dequantizeQ8(
      [
        { name: 'a', shape: [2], dtype: 'float32' },
        { name: 'b', shape: [2, 3], dtype: 'float32' },
        { name: 'c', shape: [1], dtype: 'int32' },
      ],
      [{ kind: 'raw' }, { kind: 'q8', axis: 1, channels: 3 }, { kind: 'raw' }],
      buf,
    )
    const f = new Float32Array(out, 0, 8)
    expect(Array.from(f)).toEqual([1.5, -2, 0, 0, 12, 3, 1, 20])
    expect(new Int32Array(out, 32, 1)[0]).toBe(7)
  })
  it('rejects mismatched payloads', () => {
    expect(() => dequantizeQ8([{ name: 'a', shape: [2], dtype: 'float32' }], [{ kind: 'raw' }], new ArrayBuffer(4))).toThrow()
    expect(() => dequantizeQ8([{ name: 'a', shape: [1], dtype: 'float32' }], [], new ArrayBuffer(4))).toThrow()
  })
})
