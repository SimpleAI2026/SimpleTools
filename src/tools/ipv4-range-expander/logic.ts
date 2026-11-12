import { formatIPv4, parseIPv4 } from '@/lib/ipv4'

export function ipv4RangeToCidrs(startText: string, endText: string): string[] | null {
  const start = parseIPv4(startText)
  const end = parseIPv4(endText)
  if (start === null || end === null || start > end) return null
  const out: string[] = []
  let cursor = start
  while (cursor <= end) {
    let prefix = 32
    while (prefix > 0) {
      const bigger = 2 ** (33 - prefix)
      if ((cursor & (bigger - 1)) !== 0) break
      if (cursor + bigger - 1 > end) break
      prefix--
    }
    out.push(`${formatIPv4(cursor)}/${prefix}`)
    const size = 2 ** (32 - prefix)
    const next = cursor + size
    if (next > 0xffffffff) break
    cursor = next
  }
  return out
}
