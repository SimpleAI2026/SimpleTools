import bcrypt from 'bcryptjs'

export const MIN_ROUNDS = 4
export const MAX_ROUNDS = 12
export const DEFAULT_ROUNDS = 10

bcrypt.setRandomFallback((length) => {
  const bytes = new Uint8Array(length)
  crypto.getRandomValues(bytes)
  return Array.from(bytes)
})

export function clampRounds(rounds: number): number {
  if (!Number.isFinite(rounds)) return DEFAULT_ROUNDS
  return Math.min(MAX_ROUNDS, Math.max(MIN_ROUNDS, Math.round(rounds)))
}

export async function hashBcrypt(password: string, rounds: number): Promise<string> {
  return bcrypt.hash(password, clampRounds(rounds))
}

const HASH_RE = /^\$2[aby]\$(\d{2})\$[./A-Za-z0-9]{53}$/

export function bcryptMeta(hash: string): { valid: boolean; rounds: number | null } {
  const match = HASH_RE.exec(hash.trim())
  if (!match) return { valid: false, rounds: null }
  return { valid: true, rounds: Number(match[1]) }
}

export async function verifyBcrypt(password: string, hash: string): Promise<boolean> {
  const trimmed = hash.trim()
  if (!bcryptMeta(trimmed).valid) return false
  try {
    return await bcrypt.compare(password, trimmed)
  } catch {
    return false
  }
}
