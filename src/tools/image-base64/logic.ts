/** Parse a data URL or bare Base64 string into its MIME type and Base64 payload. */
export function parseDataUrl(input: string): { mime: string; base64: string } | null {
  const s = input.trim()
  const m = /^data:([\w.+-]+\/[\w.+-]+)?(?:;[^,;]*)*;base64,(.*)$/is.exec(s)
  const base64 = (m ? (m[2] ?? '') : s).replace(/\s+/g, '')
  if (!base64 || !/^[A-Za-z0-9+/]+={0,2}$/.test(base64)) return null
  return { mime: m?.[1] ?? sniffMime(base64), base64 }
}

/** Guess an image MIME type from the first Base64 characters (magic numbers). */
export function sniffMime(base64: string): string {
  if (base64.startsWith('iVBOR')) return 'image/png'
  if (base64.startsWith('/9j/')) return 'image/jpeg'
  if (base64.startsWith('R0lGOD')) return 'image/gif'
  if (base64.startsWith('UklGR')) return 'image/webp'
  if (base64.startsWith('PHN2Zy') || base64.startsWith('PD94bW')) return 'image/svg+xml'
  if (base64.startsWith('Qk')) return 'image/bmp'
  return 'application/octet-stream'
}

export function base64ByteLength(base64: string): number {
  const pad = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0
  return Math.floor((base64.length * 3) / 4) - pad
}

export function base64ToBytes(base64: string): Uint8Array {
  return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0))
}

export function cssSnippet(dataUrl: string): string {
  return `background-image: url("${dataUrl}");`
}
export function htmlSnippet(dataUrl: string, alt = ''): string {
  return `<img src="${dataUrl}" alt="${alt}" />`
}
