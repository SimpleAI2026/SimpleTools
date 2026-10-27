/** Shared model families / ballpark pricing for AI companion tools (2025–2026 approx). */

export type TokenizerFamily = 'o200k' | 'cl100k' | 'claude' | 'gemini' | 'deepseek'

export interface TokenizerFamilyMeta {
  id: TokenizerFamily
  /** Accurate OpenAI encoding vs heuristic estimate */
  accurate: boolean
  labelKey: string
}

export const TOKENIZER_FAMILIES: TokenizerFamilyMeta[] = [
  { id: 'o200k', accurate: true, labelKey: 'familyO200k' },
  { id: 'cl100k', accurate: true, labelKey: 'familyCl100k' },
  { id: 'claude', accurate: false, labelKey: 'familyClaude' },
  { id: 'gemini', accurate: false, labelKey: 'familyGemini' },
  { id: 'deepseek', accurate: false, labelKey: 'familyDeepseek' },
]

export const CONTEXT_WINDOWS = [8000, 32000, 128000, 200000] as const
export type ContextWindow = (typeof CONTEXT_WINDOWS)[number]

export interface PricingModel {
  id: string
  label: string
  provider: string
  /** USD per 1M input tokens */
  inputPerMillion: number
  /** USD per 1M output tokens */
  outputPerMillion: number
}

/** Ballpark public list prices (USD / 1M tokens), mid-2025–2026. Editable in the UI. */
export const DEFAULT_PRICING_MODELS: PricingModel[] = [
  { id: 'gpt-4o', label: 'GPT-4o', provider: 'OpenAI', inputPerMillion: 2.5, outputPerMillion: 10 },
  { id: 'gpt-4o-mini', label: 'GPT-4o mini', provider: 'OpenAI', inputPerMillion: 0.15, outputPerMillion: 0.6 },
  { id: 'gpt-4.1', label: 'GPT-4.1', provider: 'OpenAI', inputPerMillion: 2, outputPerMillion: 8 },
  { id: 'gpt-4.1-mini', label: 'GPT-4.1 mini', provider: 'OpenAI', inputPerMillion: 0.4, outputPerMillion: 1.6 },
  { id: 'o3', label: 'o3', provider: 'OpenAI', inputPerMillion: 10, outputPerMillion: 40 },
  { id: 'o4-mini', label: 'o4-mini', provider: 'OpenAI', inputPerMillion: 1.1, outputPerMillion: 4.4 },
  { id: 'claude-sonnet-4', label: 'Claude Sonnet 4', provider: 'Anthropic', inputPerMillion: 3, outputPerMillion: 15 },
  { id: 'claude-opus-4', label: 'Claude Opus 4', provider: 'Anthropic', inputPerMillion: 15, outputPerMillion: 75 },
  { id: 'claude-haiku-3.5', label: 'Claude Haiku 3.5', provider: 'Anthropic', inputPerMillion: 0.8, outputPerMillion: 4 },
  { id: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro', provider: 'Google', inputPerMillion: 1.25, outputPerMillion: 10 },
  { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash', provider: 'Google', inputPerMillion: 0.15, outputPerMillion: 0.6 },
  { id: 'deepseek-v3', label: 'DeepSeek V3', provider: 'DeepSeek', inputPerMillion: 0.27, outputPerMillion: 1.1 },
  { id: 'deepseek-r1', label: 'DeepSeek R1', provider: 'DeepSeek', inputPerMillion: 0.55, outputPerMillion: 2.19 },
  { id: 'custom', label: 'Custom', provider: 'Custom', inputPerMillion: 1, outputPerMillion: 3 },
]
