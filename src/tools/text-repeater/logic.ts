export const MAX_OUTPUT = 5_000_000

export function repeatText(text: string, times: number, separator: string, numbered = false): string {
  const n = Math.max(0, Math.floor(times) || 0)
  if (n === 0 || !text) return ''
  const est = (text.length + separator.length + (numbered ? 8 : 0)) * n
  if (est > MAX_OUTPUT) throw new Error('too-large')
  return Array.from({ length: n }, (_, i) => (numbered ? `${i + 1}. ${text}` : text)).join(separator)
}

export function parseSeparator(s: string): string {
  return s.replace(/\\n/g, '\n').replace(/\\t/g, '\t')
}
