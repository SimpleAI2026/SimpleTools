export interface EmojiEntry {
  emoji: string
  name: string
  group: string
}

export function codePoints(emoji: string): string {
  return [...emoji].map((char) => `U+${(char.codePointAt(0) ?? 0).toString(16).toUpperCase()}`).join(' ')
}

export function searchEmoji(entries: EmojiEntry[], query: string, limit = 80): EmojiEntry[] {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
  const matched = terms.length
    ? entries.filter((entry) => {
        const blob = `${entry.emoji} ${entry.name} ${entry.group}`.toLowerCase()
        return terms.every((term) => blob.includes(term))
      })
    : entries
  return matched.slice(0, limit)
}
