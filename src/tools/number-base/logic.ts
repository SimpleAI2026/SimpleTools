const DIGITS = '0123456789abcdefghijklmnopqrstuvwxyz'

/** Parse an integer string in the given base (2–36) into a BigInt; accepts 0x/0b/0o prefixes, "_" and spaces. */
export function parseBase(input: string, base: number): bigint {
  let s = input.trim().toLowerCase().replace(/[_\s]/g, '')
  let neg = false
  if (s.startsWith('-')) {
    neg = true
    s = s.slice(1)
  }
  const prefix = { 16: '0x', 2: '0b', 8: '0o' }[base]
  if (prefix && s.startsWith(prefix)) s = s.slice(2)
  if (!s) throw new Error('Empty number')
  let v = 0n
  const b = BigInt(base)
  for (const ch of s) {
    const d = DIGITS.indexOf(ch)
    if (d < 0 || d >= base) throw new Error(`Invalid digit "${ch}" for base ${base}`)
    v = v * b + BigInt(d)
  }
  return neg ? -v : v
}

export function toBase(v: bigint, base: number): string {
  if (base < 2 || base > 36) throw new Error('Base must be 2–36')
  return v.toString(base)
}

/** Group digits from the right, e.g. 4 for binary/hex. */
export function groupDigits(s: string, size: number, sep = ' '): string {
  if (size <= 0) return s
  const neg = s.startsWith('-')
  const d = neg ? s.slice(1) : s
  const out: string[] = []
  for (let i = d.length; i > 0; i -= size) out.unshift(d.slice(Math.max(0, i - size), i))
  return (neg ? '-' : '') + out.join(sep)
}

/** Two's complement bit pattern of a (possibly negative) value at the given width. */
export function twosComplement(v: bigint, bits: number): string {
  const mask = (1n << BigInt(bits)) - 1n
  return (BigInt.asUintN(bits, v) & mask).toString(2).padStart(bits, '0')
}
