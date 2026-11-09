/** Shared model families / ballpark pricing for AI companion tools (late-2026 public APIs). */

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

/**
 * Ballpark public list prices (USD / 1M tokens), late 2026.
 * Editable in the API cost UI; Agent settings presets share this catalog.
 */
export const DEFAULT_PRICING_MODELS: PricingModel[] = [
  // OpenAI
  { id: 'gpt-6-astra', label: 'GPT-6 Astra', provider: 'OpenAI', inputPerMillion: 10, outputPerMillion: 50 },
  { id: 'gpt-6.1-sol', label: 'GPT-6.1 Sol', provider: 'OpenAI', inputPerMillion: 2, outputPerMillion: 10 },
  { id: 'gpt-6-luna', label: 'GPT-6 Luna', provider: 'OpenAI', inputPerMillion: 1, outputPerMillion: 5 },
  // Anthropic
  { id: 'claude-fable-5-1', label: 'Claude Fable 5.1', provider: 'Anthropic', inputPerMillion: 10, outputPerMillion: 50 },
  { id: 'claude-opus-5-5', label: 'Claude Opus 5.5', provider: 'Anthropic', inputPerMillion: 4, outputPerMillion: 20 },
  { id: 'claude-sonnet-5-5', label: 'Claude Sonnet 5.5', provider: 'Anthropic', inputPerMillion: 2, outputPerMillion: 10 },
  { id: 'claude-haiku-5-5', label: 'Claude Haiku 5.5', provider: 'Anthropic', inputPerMillion: 0.1, outputPerMillion: 0.5 },
  // xAI
  { id: 'grok-4.7', label: 'Grok 4.7', provider: 'xAI', inputPerMillion: 2, outputPerMillion: 6 },
  { id: 'grok-4.6', label: 'Grok 4.6', provider: 'xAI', inputPerMillion: 2, outputPerMillion: 6 },
  { id: 'grok-4.5', label: 'Grok 4.5', provider: 'xAI', inputPerMillion: 2, outputPerMillion: 6 },
  // Google
  { id: 'gemini-4-argon', label: 'Gemini 4 Argon', provider: 'Google', inputPerMillion: 4, outputPerMillion: 20 },
  { id: 'gemini-3.8-flash', label: 'Gemini 3.8 Flash', provider: 'Google', inputPerMillion: 0.15, outputPerMillion: 0.6 },
  // DeepSeek
  { id: 'deepseek-flash', label: 'DeepSeek Flash', provider: 'DeepSeek', inputPerMillion: 0.3, outputPerMillion: 1.2 },
  { id: 'deepseek-v4-pro', label: 'DeepSeek V4 Pro', provider: 'DeepSeek', inputPerMillion: 1.32, outputPerMillion: 3.96 },
  // Qwen (DashScope)
  { id: 'qwen3.8-max', label: 'Qwen3.8 Max', provider: 'Qwen', inputPerMillion: 2, outputPerMillion: 8 },
  { id: 'qwen3.8-flash', label: 'Qwen3.8 Flash', provider: 'Qwen', inputPerMillion: 0.15, outputPerMillion: 0.6 },
  // Custom rates for the cost estimator UI
  { id: 'custom', label: 'Custom', provider: 'Custom', inputPerMillion: 1, outputPerMillion: 3 },
]

/** Catalog entries suitable as Agent model presets (excludes the cost-UI "custom" row). */
export const AGENT_MODEL_PRESETS: PricingModel[] = DEFAULT_PRICING_MODELS.filter((m) => m.id !== 'custom')

