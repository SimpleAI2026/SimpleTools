export interface ParsedUrl {
  href: string
  protocol: string
  username: string
  password: string
  hostname: string
  port: string
  pathname: string
  search: string
  hash: string
  origin: string
  params: [string, string][]
}

export function parseUrl(input: string): ParsedUrl | null {
  const s = input.trim()
  if (!s) return null
  let u: URL
  try {
    u = new URL(s)
  } catch {
    try {
      u = new URL(`https://${s}`)
      if (!u.hostname.includes('.') && u.hostname !== 'localhost') return null
    } catch {
      return null
    }
  }
  return {
    href: u.href,
    protocol: u.protocol,
    username: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    hostname: u.hostname,
    port: u.port,
    pathname: decodeURIComponent(u.pathname),
    search: u.search,
    hash: u.hash,
    origin: u.origin,
    params: [...u.searchParams.entries()],
  }
}

/** Rebuild a URL with edited query params. */
export function withParams(href: string, params: [string, string][]): string {
  const u = new URL(href)
  u.search = ''
  for (const [k, v] of params) if (k) u.searchParams.append(k, v)
  return u.href
}
