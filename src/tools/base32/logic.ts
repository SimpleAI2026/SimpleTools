const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'

/** RFC 4648 Base32 encode of UTF-8 text. */
export function encodeBase32(text: string, padding = true): string {
  const bytes = new TextEncoder().encode(text)
  let bits = 0
  let value = 0
  let out = ''
  for (const b of bytes) {
    value = (value << 8) | b
    bits += 8
    while (bits >= 5) {
      out += ALPHABET[(value >>> (bits - 5)) & 31]
      bits -= 5
    }
  }
  if (bits > 0) out += ALPHABET[(value << (5 - bits)) & 31]
  if (padding) while (out.length % 8) out += '='
  return out
}

export function decodeBase32(input: string): string {
  const s = input.replace(/\s+/g, '').replace(/=+$/, '').toUpperCase()
  let bits = 0
  let value = 0
  const out: number[] = []
  for (const c of s) {
    const i = ALPHABET.indexOf(c)
    if (i < 0) throw new Error('invalid')
    value = (value << 5) | i
    bits += 5
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 255)
      bits -= 8
    }
  }
  return new TextDecoder('utf-8', { fatal: true }).decode(new Uint8Array(out))
}
