/** Parse dotted-quad IPv4 into an unsigned 32-bit number. */
export function parseIPv4(s: string): number | null {
  const m = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(s.trim())
  if (!m) return null
  const parts = m.slice(1).map(Number)
  if (parts.some((p) => p > 255)) return null
  return parts.reduce((acc, p) => acc * 256 + p, 0)
}

export function formatIPv4(n: number): string {
  return [24, 16, 8, 0].map((s) => (n >>> s) & 255).join('.')
}

export function prefixToMask(prefix: number): number {
  return prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0
}

export function maskToPrefix(mask: number): number | null {
  const inv = ~mask >>> 0
  if ((inv & (inv + 1)) !== 0) return null
  return 32 - Math.log2(inv + 1)
}
