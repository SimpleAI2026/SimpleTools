import { randomBetween } from '@/lib/random'

export type Coin = 'heads' | 'tails'
export const DICE_SIDES = [4, 6, 8, 10, 12, 20, 100] as const

export function flipCoins(n: number, rand = randomBetween): Coin[] {
  return Array.from({ length: Math.max(1, Math.min(100, n)) }, () => (rand(0, 1) === 0 ? 'heads' : 'tails'))
}

export function rollDice(n: number, sides: number, rand = randomBetween): number[] {
  return Array.from({ length: Math.max(1, Math.min(100, n)) }, () => rand(1, sides))
}

/** Parse dice notation like "2d6+3", "d20", "3d8-1". */
export function parseNotation(s: string): { count: number; sides: number; modifier: number } | null {
  const m = /^\s*(\d*)\s*d\s*(\d+)\s*([+-]\s*\d+)?\s*$/i.exec(s)
  if (!m) return null
  const count = m[1] ? Number(m[1]) : 1
  const sides = Number(m[2])
  const modifier = m[3] ? Number(m[3].replace(/\s+/g, '')) : 0
  if (count < 1 || count > 100 || sides < 2 || sides > 1000) return null
  return { count, sides, modifier }
}

export function summarize(values: number[]): { total: number; min: number; max: number; avg: number } {
  if (values.length === 0) return { total: 0, min: 0, max: 0, avg: 0 }
  const total = values.reduce((a, b) => a + b, 0)
  return { total, min: Math.min(...values), max: Math.max(...values), avg: total / values.length }
}
