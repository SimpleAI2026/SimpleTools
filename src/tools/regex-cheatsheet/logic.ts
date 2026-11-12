export const REGEX_GROUPS = ['anchors', 'classes', 'quantifiers', 'groups', 'flags'] as const
export type RegexGroup = (typeof REGEX_GROUPS)[number]

export interface RegexItem {
  id: string
  group: RegexGroup
  pattern: string
}

export const REGEX_ITEMS: RegexItem[] = [
  { id: 'start', group: 'anchors', pattern: '^' },
  { id: 'end', group: 'anchors', pattern: '$' },
  { id: 'boundary', group: 'anchors', pattern: '\\b' },
  { id: 'any', group: 'classes', pattern: '.' },
  { id: 'digit', group: 'classes', pattern: '\\d' },
  { id: 'word', group: 'classes', pattern: '\\w' },
  { id: 'space', group: 'classes', pattern: '\\s' },
  { id: 'set', group: 'classes', pattern: '[abc]' },
  { id: 'negated', group: 'classes', pattern: '[^abc]' },
  { id: 'optional', group: 'quantifiers', pattern: 'a?' },
  { id: 'star', group: 'quantifiers', pattern: 'a*' },
  { id: 'plus', group: 'quantifiers', pattern: 'a+' },
  { id: 'count', group: 'quantifiers', pattern: 'a{2,4}' },
  { id: 'lazy', group: 'quantifiers', pattern: 'a*?' },
  { id: 'or', group: 'groups', pattern: 'a|b' },
  { id: 'capture', group: 'groups', pattern: '(abc)' },
  { id: 'noncap', group: 'groups', pattern: '(?:abc)' },
  { id: 'ahead', group: 'groups', pattern: 'a(?=b)' },
  { id: 'behind', group: 'groups', pattern: '(?<=a)b' },
  { id: 'ignore', group: 'flags', pattern: '/a/i' },
  { id: 'global', group: 'flags', pattern: '/a/g' },
  { id: 'multi', group: 'flags', pattern: '/a/m' },
  { id: 'dotall', group: 'flags', pattern: '/a/s' },
  { id: 'unicode', group: 'flags', pattern: '/a/u' },
]

export function filterRegex(query: string, labels: (item: RegexItem) => string): RegexItem[] {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
  if (!terms.length) return REGEX_ITEMS
  return REGEX_ITEMS.filter((item) => {
    const blob = `${item.pattern} ${item.group} ${labels(item)}`.toLowerCase()
    return terms.every((term) => blob.includes(term))
  })
}
