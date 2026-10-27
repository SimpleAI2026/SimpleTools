export interface PasswordOptions {
  length: number
  lower: boolean
  upper: boolean
  digits: boolean
  symbols: boolean
  excludeSimilar: boolean
}

export const CHARSETS = {
  lower: 'abcdefghijklmnopqrstuvwxyz',
  upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  digits: '0123456789',
  symbols: '!@#$%^&*()-_=+[]{};:,.<>?/~',
} as const
const SIMILAR = /[il1Lo0O|]/g

export type RandomInt = (maxExclusive: number) => number

/** Unbiased random integer in [0, max) using rejection sampling over crypto.getRandomValues. */
export const cryptoRandomInt: RandomInt = (max) => {
  if (max <= 0) throw new Error('max must be > 0')
  const limit = Math.floor(0x100000000 / max) * max
  const buf = new Uint32Array(1)
  for (;;) {
    crypto.getRandomValues(buf)
    const v = buf[0] as number
    if (v < limit) return v % max
  }
}

export function activeSets(o: PasswordOptions): string[] {
  const sets: string[] = []
  for (const key of ['lower', 'upper', 'digits', 'symbols'] as const) {
    if (o[key]) {
      const s = o.excludeSimilar ? CHARSETS[key].replace(SIMILAR, '') : CHARSETS[key]
      if (s) sets.push(s)
    }
  }
  return sets
}

/** Generate a password guaranteeing at least one char of each selected set. */
export function generatePassword(o: PasswordOptions, rand: RandomInt = cryptoRandomInt): string {
  const sets = activeSets(o)
  if (sets.length === 0) throw new Error('no-charset')
  const length = Math.max(o.length, sets.length)
  const all = sets.join('')
  const chars = sets.map((s) => s[rand(s.length)] as string)
  while (chars.length < length) chars.push(all[rand(all.length)] as string)
  for (let i = chars.length - 1; i > 0; i--) {
    const j = rand(i + 1)
    ;[chars[i], chars[j]] = [chars[j] as string, chars[i] as string]
  }
  return chars.join('')
}

/** Entropy in bits assuming uniform choice from the pool. */
export function entropyBits(o: PasswordOptions): number {
  const pool = activeSets(o).join('').length
  return pool === 0 ? 0 : Math.round(o.length * Math.log2(pool))
}

export type Strength = 'weak' | 'fair' | 'strong' | 'veryStrong'
export function strengthOf(bits: number): Strength {
  if (bits < 40) return 'weak'
  if (bits < 60) return 'fair'
  if (bits < 100) return 'strong'
  return 'veryStrong'
}
