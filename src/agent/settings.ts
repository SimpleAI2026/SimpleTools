import type { ChatProviderId, SimpleChatConfig } from './types'
import { isChatProviderId } from './providers/types'
import { isLanguageModelPresent } from './providers/ChromeAiProvider'

export const AGENT_STORAGE_KEY = 'simpletools-agent'
export const AGENT_SETTINGS_LS_KEY = `${AGENT_STORAGE_KEY}:settings`
/** Sensible default; user overrides in Settings Dialog */
export const DEFAULT_AGENT_MODEL = 'gpt-6.1-sol'
/** Display label for Chrome Built-in AI when no cloud model is needed. */
export const CHROME_AI_MODEL_LABEL = 'Gemini Nano'

export interface PersistedAgentSettings {
  apiBaseUrl?: string
  apiKey?: string
  model?: string
  systemPrompt?: string
  rememberKey?: boolean
  /** openai (cloud) | chrome-ai (Gemini Nano / Prompt API). */
  provider?: ChatProviderId
}

/**
 * Sync default provider: if no explicit provider and no apiKey and LanguageModel
 * is present, prefer chrome-ai (availability refined async in UI / send path).
 * Mirrors SimpleChat `defaultProviderId`.
 */
export function defaultProviderId(opts: {
  storedProvider?: string | null
  overrideProvider?: string | null
  apiKey: string
}): ChatProviderId {
  if (isChatProviderId(opts.overrideProvider)) return opts.overrideProvider
  if (isChatProviderId(opts.storedProvider)) return opts.storedProvider
  if (!String(opts.apiKey || '').trim() && isLanguageModelPresent()) {
    return 'chrome-ai'
  }
  return 'openai'
}

export function loadAgentSettings(): PersistedAgentSettings | null {
  try {
    if (typeof localStorage === 'undefined') return null
    const raw = localStorage.getItem(AGENT_SETTINGS_LS_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as PersistedAgentSettings
    return parsed && typeof parsed === 'object' ? parsed : null
  } catch {
    return null
  }
}

export function saveAgentSettings(settings: PersistedAgentSettings): void {
  try {
    if (typeof localStorage === 'undefined') return
    const payload: PersistedAgentSettings = {
      apiBaseUrl: settings.apiBaseUrl ?? '',
      model: settings.model ?? '',
      systemPrompt: settings.systemPrompt ?? '',
      rememberKey: !!settings.rememberKey,
      provider: isChatProviderId(settings.provider) ? settings.provider : undefined,
    }
    if (payload.rememberKey && settings.apiKey) {
      payload.apiKey = settings.apiKey
    }
    localStorage.setItem(AGENT_SETTINGS_LS_KEY, JSON.stringify(payload))
  } catch {
    /* quota / private mode */
  }
}

function nonEmpty(v: unknown): string {
  return v == null ? '' : String(v).trim()
}

export function resolveAgentConfig(
  override?: Partial<PersistedAgentSettings>,
): SimpleChatConfig {
  const stored = loadAgentSettings()
  const apiKey =
    nonEmpty(override?.apiKey) ||
    (stored?.rememberKey ? nonEmpty(stored.apiKey) : '') ||
    ''
  const provider = defaultProviderId({
    overrideProvider: nonEmpty(override?.provider),
    storedProvider: nonEmpty(stored?.provider),
    apiKey,
  })
  return {
    apiBaseUrl:
      nonEmpty(override?.apiBaseUrl) || nonEmpty(stored?.apiBaseUrl) || '',
    apiKey,
    model:
      nonEmpty(override?.model) ||
      nonEmpty(stored?.model) ||
      (provider === 'chrome-ai' ? CHROME_AI_MODEL_LABEL : DEFAULT_AGENT_MODEL),
    systemPrompt:
      nonEmpty(override?.systemPrompt) || nonEmpty(stored?.systemPrompt) || '',
    provider,
    maxToolRounds: 5,
    maxMessages: 40,
  }
}
