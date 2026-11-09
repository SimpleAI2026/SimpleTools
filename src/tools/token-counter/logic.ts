import { countTokens as countO200k } from 'gpt-tokenizer/encoding/o200k_base'
import { countTokens as countCl100k } from 'gpt-tokenizer/encoding/cl100k_base'
import { CONTEXT_WINDOWS, type ContextWindow, type TokenizerFamily } from '../_shared/ai-models'

const CJK = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/gu

export interface TokenStats {
  tokens: number
  chars: number
  words: number
  accurate: boolean
  /** Fraction of selected context window (0–1+). */
  contextRatio: number
  contextWindow: ContextWindow
}

/**
 * CJK-aware heuristic for non-OpenAI models:
 * ~1 token per CJK character, ~0.25 token per ASCII character (≈4 chars/token).
 * Documented as estimate in the UI.
 */
export function estimateTokensHeuristic(text: string): number {
  if (!text) return 0
  let cjk = 0
  let ascii = 0
  for (const ch of text) {
    if (CJK.test(ch)) cjk += 1
    else if (!/\s/.test(ch)) ascii += 1
    CJK.lastIndex = 0
  }
  return Math.max(0, Math.ceil(cjk * 1 + ascii * 0.25))
}

export function countWords(text: string): number {
  if (!text.trim()) return 0
  const cjk = text.match(CJK)?.length ?? 0
  const latin = text.replace(CJK, ' ').match(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu)?.length ?? 0
  return cjk + latin
}

export function countTokensForFamily(text: string, family: TokenizerFamily): { tokens: number; accurate: boolean } {
  if (!text) return { tokens: 0, accurate: family === 'o200k' || family === 'cl100k' }
  if (family === 'o200k') return { tokens: countO200k(text), accurate: true }
  if (family === 'cl100k') return { tokens: countCl100k(text), accurate: true }
  return { tokens: estimateTokensHeuristic(text), accurate: false }
}

export function analyzeText(text: string, family: TokenizerFamily, contextWindow: ContextWindow = 128000): TokenStats {
  const { tokens, accurate } = countTokensForFamily(text, family)
  return {
    tokens,
    chars: Array.from(text).length,
    words: countWords(text),
    accurate,
    contextRatio: contextWindow > 0 ? tokens / contextWindow : 0,
    contextWindow,
  }
}

export function formatPercent(ratio: number): string {
  return `${(ratio * 100).toFixed(ratio >= 0.1 ? 1 : 2)}%`
}

export { CONTEXT_WINDOWS }
export type { ContextWindow, TokenizerFamily }
