export type CompressFormat = 'keep' | 'image/jpeg' | 'image/webp' | 'image/png'

export interface CompressOptions {
  quality: number // 0..1
  maxWidth: number // 0 = unlimited
  maxHeight: number
  format: CompressFormat
}

export interface CompressRequest extends CompressOptions {
  id: number
  file: Blob
}
export type CompressResponse = { id: number; ok: true; blob: Blob; width: number; height: number } | { id: number; ok: false; error: string }

/** Fit inside maxWidth × maxHeight, never upscale. 0 means no limit on that axis. */
export function fitWithin(w: number, h: number, maxW: number, maxH: number): { width: number; height: number } {
  const k = Math.min(1, maxW > 0 ? maxW / w : 1, maxH > 0 ? maxH / h : 1)
  return { width: Math.max(1, Math.round(w * k)), height: Math.max(1, Math.round(h * k)) }
}

/** Resolve the output MIME type; PNG/GIF/BMP inputs default to WebP when "keep" would not compress. */
export function outputType(inputType: string, f: CompressFormat): 'image/jpeg' | 'image/webp' | 'image/png' {
  if (f !== 'keep') return f
  if (inputType === 'image/jpeg' || inputType === 'image/webp' || inputType === 'image/png') return inputType
  return 'image/webp'
}

export function savings(before: number, after: number): number {
  return before ? Math.round((1 - after / before) * 100) : 0
}
