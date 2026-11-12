function utf8Base64(value: string): string {
  const bytes = new TextEncoder().encode(value)
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary)
}

export function basicAuthHeader(username: string, password: string): string {
  return `Authorization: Basic ${utf8Base64(`${username}:${password}`)}`
}

export function parseBasicAuth(header: string): { username: string; password: string } | null {
  const match = /^\s*(?:Authorization:\s*)?Basic\s+([A-Za-z0-9+/=]+)\s*$/i.exec(header.trim())
  if (!match?.[1]) return null
  try {
    const binary = atob(match[1])
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
    const text = new TextDecoder().decode(bytes)
    const index = text.indexOf(':')
    if (index < 0) return null
    return { username: text.slice(0, index), password: text.slice(index + 1) }
  } catch {
    return null
  }
}
