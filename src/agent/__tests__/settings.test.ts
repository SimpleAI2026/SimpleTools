/** @vitest-environment jsdom */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  AGENT_STORAGE_KEY,
  loadAgentSettings,
  saveAgentSettings,
  resolveAgentConfig,
  defaultProviderId,
  DEFAULT_AGENT_MODEL,
  CHROME_AI_MODEL_LABEL,
} from '../settings'

describe('agent settings', () => {
  beforeEach(() => {
    localStorage.clear()
    delete (globalThis as { LanguageModel?: unknown }).LanguageModel
  })

  afterEach(() => {
    delete (globalThis as { LanguageModel?: unknown }).LanguageModel
  })

  it('round-trips settings when rememberKey is true', () => {
    saveAgentSettings({
      apiBaseUrl: 'https://api.example.com/v1',
      apiKey: 'sk-secret',
      model: 'gpt-6.1-sol',
      systemPrompt: 'You are helpful.',
      rememberKey: true,
      provider: 'openai',
    })
    const loaded = loadAgentSettings()
    expect(loaded?.apiKey).toBe('sk-secret')
    expect(loaded?.model).toBe('gpt-6.1-sol')
    expect(loaded?.provider).toBe('openai')

    const cfg = resolveAgentConfig()
    expect(cfg.apiBaseUrl).toBe('https://api.example.com/v1')
    expect(cfg.model).toBe('gpt-6.1-sol')
    expect(cfg.provider).toBe('openai')
  })

  it('omits apiKey when rememberKey is false', () => {
    saveAgentSettings({
      apiBaseUrl: 'https://api.example.com/v1',
      apiKey: 'sk-secret',
      model: '',
      systemPrompt: '',
      rememberKey: false,
    })
    expect(loadAgentSettings()?.apiKey).toBeUndefined()
    expect(resolveAgentConfig().model).toBe(DEFAULT_AGENT_MODEL)
  })

  it('uses draft/session apiKey override when rememberKey is false', () => {
    saveAgentSettings({
      apiBaseUrl: 'https://api.example.com/v1',
      apiKey: 'sk-secret',
      model: 'gpt-6.1-sol',
      systemPrompt: '',
      rememberKey: false,
    })
    expect(loadAgentSettings()?.apiKey).toBeUndefined()
    expect(resolveAgentConfig().apiKey).toBe('')
    // Store send() must pass draftSettings so the in-memory session key still resolves.
    const cfg = resolveAgentConfig({ apiKey: 'sk-session' })
    expect(cfg.apiKey).toBe('sk-session')
    expect(cfg.apiBaseUrl).toBe('https://api.example.com/v1')
  })

  it('uses scoped storage key', () => {
    expect(AGENT_STORAGE_KEY).toBe('simpletools-agent')
  })

  it('defaults to chrome-ai when no key and LanguageModel is present', () => {
    ;(globalThis as unknown as { LanguageModel: unknown }).LanguageModel = {
      availability: async () => 'available',
    }
    expect(defaultProviderId({ apiKey: '' })).toBe('chrome-ai')
    const cfg = resolveAgentConfig()
    expect(cfg.provider).toBe('chrome-ai')
    expect(cfg.model).toBe(CHROME_AI_MODEL_LABEL)
  })

  it('stays openai when apiKey present even if LanguageModel exists', () => {
    ;(globalThis as unknown as { LanguageModel: unknown }).LanguageModel = {
      availability: async () => 'available',
    }
    expect(defaultProviderId({ apiKey: 'sk-x' })).toBe('openai')
    const cfg = resolveAgentConfig({ apiKey: 'sk-x' })
    expect(cfg.provider).toBe('openai')
  })

  it('respects stored provider over LanguageModel heuristic', () => {
    ;(globalThis as unknown as { LanguageModel: unknown }).LanguageModel = {
      availability: async () => 'available',
    }
    saveAgentSettings({
      apiBaseUrl: '',
      model: '',
      systemPrompt: '',
      rememberKey: false,
      provider: 'openai',
    })
    expect(resolveAgentConfig().provider).toBe('openai')
  })

  it('persists chrome-ai provider without requiring apiKey', () => {
    saveAgentSettings({
      provider: 'chrome-ai',
      rememberKey: false,
      systemPrompt: 'be brief',
    })
    const loaded = loadAgentSettings()
    expect(loaded?.provider).toBe('chrome-ai')
    expect(loaded?.apiKey).toBeUndefined()
    const cfg = resolveAgentConfig()
    expect(cfg.provider).toBe('chrome-ai')
    expect(cfg.systemPrompt).toBe('be brief')
  })
})
