const NAMED: Record<string, string> = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: '\u00a0', copy: '©', reg: '®', trade: '™', hellip: '…',
  mdash: '—', ndash: '–', lsquo: '‘', rsquo: '’', ldquo: '“', rdquo: '”', laquo: '«', raquo: '»', middot: '·',
  bull: '•', deg: '°', plusmn: '±', times: '×', divide: '÷', euro: '€', pound: '£', yen: '¥', cent: '¢',
  sect: '§', para: '¶', larr: '←', rarr: '→', uarr: '↑', darr: '↓', harr: '↔', le: '≤', ge: '≥', ne: '≠',
  infin: '∞', micro: 'µ', frac12: '½', frac14: '¼', frac34: '¾', sup2: '²', sup3: '³', iexcl: '¡', iquest: '¿',
}
const REVERSE = Object.fromEntries(Object.entries(NAMED).map(([k, v]) => [v, k]))

export type EncodeMode = 'minimal' | 'named' | 'numeric'

/** minimal: only &<>"' ; named: also known named entities, others non-ASCII as numeric ; numeric: all non-ASCII + specials numeric. */
export function encodeEntities(text: string, mode: EncodeMode = 'minimal'): string {
  return Array.from(text, (c) => {
    const special = '&<>"\''.includes(c)
    const cp = c.codePointAt(0) ?? 0
    if (mode === 'minimal') return special ? `&${REVERSE[c]};`.replace('&apos;', '&#39;') : c
    if (mode === 'named' && REVERSE[c] && (special || cp > 127)) return `&${REVERSE[c]};`
    if (special || cp > 127) return `&#${cp};`
    return c
  }).join('')
}

export function decodeEntities(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z][a-z0-9]*);/gi, (m, body: string) => {
    if (body[0] === '#') {
      const n = body[1] === 'x' || body[1] === 'X' ? parseInt(body.slice(2), 16) : parseInt(body.slice(1), 10)
      return n > 0 && n <= 0x10ffff ? String.fromCodePoint(n) : m
    }
    return NAMED[body] ?? NAMED[body.toLowerCase()] ?? m
  })
}
