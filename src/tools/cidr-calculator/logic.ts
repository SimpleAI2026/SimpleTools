import { formatIPv4, maskToPrefix, parseIPv4, prefixToMask } from '@/lib/ipv4'

export interface CidrInfo {
  network: string
  broadcast: string
  netmask: string
  wildcard: string
  prefix: number
  firstHost: string
  lastHost: string
  totalAddresses: number
  usableHosts: number
  ipClass: string
  isPrivate: boolean
}

/** Accepts "10.0.0.5/24" or "10.0.0.5 255.255.255.0". */
export function parseCidr(input: string): { ip: number; prefix: number } | null {
  const s = input.trim()
  const m = /^([\d.]+)\s*(?:\/\s*(\d{1,2})|\s+([\d.]+))?$/.exec(s)
  if (!m) return null
  const ip = parseIPv4(m[1] as string)
  if (ip === null) return null
  let prefix = 32
  if (m[2] !== undefined) prefix = Number(m[2])
  else if (m[3] !== undefined) {
    const mask = parseIPv4(m[3])
    const p = mask === null ? null : maskToPrefix(mask)
    if (p === null) return null
    prefix = p
  }
  return prefix > 32 ? null : { ip, prefix }
}

export function cidrInfo(ip: number, prefix: number): CidrInfo {
  const mask = prefixToMask(prefix)
  const network = (ip & mask) >>> 0
  const broadcast = (network | (~mask >>> 0)) >>> 0
  const total = 2 ** (32 - prefix)
  const usable = prefix >= 31 ? total : total - 2
  const first = prefix >= 31 ? network : network + 1
  const last = prefix >= 31 ? broadcast : broadcast - 1
  const a = network >>> 24
  const ipClass = a < 128 ? 'A' : a < 192 ? 'B' : a < 224 ? 'C' : a < 240 ? 'D' : 'E'
  const inRange = (base: string, p: number) => ((ip & prefixToMask(p)) >>> 0) === parseIPv4(base)
  return {
    network: formatIPv4(network),
    broadcast: formatIPv4(broadcast),
    netmask: formatIPv4(mask),
    wildcard: formatIPv4(~mask >>> 0),
    prefix,
    firstHost: formatIPv4(first),
    lastHost: formatIPv4(last),
    totalAddresses: total,
    usableHosts: usable,
    ipClass,
    isPrivate: inRange('10.0.0.0', 8) || inRange('172.16.0.0', 12) || inRange('192.168.0.0', 16),
  }
}

/** Split a network into subnets of a longer prefix (max 256 rows). */
export function splitSubnets(ip: number, prefix: number, newPrefix: number, limit = 256): string[] {
  if (newPrefix < prefix || newPrefix > 32) return []
  const base = (ip & prefixToMask(prefix)) >>> 0
  const size = 2 ** (32 - newPrefix)
  const count = Math.min(2 ** (newPrefix - prefix), limit)
  return Array.from({ length: count }, (_, i) => `${formatIPv4(base + i * size)}/${newPrefix}`)
}
