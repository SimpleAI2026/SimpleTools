export type MacSeparator = ':' | '-' | ''

export interface MacOptions {
  prefix: string
  separator: MacSeparator
  uppercase: boolean
  local: boolean
  count: number
}

function parsePrefix(prefix: string): number[] {
  const hex = prefix.replace(/[^0-9a-f]/gi, '')
  if (hex.length % 2) return []
  const bytes: number[] = []
  for (let i = 0; i < hex.length && bytes.length < 6; i += 2) bytes.push(Number.parseInt(hex.slice(i, i + 2), 16))
  return bytes.every((byte) => byte <= 255) ? bytes : []
}

export function formatMac(bytes: number[], separator: MacSeparator, uppercase: boolean): string {
  const text = bytes.map((byte) => byte.toString(16).padStart(2, '0')).join(separator)
  return uppercase ? text.toUpperCase() : text.toLowerCase()
}

export function randomMacs(options: MacOptions, random: (max: number) => number = cryptoByte): string[] {
  const count = Math.min(100, Math.max(1, Math.round(options.count) || 1))
  const prefix = parsePrefix(options.prefix).slice(0, 5)
  const out: string[] = []
  for (let n = 0; n < count; n++) {
    const bytes = prefix.slice()
    while (bytes.length < 6) bytes.push(random(256))
    if (options.local && bytes.length) {
      const first = bytes[0] ?? 0
      bytes[0] = options.prefix.replace(/[^0-9a-f]/gi, '').length >= 2 ? first : (first | 0x02) & 0xfe
    }
    out.push(formatMac(bytes, options.separator, options.uppercase))
  }
  return out
}

function cryptoByte(max: number): number {
  const buf = new Uint8Array(1)
  const limit = Math.floor(256 / max) * max
  for (;;) {
    crypto.getRandomValues(buf)
    const value = buf[0] ?? 0
    if (value < limit) return value % max
  }
}
