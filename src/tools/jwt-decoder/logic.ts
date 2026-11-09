export interface DecodedJwt {
  header: Record<string, unknown>
  payload: Record<string, unknown>
  signature: string
  times: { claim: 'iat' | 'nbf' | 'exp'; date: Date }[]
  expired: boolean | null
}

function b64urlDecode(s: string): string {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (s.length % 4)) % 4)
  const bin = atob(b64)
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)))
}

export function decodeJwt(token: string, now: number = Date.now()): DecodedJwt {
  const parts = token.trim().replace(/^Bearer\s+/i, '').split('.')
  if (parts.length !== 3 && parts.length !== 2) throw new Error('parts')
  let header: unknown
  let payload: unknown
  try {
    header = JSON.parse(b64urlDecode(parts[0] as string))
    payload = JSON.parse(b64urlDecode(parts[1] as string))
  } catch {
    throw new Error('decode')
  }
  if (!header || typeof header !== 'object' || !payload || typeof payload !== 'object') throw new Error('decode')
  const p = payload as Record<string, unknown>
  const times = (['iat', 'nbf', 'exp'] as const).filter((c) => typeof p[c] === 'number').map((claim) => ({ claim, date: new Date((p[claim] as number) * 1000) }))
  return {
    header: header as Record<string, unknown>,
    payload: p,
    signature: parts[2] ?? '',
    times,
    expired: typeof p.exp === 'number' ? p.exp * 1000 < now : null,
  }
}

function b64url(bytes: Uint8Array): string {
  let s = ''
  for (const b of bytes) s += String.fromCharCode(b)
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/** Verify an HS256/384/512 signature with a shared secret. Returns null for unsupported algorithms. */
export async function verifyHmac(token: string, secret: string): Promise<boolean | null> {
  const parts = token.trim().replace(/^Bearer\s+/i, '').split('.')
  if (parts.length !== 3) return false
  const { header } = decodeJwt(token)
  const alg = String(header.alg)
  const hash = { HS256: 'SHA-256', HS384: 'SHA-384', HS512: 'SHA-512' }[alg]
  if (!hash) return null
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash }, false, ['sign'])
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${parts[0]}.${parts[1]}`))
  return b64url(new Uint8Array(sig)) === parts[2]
}
