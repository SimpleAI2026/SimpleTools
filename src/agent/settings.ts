import type { ChatProviderId, SimpleChatConfig } from './types'

export const AGENT_STORAGE_KEY = 'simpletools-agent'
export const AGENT_SETTINGS_LS_KEY = `${AGENT_STORAGE_KEY}:settings`
/** Sensible default; user overrides in Settings Dialog */
export const DEFAULT_AGENT_MODEL = 'gpt-4o-mini'

export interface PersistedAgentSettings {
  apiBaseUrl?: string
  apiKey?: string
  model?: string
  systemPrompt?: string
  rememberKey?: boolean
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
  return {
    apiBaseUrl:
      nonEmpty(override?.apiBaseUrl) || nonEmpty(stored?.apiBaseUrl) || '',
    apiKey,
    model:
      nonEmpty(override?.model) ||
      nonEmpty(stored?.model) ||
      DEFAULT_AGENT_MODEL,
    systemPrompt:
      nonEmpty(override?.systemPrompt) || nonEmpty(stored?.systemPrompt) || '',
    provider: 'openai' satisfies ChatProviderId,
    maxToolRounds: 5,
    maxMessages: 40,
  }
}
