/** pdf.js scale for a target DPI (PDF user space is 72 dpi). */
export const dpiScale = (dpi: number) => dpi / 72

/** `report-p03.png` style names, zero-padded to the page count width. */
export function imageFileName(base: string, page: number, total: number, ext: string): string {
  return `${base}-p${String(page).padStart(String(total).length, '0')}.${ext}`
}

/** Guard against canvases browsers refuse to allocate (~16k px side / 268M px area). */
export function clampScale(wPt: number, hPt: number, scale: number, maxSide = 16384, maxArea = 268e6): number {
  const s1 = Math.min(scale, maxSide / wPt, maxSide / hPt)
  return Math.min(s1, Math.sqrt(maxArea / (wPt * hPt)))
}
