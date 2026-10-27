import { formatIPv4, parseIPv4 } from '@/lib/ipv4'

export interface Ipv4Formats {
  dotted: string
  decimal: string
  hex: string
  binary: string
  octalDotted: string
  hexDotted: string
  ipv6Mapped: string
}

/** Accept dotted, decimal integer, 0x hex, or 32-bit binary. */
export function parseAnyIPv4(input: string): number | null {
  const s = input.trim().replace(/\s+/g, '')
  const dotted = parseIPv4(s)
  if (dotted !== null) return dotted
  if (/^0x[0-9a-f]{1,8}$/i.test(s)) return parseInt(s, 16)
  if (/^[01.]{32,35}$/.test(s) && s.replace(/\./g, '').length === 32) return parseInt(s.replace(/\./g, ''), 2)
  if (/^\d{1,10}$/.test(s) && Number(s) <= 0xffffffff) return Number(s)
  return null
}

export function ipv4Formats(n: number): Ipv4Formats {
  const octets = formatIPv4(n).split('.').map(Number)
  const hex = n.toString(16).padStart(8, '0')
  return {
    dotted: formatIPv4(n),
    decimal: String(n),
    hex: '0x' + hex.toUpperCase(),
    binary: octets.map((o) => o.toString(2).padStart(8, '0')).join('.'),
    octalDotted: octets.map((o) => '0' + o.toString(8)).join('.'),
    hexDotted: octets.map((o) => '0x' + o.toString(16).padStart(2, '0')).join('.'),
    ipv6Mapped: `::ffff:${hex.slice(0, 4)}:${hex.slice(4)}`,
  }
}
