export interface Size {
  width: number
  height: number
}

export const MAX_DIMENSION = 16384

function clampDim(n: number): number {
  return Math.min(MAX_DIMENSION, Math.max(1, Math.round(n)))
}

/** Compute the other dimension when aspect ratio is locked. */
export function fitAspect(original: Size, changed: 'width' | 'height', value: number): Size {
  const ratio = original.width / original.height
  if (changed === 'width') {
    const width = clampDim(value)
    return { width, height: clampDim(width / ratio) }
  }
  const height = clampDim(value)
  return { width: clampDim(height * ratio), height }
}

export function scaleByPercent(original: Size, percent: number): Size {
  const f = Math.max(0.01, percent / 100)
  return { width: clampDim(original.width * f), height: clampDim(original.height * f) }
}

export type OutputFormat = 'image/png' | 'image/jpeg' | 'image/webp'

export function extensionFor(format: OutputFormat): string {
  return format === 'image/jpeg' ? 'jpg' : format === 'image/png' ? 'png' : 'webp'
}

export function outputFilename(original: string, size: Size, format: OutputFormat): string {
  const base = original.replace(/\.[^./\\]+$/, '') || 'image'
  return `${base}-${size.width}x${size.height}.${extensionFor(format)}`
}

/** Pick a sensible default output format from the input MIME type. */
export function defaultFormat(mime: string): OutputFormat {
  if (mime === 'image/jpeg' || mime === 'image/webp') return mime
  return 'image/png'
}

/** Resize with a canvas. Browser-only. */
export async function resizeImage(file: Blob, size: Size, format: OutputFormat, quality = 0.92): Promise<Blob> {
  const bitmap = await createImageBitmap(file)
  try {
    const canvas = document.createElement('canvas')
    canvas.width = size.width
    canvas.height = size.height
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('canvas-unavailable')
    if (format === 'image/jpeg') {
      ctx.fillStyle = '#fff'
      ctx.fillRect(0, 0, size.width, size.height)
    }
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(bitmap, 0, 0, size.width, size.height)
    return await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('encode-failed'))), format, quality),
    )
  } finally {
    bitmap.close()
  }
}
