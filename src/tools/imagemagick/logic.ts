/** Formats we expose in the UI (subset; worker also reports Magick.supportedFormats). */
export const IM_FORMATS = [
  'JPEG', 'PNG', 'WEBP', 'GIF', 'BMP', 'TIFF', 'AVIF', 'HEIC', 'PDF', 'PSD', 'SVG', 'ICO',
] as const
export type ImFormat = (typeof IM_FORMATS)[number]

export const IM_MIME: Record<string, string> = {
  JPEG: 'image/jpeg', PNG: 'image/png', WEBP: 'image/webp', GIF: 'image/gif', BMP: 'image/bmp',
  TIFF: 'image/tiff', AVIF: 'image/avif', HEIC: 'image/heic', PDF: 'application/pdf',
  PSD: 'image/vnd.adobe.photoshop', SVG: 'image/svg+xml', ICO: 'image/x-icon',
}

export const IM_EXT: Record<string, string> = {
  JPEG: 'jpg', PNG: 'png', WEBP: 'webp', GIF: 'gif', BMP: 'bmp', TIFF: 'tiff',
  AVIF: 'avif', HEIC: 'heic', PDF: 'pdf', PSD: 'psd', SVG: 'svg', ICO: 'ico',
}

export type MagickOp =
  | { type: 'autoOrient' }
  | { type: 'resize'; maxWidth: number; maxHeight: number }
  | { type: 'crop'; x: number; y: number; width: number; height: number }
  | { type: 'rotate'; degrees: number }
  | { type: 'flip' }
  | { type: 'flop' }
  | { type: 'blur'; radius: number; sigma: number }
  | { type: 'sharpen'; radius: number; sigma: number }
  | { type: 'modulate'; brightness: number; saturation: number; hue: number }
  | { type: 'quality'; value: number }

export function fitSize(w: number, h: number, maxW: number, maxH: number): { width: number; height: number } {
  const k = Math.min(1, maxW > 0 ? maxW / w : 1, maxH > 0 ? maxH / h : 1)
  return { width: Math.max(1, Math.round(w * k)), height: Math.max(1, Math.round(h * k)) }
}

export function withFormatExt(name: string, format: string): string {
  const base = name.replace(/\.[^.]+$/, '') || 'image'
  return `${base}.${IM_EXT[format] ?? format.toLowerCase()}`
}

export function clampQuality(q: number): number {
  return Math.min(100, Math.max(1, Math.round(q)))
}

/** Build ordered pipeline from UI flags (skip no-ops). */
export function buildPipeline(o: {
  autoOrient: boolean
  maxWidth: number
  maxHeight: number
  cropEnabled: boolean
  cropX: number
  cropY: number
  cropW: number
  cropH: number
  rotate: number
  flip: boolean
  flop: boolean
  blurEnabled: boolean
  blurRadius: number
  blurSigma: number
  sharpenEnabled: boolean
  sharpenRadius: number
  sharpenSigma: number
  modulateEnabled: boolean
  brightness: number
  saturation: number
  hue: number
  quality: number
}): MagickOp[] {
  const ops: MagickOp[] = []
  if (o.autoOrient) ops.push({ type: 'autoOrient' })
  if (o.cropEnabled && o.cropW > 0 && o.cropH > 0) {
    ops.push({ type: 'crop', x: o.cropX, y: o.cropY, width: o.cropW, height: o.cropH })
  }
  if ((o.maxWidth > 0 || o.maxHeight > 0)) ops.push({ type: 'resize', maxWidth: o.maxWidth, maxHeight: o.maxHeight })
  if (o.rotate) ops.push({ type: 'rotate', degrees: o.rotate })
  if (o.flip) ops.push({ type: 'flip' })
  if (o.flop) ops.push({ type: 'flop' })
  if (o.blurEnabled) ops.push({ type: 'blur', radius: o.blurRadius, sigma: o.blurSigma })
  if (o.sharpenEnabled) ops.push({ type: 'sharpen', radius: o.sharpenRadius, sigma: o.sharpenSigma })
  if (o.modulateEnabled) ops.push({ type: 'modulate', brightness: o.brightness, saturation: o.saturation, hue: o.hue })
  ops.push({ type: 'quality', value: clampQuality(o.quality) })
  return ops
}
