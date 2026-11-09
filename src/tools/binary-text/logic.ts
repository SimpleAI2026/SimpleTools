export type Radix = 2 | 8 | 10 | 16

const WIDTH: Record<Radix, number> = { 2: 8, 8: 3, 10: 0, 16: 2 }

/** Text → space-separated UTF-8 byte values in the given radix. */
export function textToBytes(text: string, radix: Radix = 2): string {
  return Array.from(new TextEncoder().encode(text), (b) => b.toString(radix).padStart(WIDTH[radix], '0')).join(' ')
}

/** Space/comma separated byte values → text. Throws on invalid tokens or invalid UTF-8. */
export function bytesToText(input: string, radix: Radix = 2): string {
  const tokens = input.trim().split(/[\s,]+/).filter(Boolean)
  const digits = { 2: /^[01]+$/, 8: /^[0-7]+$/, 10: /^\d+$/, 16: /^(0x)?[0-9a-f]+$/i }[radix]
  const bytes = tokens.map((t) => {
    const v = digits.test(t) ? parseInt(t.replace(/^0x/i, ''), radix) : NaN
    if (!(v >= 0 && v <= 255)) throw new Error(t)
    return v
  })
  return new TextDecoder('utf-8', { fatal: true }).decode(new Uint8Array(bytes))
}
