import { randomInt, shuffle } from '@/lib/random'

export function parseNames(text: string, dedupe = true): string[] {
  const names = text.split(/[\n,，;；]+/).map((s) => s.trim()).filter(Boolean)
  return dedupe ? [...new Set(names)] : names
}

export function pickNames(names: readonly string[], count: number, rand = randomInt): string[] {
  if (names.length === 0) return []
  const n = Math.max(1, Math.min(count, names.length))
  return shuffle(names, rand).slice(0, n)
}

/** Split names into `groups` teams as evenly as possible after shuffling. */
export function makeTeams(names: readonly string[], groups: number, rand = randomInt): string[][] {
  const g = Math.max(1, Math.min(groups, names.length || 1))
  const teams: string[][] = Array.from({ length: g }, () => [])
  shuffle(names, rand).forEach((name, i) => teams[i % g]?.push(name))
  return teams
}
