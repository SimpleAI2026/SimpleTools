export type BitOp = 'and' | 'or' | 'xor' | 'nand' | 'nor' | 'xnor' | 'shl' | 'shr' | 'sar' | 'notA'
export const BIT_OPS: BitOp[] = ['and', 'or', 'xor', 'nand', 'nor', 'xnor', 'shl', 'shr', 'sar', 'notA']
export type Width = 8 | 16 | 32 | 64

/** Parse decimal, 0x hex, 0b binary, 0o octal (optionally negative, underscores allowed). */
export function parseBigInt(input: string): bigint | null {
  const s = input.trim().replace(/_/g, '')
  const m = /^(-)?(0x[0-9a-f]+|0b[01]+|0o[0-7]+|\d+)$/i.exec(s)
  if (!m) return null
  const v = BigInt(m[2] as string)
  return m[1] ? -v : v
}

const mask = (w: Width) => (1n << BigInt(w)) - 1n

export function toUnsigned(v: bigint, w: Width): bigint {
  return v & mask(w)
}
export function toSigned(v: bigint, w: Width): bigint {
  return BigInt.asIntN(w, v)
}

export function compute(a: bigint, b: bigint, op: BitOp, w: Width): bigint {
  const m = mask(w)
  const ua = a & m
  const ub = b & m
  const sh = Number(ub % BigInt(w))
  switch (op) {
    case 'and': return ua & ub
    case 'or': return ua | ub
    case 'xor': return ua ^ ub
    case 'nand': return ~(ua & ub) & m
    case 'nor': return ~(ua | ub) & m
    case 'xnor': return ~(ua ^ ub) & m
    case 'shl': return (ua << BigInt(sh)) & m
    case 'shr': return ua >> BigInt(sh)
    case 'sar': return BigInt.asUintN(w, BigInt.asIntN(w, ua) >> BigInt(sh))
    case 'notA': return ~ua & m
  }
}

export function formatBits(v: bigint, w: Width): string {
  return toUnsigned(v, w).toString(2).padStart(w, '0').replace(/(.{4})(?=.)/g, '$1 ')
}
