import { randomBetween, shuffle } from '@/lib/random'

export interface RngOptions {
  min: number
  max: number
  count: number
  unique: boolean
  sort: 'none' | 'asc' | 'desc'
  decimals: number
}

export const MAX_COUNT = 10000

export function validateRng(o: RngOptions): string | null {
  if (!Number.isFinite(o.min) || !Number.isFinite(o.max)) return 'invalid'
  if (o.min > o.max) return 'minGtMax'
  if (!Number.isInteger(o.count) || o.count < 1 || o.count > MAX_COUNT) return 'count'
  const scale = 10 ** o.decimals
  const span = Math.floor(o.max * scale) - Math.ceil(o.min * scale) + 1
  if (span > 2 ** 32) return 'range'
  if (o.unique && o.count > span) return 'notEnough'
  return null
}

export function generateNumbers(o: RngOptions, rand: (lo: number, hi: number) => number = randomBetween): number[] {
  const err = validateRng(o)
  if (err) throw new Error(err)
  const scale = 10 ** o.decimals
  const lo = Math.ceil(o.min * scale)
  const hi = Math.floor(o.max * scale)
  let ints: number[]
  if (o.unique && o.count > (hi - lo + 1) / 2) {
    ints = shuffle(Array.from({ length: hi - lo + 1 }, (_, i) => lo + i)).slice(0, o.count)
  } else if (o.unique) {
    const set = new Set<number>()
    while (set.size < o.count) set.add(rand(lo, hi))
    ints = [...set]
  } else {
    ints = Array.from({ length: o.count }, () => rand(lo, hi))
  }
  const nums = ints.map((n) => Number((n / scale).toFixed(o.decimals)))
  if (o.sort === 'asc') nums.sort((a, b) => a - b)
  if (o.sort === 'desc') nums.sort((a, b) => b - a)
  return nums
}
