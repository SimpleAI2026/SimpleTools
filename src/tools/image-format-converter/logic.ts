import type { RasterFormat } from '@/lib/canvas'

/** Formats the browser can decode as input (anything <img>/createImageBitmap supports). */
export const INPUT_ACCEPT = 'image/png,image/jpeg,image/webp,image/gif,image/bmp,image/avif,image/svg+xml,image/x-icon'

export function isLossy(f: RasterFormat): boolean {
  return f !== 'image/png'
}

export function sizeChange(before: number, after: number): number {
  return before ? Math.round(((after - before) / before) * 100) : 0
}

/** For SVG input (no intrinsic pixel size sometimes) choose a raster size. */
export function rasterSize(w: number, h: number, fallback = 1024): { width: number; height: number } {
  if (w > 0 && h > 0) return { width: w, height: h }
  return { width: fallback, height: fallback }
}
