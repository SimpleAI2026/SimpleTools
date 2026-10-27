/** Unbiased crypto-random integer in [0, max). */
export function randomInt(max: number): number {
  if (!(max > 0) || max > 0x100000000) throw new Error('range')
  const limit = Math.floor(0x100000000 / max) * max
  const buf = new Uint32Array(1)
  for (;;) {
    crypto.getRandomValues(buf)
    const v = buf[0] as number
    if (v < limit) return v % max
  }
}

/** Crypto-random integer in [min, max] (inclusive). Supports ranges up to 2^32. */
export function randomBetween(min: number, max: number): number {
  return min + randomInt(max - min + 1)
}

export function shuffle<T>(arr: readonly T[], rand: (n: number) => number = randomInt): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = rand(i + 1)
    ;[a[i], a[j]] = [a[j] as T, a[i] as T]
  }
  return a
}
