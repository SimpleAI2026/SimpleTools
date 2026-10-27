export type RasterFormat = 'image/png' | 'image/jpeg' | 'image/webp'

export const RASTER_EXT: Record<RasterFormat, string> = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp' }

/** Replace (or add) a file extension. */
export function withExt(name: string, ext: string, suffix = ''): string {
  const base = name.replace(/\.[^./\\]+$/, '') || 'image'
  return `${base}${suffix}.${ext}`
}

export function makeCanvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement('canvas')
  c.width = Math.max(1, Math.round(w))
  c.height = Math.max(1, Math.round(h))
  const ctx = c.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D is not available')
  return [c, ctx]
}

export function canvasToBlob(c: HTMLCanvasElement, type: RasterFormat = 'image/png', quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => c.toBlob((b) => (b ? resolve(b) : reject(new Error('Encoding failed'))), type, quality))
}

/** Decode an image file (respecting EXIF orientation where the browser supports it). */
export function loadBitmap(file: Blob): Promise<ImageBitmap> {
  return createImageBitmap(file, { imageOrientation: 'from-image' })
}

/** Fill the background before drawing when the target format has no alpha channel. */
export function fillIfOpaque(ctx: CanvasRenderingContext2D, type: RasterFormat, color = '#ffffff') {
  if (type !== 'image/jpeg') return
  ctx.fillStyle = color
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
}
