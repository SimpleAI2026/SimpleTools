/**
 * AES-256-GCM with a PBKDF2-SHA256 derived key.
 * Output format (Base64): "v1" marker byte layout = salt(16) | iv(12) | ciphertext+tag.
 */
export const PBKDF2_ITERATIONS = 250_000

function b64(bytes: Uint8Array): string {
  let s = ''
  for (const b of bytes) s += String.fromCharCode(b)
  return btoa(s)
}
function unb64(s: string): Uint8Array {
  const bin = atob(s.replace(/\s+/g, ''))
  return Uint8Array.from(bin, (c) => c.charCodeAt(0))
}

async function deriveKey(password: string, salt: Uint8Array, iterations: number): Promise<CryptoKey> {
  const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey'])
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: salt as BufferSource, iterations, hash: 'SHA-256' },
    base,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  )
}

export async function encryptText(plain: string, password: string, iterations = PBKDF2_ITERATIONS): Promise<string> {
  if (!password) throw new Error('no-password')
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const key = await deriveKey(password, salt, iterations)
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(plain)))
  const out = new Uint8Array(salt.length + iv.length + ct.length)
  out.set(salt, 0)
  out.set(iv, 16)
  out.set(ct, 28)
  return b64(out)
}

export async function decryptText(payload: string, password: string, iterations = PBKDF2_ITERATIONS): Promise<string> {
  if (!password) throw new Error('no-password')
  let bytes: Uint8Array
  try {
    bytes = unb64(payload)
  } catch {
    throw new Error('bad-format')
  }
  if (bytes.length < 16 + 12 + 16) throw new Error('bad-format')
  const key = await deriveKey(password, bytes.slice(0, 16), iterations)
  try {
    const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: bytes.slice(16, 28) }, key, bytes.slice(28))
    return new TextDecoder().decode(pt)
  } catch {
    throw new Error('wrong-password')
  }
}
