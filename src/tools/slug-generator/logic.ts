export interface SlugOptions {
  separator: '-' | '_' | '.'
  lowercase: boolean
  maxLength: number
  stopWords: boolean
}

const STOP = new Set(['a', 'an', 'the', 'and', 'or', 'of', 'to', 'in', 'on', 'for', 'with', 'at', 'by', 'is'])
const SPECIAL: Record<string, string> = { ß: 'ss', æ: 'ae', Æ: 'AE', ø: 'o', Ø: 'O', đ: 'd', Đ: 'D', ł: 'l', Ł: 'L', œ: 'oe', Œ: 'OE', þ: 'th', '&': ' and ' }

/** URL slug: strip accents, keep letters/digits (including CJK), collapse separators. */
export function slugify(text: string, o: SlugOptions = { separator: '-', lowercase: true, maxLength: 0, stopWords: false }): string {
  let s = text.replace(/[ßæÆøØđĐłŁœŒþ&]/g, (c) => SPECIAL[c] ?? c)
  s = s.normalize('NFKD').replace(/\p{M}+/gu, '')
  s = s.replace(/([\p{Ll}\d])(\p{Lu})/gu, '$1 $2')
  let words = s.split(/[^\p{L}\p{N}]+/u).filter(Boolean)
  if (o.stopWords) {
    const kept = words.filter((w) => !STOP.has(w.toLowerCase()))
    if (kept.length) words = kept
  }
  let out = words.join(o.separator)
  if (o.lowercase) out = out.toLowerCase()
  if (o.maxLength > 0 && out.length > o.maxLength) {
    out = out.slice(0, o.maxLength)
    const cut = out.lastIndexOf(o.separator)
    if (cut > o.maxLength / 2) out = out.slice(0, cut)
    out = out.replace(new RegExp(`\\${o.separator}+$`), '')
  }
  return out
}
