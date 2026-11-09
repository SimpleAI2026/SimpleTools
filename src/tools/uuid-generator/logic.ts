export interface UuidOptions {
  uppercase: boolean
  hyphens: boolean
  braces: boolean
}

export const UUID_V4_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
export const MAX_UUID_COUNT = 1000

export function formatUuid(uuid: string, o: UuidOptions): string {
  let s = o.hyphens ? uuid : uuid.replace(/-/g, '')
  s = o.uppercase ? s.toUpperCase() : s.toLowerCase()
  return o.braces ? `{${s}}` : s
}

export function generateUuids(count: number, o: UuidOptions, gen: () => string = () => crypto.randomUUID()): string[] {
  const n = Math.min(Math.max(Math.floor(count) || 0, 1), MAX_UUID_COUNT)
  return Array.from({ length: n }, () => formatUuid(gen(), o))
}

export function isValidUuid(s: string): boolean {
  return /^\{?[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}\}?$/i.test(s.trim())
}
