export function bytesToBase64(bytes: Uint8Array): string {
  let binary = ''
  const chunk = 0x8000
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk))
  }
  return btoa(binary)
}

export function base64ToBytes(base64: string): Uint8Array | null {
  const cleaned = base64.replace(/\s+/g, '')
  if (!cleaned || !/^[A-Za-z0-9+/]+={0,2}$/.test(cleaned)) return null
  try {
    const binary = atob(cleaned)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
    return bytes
  } catch {
    return null
  }
}

export function toDataUrl(bytes: Uint8Array, mime: string): string {
  const type = mime.trim() || 'application/octet-stream'
  return `data:${type};base64,${bytesToBase64(bytes)}`
}

export function parseDataUrl(input: string): { mime: string; base64: string; bytes: Uint8Array } | null {
  const trimmed = input.trim()
  const match = /^data:([^,]*?),(.*)$/s.exec(trimmed)
  const meta = match?.[1] ?? ''
  const payload = (match?.[2] ?? trimmed).replace(/\s+/g, '')
  const mime = meta.split(';')[0]?.trim() || 'application/octet-stream'
  if (match && !/base64/i.test(meta)) return null
  const bytes = base64ToBytes(payload)
  if (!bytes) return null
  return { mime, base64: payload, bytes }
}

export function filenameFor(mime: string, fallback = 'file'): string {
  const ext = mime === 'text/plain' ? 'txt' : mime.split('/').at(-1)?.replace(/[^a-z0-9.+-]/gi, '') || 'bin'
  return `${fallback}.${ext}`
}
