export interface PasswordReport {
  length: number
  charset: number
  entropyBits: number
  rating: 'empty' | 'weak' | 'fair' | 'strong'
  guessesPerSecond: number
  seconds: number | null
}

const OFFLINE_GUESSES = 10_000_000_000

export function analyzePassword(password: string): PasswordReport {
  const length = [...password].length
  let charset = 0
  if (/[a-z]/.test(password)) charset += 26
  if (/[A-Z]/.test(password)) charset += 26
  if (/\d/.test(password)) charset += 10
  if (/[^\da-zA-Z]/.test(password)) charset += 33
  const entropyBits = length && charset ? length * Math.log2(charset) : 0
  const rating = entropyBits <= 0 ? 'empty' : entropyBits < 40 ? 'weak' : entropyBits < 60 ? 'fair' : 'strong'
  const seconds = entropyBits <= 0 ? null : 2 ** (entropyBits - Math.log2(OFFLINE_GUESSES))
  return { length, charset, entropyBits, rating, guessesPerSecond: OFFLINE_GUESSES, seconds }
}

export function formatDuration(seconds: number | null): string {
  if (seconds === null || !Number.isFinite(seconds)) return ''
  if (seconds < 1) return '< 1s'
  const units: [number, string][] = [
    [60, 's'],
    [60, 'm'],
    [24, 'h'],
    [365, 'd'],
    [Number.POSITIVE_INFINITY, 'y'],
  ]
  let value = seconds
  let label = 's'
  for (const [size, name] of units) {
    if (value < size) {
      label = name
      break
    }
    value /= size
    label = name === 's' ? 'm' : name === 'm' ? 'h' : name === 'h' ? 'd' : 'y'
  }
  const shown = value >= 100 ? Math.round(value) : Math.round(value * 10) / 10
  return `${shown}${label}`
}
