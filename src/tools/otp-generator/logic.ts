const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'

export const OTP_ALGOS = ['SHA-1', 'SHA-256', 'SHA-512'] as const
export type OtpAlgo = (typeof OTP_ALGOS)[number]
export type OtpKind = 'totp' | 'hotp'

export interface OtpOptions {
  kind: OtpKind
  digits: 6 | 8
  period: number
  counter: number
  algo: OtpAlgo
  window: number
}

export function encodeBase32(bytes: Uint8Array): string {
  let bits = 0
  let value = 0
  let out = ''
  for (const byte of bytes) {
    value = (value << 8) | byte
    bits += 8
    while (bits >= 5) {
      bits -= 5
      out += ALPHABET[(value >>> bits) & 31] ?? ''
    }
  }
  if (bits > 0) out += ALPHABET[(value << (5 - bits)) & 31] ?? ''
  return out
}

export function decodeBase32(input: string): Uint8Array | null {
  const cleaned = input.toUpperCase().replace(/[\s=-]/g, '')
  if (!cleaned || /[^A-Z2-7]/.test(cleaned)) return null
  let bits = 0
  let value = 0
  const out: number[] = []
  for (const char of cleaned) {
    const idx = ALPHABET.indexOf(char)
    if (idx < 0) return null
    value = (value << 5) | idx
    bits += 5
    if (bits >= 8) {
      bits -= 8
      out.push((value >>> bits) & 255)
    }
  }
  return out.length ? new Uint8Array(out) : null
}

export function generateSecret(byteLength = 20): string {
  const size = Math.min(64, Math.max(10, Math.round(byteLength) || 20))
  const bytes = new Uint8Array(size)
  crypto.getRandomValues(bytes)
  return encodeBase32(bytes)
}

export function otpauthUri(opts: {
  kind: OtpKind
  secret: string
  account: string
  issuer: string
  digits: number
  period: number
  counter: number
  algo: OtpAlgo
}): string {
  const account = opts.account.trim() || 'user'
  const issuer = opts.issuer.trim()
  const label = encodeURIComponent(issuer ? `${issuer}:${account}` : account)
  const query = new URLSearchParams()
  query.set('secret', opts.secret.replace(/\s+/g, '').toUpperCase())
  if (issuer) query.set('issuer', issuer)
  query.set('algorithm', opts.algo.replace('-', ''))
  query.set('digits', String(opts.digits))
  if (opts.kind === 'totp') query.set('period', String(opts.period))
  else query.set('counter', String(opts.counter))
  return `otpauth://${opts.kind}/${label}?${query.toString()}`
}

function bytes(data: Uint8Array): ArrayBuffer {
  const copy = new ArrayBuffer(data.byteLength)
  new Uint8Array(copy).set(data)
  return copy
}

async function hmac(algo: OtpAlgo, keyBytes: Uint8Array, message: Uint8Array): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey('raw', bytes(keyBytes), { name: 'HMAC', hash: algo }, false, ['sign'])
  const sig = await crypto.subtle.sign('HMAC', key, bytes(message))
  return new Uint8Array(sig)
}

export async function hotp(secret: Uint8Array, counter: bigint, digits: number, algo: OtpAlgo): Promise<string> {
  const buf = new ArrayBuffer(8)
  const view = new DataView(buf)
  view.setUint32(0, Number((counter >> 32n) & 0xffffffffn))
  view.setUint32(4, Number(counter & 0xffffffffn))
  const sig = await hmac(algo, secret, new Uint8Array(buf))
  const offset = (sig.at(-1) ?? 0) & 0x0f
  const bin =
    (((sig[offset] ?? 0) & 0x7f) << 24) |
    ((sig[offset + 1] ?? 0) << 16) |
    ((sig[offset + 2] ?? 0) << 8) |
    (sig[offset + 3] ?? 0)
  return String(bin % 10 ** digits).padStart(digits, '0')
}

export function clampPeriod(period: number): number {
  if (!Number.isFinite(period)) return 30
  return Math.min(120, Math.max(15, Math.round(period)))
}

export async function totp(secret: Uint8Array, unixMs: number, period: number, digits: number, algo: OtpAlgo): Promise<string> {
  const step = clampPeriod(period)
  const counter = BigInt(Math.floor(unixMs / 1000 / step))
  return hotp(secret, counter, digits, algo)
}

export function secondsRemaining(unixMs: number, period: number): number {
  const step = clampPeriod(period)
  const elapsed = Math.floor(unixMs / 1000) % step
  return step - elapsed
}

export async function verifyOtp(
  secret: Uint8Array,
  code: string,
  opts: OtpOptions,
  unixMs: number,
): Promise<{ ok: boolean; delta: number | null }> {
  const normalized = code.replace(/\s+/g, '')
  if (!/^\d+$/.test(normalized)) return { ok: false, delta: null }
  const window = Math.min(5, Math.max(0, Math.round(opts.window) || 0))
  if (opts.kind === 'hotp') {
    const expected = await hotp(secret, BigInt(Math.max(0, Math.floor(opts.counter))), opts.digits, opts.algo)
    return { ok: expected === normalized, delta: expected === normalized ? 0 : null }
  }
  const step = clampPeriod(opts.period)
  const base = BigInt(Math.floor(unixMs / 1000 / step))
  for (let delta = -window; delta <= window; delta++) {
    const counter = base + BigInt(delta)
    if (counter < 0n) continue
    const expected = await hotp(secret, counter, opts.digits, opts.algo)
    if (expected === normalized) return { ok: true, delta }
  }
  return { ok: false, delta: null }
}
