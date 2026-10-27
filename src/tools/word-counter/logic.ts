export interface TextStats {
  characters: number
  charactersNoSpaces: number
  words: number
  cjkCharacters: number
  sentences: number
  paragraphs: number
  lines: number
  readingMinutes: number
}

const CJK = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/gu

/**
 * Count text statistics. Each CJK character counts as one word; other words are
 * runs of letters/digits (apostrophes and hyphens allowed inside).
 */
export function countText(text: string): TextStats {
  const chars = Array.from(text)
  const cjk = text.match(CJK)?.length ?? 0
  const latinWords = text.replace(CJK, ' ').match(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu)?.length ?? 0
  const words = cjk + latinWords
  const trimmed = text.trim()
  const sentences = trimmed ? trimmed.split(/[.!?。！？]+(?:\s+|$)|[。！？]/u).filter((s) => s.trim()).length : 0
  const paragraphs = trimmed ? trimmed.split(/\n\s*\n/).filter((p) => p.trim()).length : 0
  return {
    characters: chars.length,
    charactersNoSpaces: chars.filter((c) => !/\s/.test(c)).length,
    words,
    cjkCharacters: cjk,
    sentences,
    paragraphs,
    lines: text === '' ? 0 : text.split('\n').length,
    // ~200 English words/min, ~300 CJK chars/min
    readingMinutes: words === 0 ? 0 : Math.max(1, Math.ceil(latinWords / 200 + cjk / 300)),
  }
}
