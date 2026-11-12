export type PercentMode = 'of' | 'ratio' | 'change' | 'add' | 'sub'

export function percentage(mode: PercentMode, a: number, b: number): number | null {
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null
  switch (mode) {
    case 'of':
      return (a / 100) * b
    case 'ratio':
      if (b === 0) return null
      return (a / b) * 100
    case 'change':
      if (a === 0) return null
      return ((b - a) / a) * 100
    case 'add':
      return a * (1 + b / 100)
    case 'sub':
      return a * (1 - b / 100)
  }
}

export function formatPercentResult(value: number): string {
  if (!Number.isFinite(value)) return ''
  const text = String(value)
  return text.length < 14 ? text : String(Number(value.toPrecision(12)))
}
