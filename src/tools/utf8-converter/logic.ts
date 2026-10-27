export interface CharInfo {
  char: string
  codePoint: string
  utf8: string
  utf16: string
  escape: string
  html: string
}

export function describeChars(text: string, limit = 500): CharInfo[] {
  return Array.from(text)
    .slice(0, limit)
    .map((char) => {
      const cp = char.codePointAt(0) ?? 0
      const hex = cp.toString(16).toUpperCase()
      return {
        char,
        codePoint: `U+${hex.padStart(4, '0')}`,
        utf8: Array.from(new TextEncoder().encode(char), (b) => b.toString(16).toUpperCase().padStart(2, '0')).join(' '),
        utf16: Array.from({ length: char.length }, (_, i) => char.charCodeAt(i).toString(16).toUpperCase().padStart(4, '0')).join(' '),
        escape: cp > 0xffff ? `\\u{${hex}}` : `\\u${hex.padStart(4, '0')}`,
        html: `&#x${hex};`,
      }
    })
}

/** Text → escape sequences (`\uXXXX`, `\u{...}`), keeping printable ASCII unless `all`. */
export function escapeUnicode(text: string, all = false): string {
  return Array.from(text, (c) => {
    const cp = c.codePointAt(0) ?? 0
    if (!all && cp >= 0x20 && cp < 0x7f) return c
    const hex = cp.toString(16).toUpperCase()
    return cp > 0xffff ? `\\u{${hex}}` : `\\u${hex.padStart(4, '0')}`
  }).join('')
}

/** Decode `\uXXXX`, `\u{X..}`, `\xXX`, `U+XXXX` and `&#x..;`/`&#..;` sequences. */
export function unescapeUnicode(text: string): string {
  const cp = (h: string, radix = 16) => {
    const n = parseInt(h, radix)
    if (!Number.isFinite(n) || n > 0x10ffff) throw new Error(h)
    return String.fromCodePoint(n)
  }
  return text
    .replace(/\\u\{([0-9a-f]+)\}/gi, (_, h: string) => cp(h))
    .replace(/\\u([0-9a-f]{4})/gi, (_, h: string) => String.fromCharCode(parseInt(h, 16)))
    .replace(/\\x([0-9a-f]{2})/gi, (_, h: string) => cp(h))
    .replace(/U\+([0-9a-f]{4,6})/gi, (_, h: string) => cp(h))
    .replace(/&#x([0-9a-f]+);/gi, (_, h: string) => cp(h))
    .replace(/&#(\d+);/g, (_, d: string) => cp(d, 10))
}
