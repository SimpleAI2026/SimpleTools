export const RSA_SIZES = [2048, 3072, 4096] as const
export type RsaSize = (typeof RSA_SIZES)[number]
export type RsaPurpose = 'sign' | 'encrypt'

export interface RsaPem {
  publicKey: string
  privateKey: string
  bits: RsaSize
  purpose: RsaPurpose
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = ''
  const chunk = 0x8000
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk))
  }
  return btoa(binary)
}

export function toPem(der: ArrayBuffer, label: 'PUBLIC KEY' | 'PRIVATE KEY'): string {
  const body = bytesToBase64(new Uint8Array(der)).match(/.{1,64}/g)?.join('\n') ?? ''
  return `-----BEGIN ${label}-----\n${body}\n-----END ${label}-----\n`
}

export function pemBody(pem: string, label: 'PUBLIC KEY' | 'PRIVATE KEY'): ArrayBuffer | null {
  const match = new RegExp(`-----BEGIN ${label}-----\\s*([A-Za-z0-9+/=\\s]+)-----END ${label}-----`).exec(pem)
  if (!match?.[1]) return null
  const binary = atob(match[1].replace(/\s+/g, ''))
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes.buffer
}

export function clampRsaSize(bits: number): RsaSize {
  if (bits >= 4096) return 4096
  if (bits >= 3072) return 3072
  return 2048
}

export async function generateRsaPem(bits: number, purpose: RsaPurpose): Promise<RsaPem> {
  const size = clampRsaSize(bits)
  const hash = 'SHA-256'
  const exponent = new Uint8Array([1, 0, 1])
  const pair =
    purpose === 'sign'
      ? await crypto.subtle.generateKey({ name: 'RSASSA-PKCS1-v1_5', modulusLength: size, publicExponent: exponent, hash }, true, ['sign', 'verify'])
      : await crypto.subtle.generateKey({ name: 'RSA-OAEP', modulusLength: size, publicExponent: exponent, hash }, true, ['encrypt', 'decrypt'])
  const spki = await crypto.subtle.exportKey('spki', pair.publicKey)
  const pkcs8 = await crypto.subtle.exportKey('pkcs8', pair.privateKey)
  return {
    publicKey: toPem(spki, 'PUBLIC KEY'),
    privateKey: toPem(pkcs8, 'PRIVATE KEY'),
    bits: size,
    purpose,
  }
}

/** Re-import both PEMs to confirm they are usable WebCrypto keys. */
export async function assertRsaPemUsable(pem: RsaPem): Promise<boolean> {
  const spki = pemBody(pem.publicKey, 'PUBLIC KEY')
  const pkcs8 = pemBody(pem.privateKey, 'PRIVATE KEY')
  if (!spki || !pkcs8) return false
  const hash = 'SHA-256'
  if (pem.purpose === 'sign') {
    await crypto.subtle.importKey('spki', spki, { name: 'RSASSA-PKCS1-v1_5', hash }, true, ['verify'])
    await crypto.subtle.importKey('pkcs8', pkcs8, { name: 'RSASSA-PKCS1-v1_5', hash }, true, ['sign'])
  } else {
    await crypto.subtle.importKey('spki', spki, { name: 'RSA-OAEP', hash }, true, ['encrypt'])
    await crypto.subtle.importKey('pkcs8', pkcs8, { name: 'RSA-OAEP', hash }, true, ['decrypt'])
  }
  return true
}
