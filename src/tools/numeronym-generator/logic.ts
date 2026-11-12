export function numeronym(word: string): string {
  const chars = [...word]
  if (chars.length < 4) return word
  return `${chars[0] ?? ''}${chars.length - 2}${chars.at(-1) ?? ''}`
}

export function numeronyms(text: string): string {
  return text.replace(/[^\s]+/g, (word) => numeronym(word))
}
