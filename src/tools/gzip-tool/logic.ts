import { deflate, gunzip, gzip, inflate, unzlib, zlib, type AsyncDeflateOptions } from 'fflate'

export type GzFormat = 'gzip' | 'zlib' | 'deflate-raw'
export const GZ_EXT: Record<GzFormat, string> = { gzip: '.gz', zlib: '.zz', 'deflate-raw': '.deflate' }

type Level = NonNullable<AsyncDeflateOptions['level']>
const wrap = (fn: (d: Uint8Array, o: AsyncDeflateOptions, cb: (e: Error | null, r: Uint8Array) => void) => unknown, d: Uint8Array, o: AsyncDeflateOptions) =>
  new Promise<Uint8Array>((res, rej) => fn(d, o, (e, r) => (e ? rej(e) : res(r))))
const wrapIn = (fn: (d: Uint8Array, cb: (e: Error | null, r: Uint8Array) => void) => unknown, d: Uint8Array) =>
  new Promise<Uint8Array>((res, rej) => fn(d, (e, r) => (e ? rej(e) : res(r))))

/** Compress with fflate (async API runs off the main thread). */
export function compress(data: Uint8Array, fmt: GzFormat, level = 6): Promise<Uint8Array> {
  const o = { level: Math.min(9, Math.max(0, Math.round(level))) as Level }
  return fmt === 'gzip' ? wrap(gzip, data, o) : fmt === 'zlib' ? wrap(zlib, data, o) : wrap(deflate, data, o)
}

/** Detect the container from magic bytes. */
export function detectFormat(d: Uint8Array): GzFormat {
  if (d[0] === 0x1f && d[1] === 0x8b) return 'gzip'
  if (d.length > 1 && (d[0]! & 0x0f) === 8 && ((d[0]! << 8) | d[1]!) % 31 === 0) return 'zlib'
  return 'deflate-raw'
}

export async function decompress(data: Uint8Array, fmt: GzFormat | 'auto' = 'auto'): Promise<{ data: Uint8Array; format: GzFormat }> {
  const f = fmt === 'auto' ? detectFormat(data) : fmt
  const out = f === 'gzip' ? await wrapIn(gunzip, data) : f === 'zlib' ? await wrapIn(unzlib, data) : await wrapIn(inflate, data)
  return { data: out, format: f }
}

export function ratio(original: number, compressed: number): string {
  return original ? `${((compressed / original) * 100).toFixed(1)}%` : '—'
}

/** Original filename stored in a gzip header (FNAME flag), if any. */
export function gzipName(d: Uint8Array): string | null {
  if (d[0] !== 0x1f || d[1] !== 0x8b || !(d[3]! & 0x08)) return null
  let i = 10
  if (d[3]! & 0x04) i += 2 + (d[10]! | (d[11]! << 8))
  const start = i
  while (i < d.length && d[i] !== 0) i++
  return new TextDecoder('latin1').decode(d.subarray(start, i)) || null
}

export function looksLikeText(d: Uint8Array): boolean {
  const n = Math.min(d.length, 4096)
  let bad = 0
  for (let i = 0; i < n; i++) {
    const c = d[i]!
    if (c === 0) return false
    if (c < 9 || (c > 13 && c < 32)) bad++
  }
  return bad / Math.max(1, n) < 0.02
}
