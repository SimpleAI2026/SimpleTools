export const HASH_ALGORITHMS = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'] as const
export type HashAlgorithm = (typeof HASH_ALGORITHMS)[number]

export function toHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join('')
}

export async function hashData(data: string | ArrayBuffer, algorithm: HashAlgorithm): Promise<string> {
  const bytes = typeof data === 'string' ? new TextEncoder().encode(data) : new Uint8Array(data)
  return toHex(await crypto.subtle.digest(algorithm, bytes))
}

export async function hashAll(data: string | ArrayBuffer): Promise<Record<HashAlgorithm, string>> {
  const entries = await Promise.all(HASH_ALGORITHMS.map(async (a) => [a, await hashData(data, a)] as const))
  return Object.fromEntries(entries) as Record<HashAlgorithm, string>
}
