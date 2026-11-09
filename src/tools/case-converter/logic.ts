export const CASES = [
  'camel',
  'pascal',
  'snake',
  'constant',
  'kebab',
  'title',
  'sentence',
  'lower',
  'upper',
  'dot',
] as const
export type CaseName = (typeof CASES)[number]

/** Split text into words across camelCase, snake_case, kebab-case, spaces and punctuation. */
export function splitWords(text: string): string[] {
  return text
    .replace(/([\p{Ll}\d])(\p{Lu})/gu, '$1 $2')
    .replace(/(\p{Lu})(\p{Lu}\p{Ll})/gu, '$1 $2')
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean)
}

const cap = (w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()

export function convertCase(text: string, to: CaseName): string {
  if (to === 'lower') return text.toLowerCase()
  if (to === 'upper') return text.toUpperCase()
  if (to === 'sentence') {
    const lower = text.toLowerCase()
    return lower.replace(/(^\s*|[.!?。！？]\s*)(\p{L})/gu, (_, p: string, c: string) => p + c.toUpperCase())
  }
  const words = splitWords(text)
  const lw = words.map((w) => w.toLowerCase())
  switch (to) {
    case 'camel':
      return lw.map((w, i) => (i === 0 ? w : cap(w))).join('')
    case 'pascal':
      return lw.map(cap).join('')
    case 'snake':
      return lw.join('_')
    case 'constant':
      return lw.join('_').toUpperCase()
    case 'kebab':
      return lw.join('-')
    case 'dot':
      return lw.join('.')
    case 'title':
      return lw.map(cap).join(' ')
  }
}
