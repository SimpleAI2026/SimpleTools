export interface PortOptions {
  count: number
  min: number
  max: number
}

export function clampPort(value: number, fallback: number): number {
  if (!Number.isFinite(value)) return fallback
  return Math.min(65535, Math.max(1, Math.round(value)))
}

export function randomPorts(options: PortOptions, random: (span: number) => number = cryptoIndex): number[] {
  const min = clampPort(options.min, 1024)
  const max = clampPort(options.max, 65535)
  const low = Math.min(min, max)
  const high = Math.max(min, max)
  const span = high - low + 1
  const count = Math.min(span, Math.max(1, Math.round(options.count) || 1))
  const picked = new Set<number>()
  while (picked.size < count) picked.add(low + random(span))
  return [...picked]
}

function cryptoIndex(span: number): number {
  const buf = new Uint32Array(1)
  const limit = Math.floor(0x100000000 / span) * span
  for (;;) {
    crypto.getRandomValues(buf)
    const value = buf[0] ?? 0
    if (value < limit) return value % span
  }
}
