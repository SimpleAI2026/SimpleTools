export interface Stats {
  count: number
  min: number
  max: number
  mean: number
  median: number
  variance: number
  stdev: number
}

export function parseNumbers(text: string): number[] {
  return text
    .split(/[\s,;]+/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map(Number)
    .filter((value) => Number.isFinite(value))
}

export function summarize(values: number[]): Stats | null {
  if (!values.length) return null
  const sorted = [...values].sort((a, b) => a - b)
  const count = sorted.length
  const min = sorted[0] ?? 0
  const max = sorted[count - 1] ?? 0
  const mean = sorted.reduce((sum, value) => sum + value, 0) / count
  const mid = Math.floor(count / 2)
  const median = count % 2 ? (sorted[mid] ?? 0) : ((sorted[mid - 1] ?? 0) + (sorted[mid] ?? 0)) / 2
  const variance = count < 2 ? 0 : sorted.reduce((sum, value) => sum + (value - mean) ** 2, 0) / (count - 1)
  return { count, min, max, mean, median, variance, stdev: Math.sqrt(variance) }
}

export function formatStat(value: number): string {
  if (!Number.isFinite(value)) return ''
  const text = String(value)
  return text.length < 12 ? text : String(Number(value.toPrecision(8)))
}
