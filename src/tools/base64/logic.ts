function bytesToBinary(bytes: Uint8Array): string {
  let s = ''
  for (let i = 0; i < bytes.length; i += 0x8000) {
    s += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
  }
  return s
}

export function encodeBase64(text: string, urlSafe = false): string {
  const b64 = btoa(bytesToBinary(new TextEncoder().encode(text)))
  return urlSafe ? b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '') : b64
}

/** Decode standard or URL-safe Base64 (padding optional, whitespace ignored). Throws on invalid input. */
export function decodeBase64(input: string): string {
  let s = input.replace(/\s+/g, '').replace(/-/g, '+').replace(/_/g, '/')
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(s)) throw new Error('invalid')
  s = s.replace(/=+$/, '')
  if (s.length % 4 === 1) throw new Error('invalid')
  s += '='.repeat((4 - (s.length % 4)) % 4)
  const bin = atob(s)
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0))
  return new TextDecoder('utf-8', { fatal: true }).decode(bytes)
}
