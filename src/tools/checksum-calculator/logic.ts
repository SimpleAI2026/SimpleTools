let CRC_TABLE: Uint32Array | null = null
export function crc32(data: Uint8Array): number {
  if (!CRC_TABLE) {
    CRC_TABLE = new Uint32Array(256)
    for (let n = 0; n < 256; n++) {
      let c = n
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
      CRC_TABLE[n] = c >>> 0
    }
  }
  let crc = 0xffffffff
  for (const b of data) crc = (CRC_TABLE[(crc ^ b) & 0xff] as number) ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}

export function adler32(data: Uint8Array): number {
  let a = 1
  let b = 0
  for (const d of data) {
    a = (a + d) % 65521
    b = (b + a) % 65521
  }
  return ((b << 16) | a) >>> 0
}

/** Compact RFC 1321 MD5 (for checksums only, not security). */
export function md5(data: Uint8Array): string {
  const s = [7, 12, 17, 22, 5, 9, 14, 20, 4, 11, 16, 23, 6, 10, 15, 21]
  const K = Array.from({ length: 64 }, (_, i) => Math.floor(Math.abs(Math.sin(i + 1)) * 2 ** 32) >>> 0)
  const len = data.length
  const padLen = ((len + 8) >> 6) * 64 + 64
  const buf = new Uint8Array(padLen)
  buf.set(data)
  buf[len] = 0x80
  const view = new DataView(buf.buffer)
  view.setUint32(padLen - 8, (len * 8) >>> 0, true)
  view.setUint32(padLen - 4, Math.floor((len * 8) / 2 ** 32), true)
  let [a0, b0, c0, d0] = [0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476]
  for (let off = 0; off < padLen; off += 64) {
    let [A, B, C, D] = [a0, b0, c0, d0]
    for (let i = 0; i < 64; i++) {
      let F: number
      let g: number
      if (i < 16) [F, g] = [(B & C) | (~B & D), i]
      else if (i < 32) [F, g] = [(D & B) | (~D & C), (5 * i + 1) % 16]
      else if (i < 48) [F, g] = [B ^ C ^ D, (3 * i + 5) % 16]
      else [F, g] = [C ^ (B | ~D), (7 * i) % 16]
      F = (F + A + (K[i] as number) + view.getUint32(off + g * 4, true)) >>> 0
      A = D
      D = C
      C = B
      const sh = s[(i >> 4) * 4 + (i % 4)] as number
      B = (B + ((F << sh) | (F >>> (32 - sh)))) >>> 0
    }
    a0 = (a0 + A) >>> 0
    b0 = (b0 + B) >>> 0
    c0 = (c0 + C) >>> 0
    d0 = (d0 + D) >>> 0
  }
  const out = new DataView(new ArrayBuffer(16))
  ;[a0, b0, c0, d0].forEach((v, i) => out.setUint32(i * 4, v, true))
  return Array.from(new Uint8Array(out.buffer), (b) => b.toString(16).padStart(2, '0')).join('')
}

const hex = (buf: ArrayBuffer) => Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join('')
const hex32 = (n: number) => n.toString(16).padStart(8, '0')

export const ALGOS = ['CRC32', 'Adler-32', 'MD5', 'SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'] as const
export type Algo = (typeof ALGOS)[number]

export async function checksums(data: Uint8Array): Promise<Record<Algo, string>> {
  const sha = async (a: string) => hex(await crypto.subtle.digest(a, data as BufferSource))
  return {
    CRC32: hex32(crc32(data)),
    'Adler-32': hex32(adler32(data)),
    MD5: md5(data),
    'SHA-1': await sha('SHA-1'),
    'SHA-256': await sha('SHA-256'),
    'SHA-384': await sha('SHA-384'),
    'SHA-512': await sha('SHA-512'),
  }
}

export async function hmac(data: Uint8Array, key: string, hash: 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512'): Promise<string> {
  const k = await crypto.subtle.importKey('raw', new TextEncoder().encode(key), { name: 'HMAC', hash }, false, ['sign'])
  return hex(await crypto.subtle.sign('HMAC', k, data as BufferSource))
}

/** Compare an expected checksum against computed values (case/space-insensitive). */
export function findMatch(expected: string, sums: Partial<Record<Algo, string>>): Algo | null {
  const e = expected.trim().toLowerCase().replace(/\s+/g, '')
  if (!e) return null
  return (Object.entries(sums).find(([, v]) => v === e)?.[0] as Algo | undefined) ?? null
}
