export function clampScale(scale: number): number {
  return Math.min(8, Math.max(0.25, Math.round(scale * 100) / 100))
}

export function pageLabel(n: number, total: number): string {
  return `${n} / ${total}`
}

export type RenderOpts = {
  scale: number
  colorSpace: 'RGBA' | 'Gray'
  transparent: boolean
  renderFormFields: boolean
  format: 'image/png' | 'image/jpeg'
  jpegQuality: number
}

export async function rgbaToBlob(
  data: Uint8Array,
  width: number,
  height: number,
  opts: { format: 'image/png' | 'image/jpeg'; quality: number; gray?: boolean },
): Promise<Blob> {
  const channels = opts.gray ? 1 : 4
  const rgba = new Uint8ClampedArray(width * height * 4)
  if (channels === 1) {
    for (let i = 0; i < width * height; i++) {
      const g = data[i] ?? 0
      const o = i * 4
      rgba[o] = g
      rgba[o + 1] = g
      rgba[o + 2] = g
      rgba[o + 3] = 255
    }
  } else {
    rgba.set(data.subarray(0, rgba.byteLength))
  }
  if (typeof OffscreenCanvas !== 'undefined') {
    const canvas = new OffscreenCanvas(width, height)
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('2d context unavailable')
    ctx.putImageData(new ImageData(rgba, width, height), 0, 0)
    return canvas.convertToBlob({ type: opts.format, quality: opts.quality })
  }
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('2d context unavailable')
  ctx.putImageData(new ImageData(rgba, width, height), 0, 0)
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), opts.format, opts.quality)
  })
}

export function parsePageList(range: string, total: number): number[] {
  const s = range.trim()
  if (!s) return Array.from({ length: total }, (_, i) => i)
  const out = new Set<number>()
  for (const part of s.split(',')) {
    const p = part.trim()
    if (!p) continue
    const m = /^(\d+)\s*-\s*(\d+)$/.exec(p)
    if (m) {
      let a = Number(m[1])
      let b = Number(m[2])
      if (a > b) [a, b] = [b, a]
      for (let i = a; i <= b; i++) if (i >= 1 && i <= total) out.add(i - 1)
    } else {
      const n = Number(p)
      if (n >= 1 && n <= total) out.add(n - 1)
    }
  }
  return [...out].sort((a, b) => a - b)
}
