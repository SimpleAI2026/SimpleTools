const CROCKFORD = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'

export const MAX_ULID_COUNT = 100

export function encodeTime(time: number): string {
  let n = Math.max(0, Math.floor(time))
  let out = ''
  for (let i = 0; i < 10; i++) {
    out = (CROCKFORD[n % 32] ?? '0') + out
    n = Math.floor(n / 32)
  }
  return out
}

export function encodeRandom(bytes: Uint8Array): string {
  let n = 0n
  for (const byte of bytes) n = (n << 8n) | BigInt(byte)
  let out = ''
  for (let i = 0; i < 16; i++) {
    out = (CROCKFORD[Number(n & 31n)] ?? '0') + out
    n >>= 5n
  }
  return out
}

export function decodeCrockford(char: string): number | null {
  const idx = CROCKFORD.indexOf(char.toUpperCase())
  return idx < 0 ? null : idx
}

export function parseUlid(value: string): { time: number; randomHex: string } | null {
  const text = value.trim().toUpperCase()
  if (!/^[0-9A-HJKMNP-TV-Z]{26}$/.test(text)) return null
  let time = 0
  for (let i = 0; i < 10; i++) {
    const digit = decodeCrockford(text[i] ?? '')
    if (digit === null) return null
    time = time * 32 + digit
  }
  let random = 0n
  for (let i = 10; i < 26; i++) {
    const digit = decodeCrockford(text[i] ?? '')
    if (digit === null) return null
    random = (random << 5n) | BigInt(digit)
  }
  return { time, randomHex: random.toString(16).padStart(20, '0') }
}

function randomBytes(size: number, fill?: (bytes: Uint8Array) => void): Uint8Array {
  const bytes = new Uint8Array(size)
  if (fill) fill(bytes)
  else crypto.getRandomValues(bytes)
  return bytes
}

function increment(bytes: Uint8Array): boolean {
  for (let i = bytes.length - 1; i >= 0; i--) {
    const value = bytes[i] ?? 0
    if (value < 255) {
      bytes[i] = value + 1
      return true
    }
    bytes[i] = 0
  }
  return false
}

export function generateUlids(count: number, now = Date.now(), fill?: (bytes: Uint8Array) => void): string[] {
  const total = Math.min(MAX_ULID_COUNT, Math.max(1, Number.isFinite(count) ? Math.round(count) : 1))
  const time = encodeTime(now)
  const bytes = randomBytes(10, fill)
  const out: string[] = []
  for (let i = 0; i < total; i++) {
    out.push(time + encodeRandom(bytes))
    if (!increment(bytes)) bytes.fill(0)
  }
  return out
}
