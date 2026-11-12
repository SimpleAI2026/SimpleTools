export const HMAC_ALGOS = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'] as const
export type HmacAlgo = (typeof HMAC_ALGOS)[number]
export type HmacEncoding = 'hex' | 'base64'

function bufferFrom(bytes: Uint8Array): ArrayBuffer {
  const copy = new ArrayBuffer(bytes.byteLength)
  new Uint8Array(copy).set(bytes)
  return copy
}

export async function hmacDigest(message: string, key: string, algo: HmacAlgo, encoding: HmacEncoding): Promise<string> {
  const cryptoKey = await crypto.subtle.importKey('raw', bufferFrom(new TextEncoder().encode(key)), { name: 'HMAC', hash: algo }, false, ['sign'])
  const signature = new Uint8Array(await crypto.subtle.sign('HMAC', cryptoKey, bufferFrom(new TextEncoder().encode(message))))
  if (encoding === 'hex') return [...signature].map((byte) => byte.toString(16).padStart(2, '0')).join('')
  let binary = ''
  for (const byte of signature) binary += String.fromCharCode(byte)
  return btoa(binary)
}
