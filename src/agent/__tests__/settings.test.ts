/** @vitest-environment jsdom */
import { beforeEach, describe, expect, it } from 'vitest'
import {
  AGENT_STORAGE_KEY,
  loadAgentSettings,
  saveAgentSettings,
  resolveAgentConfig,
  DEFAULT_AGENT_MODEL,
} from '../settings'

describe('agent settings', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('round-trips settings when rememberKey is true', () => {
    saveAgentSettings({
      apiBaseUrl: 'https://api.example.com/v1',
      apiKey: 'sk-secret',
      model: 'gpt-4o-mini',
      systemPrompt: 'You are helpful.',
      rememberKey: true,
    })
    const loaded = loadAgentSettings()
    expect(loaded?.apiKey).toBe('sk-secret')
    expect(loaded?.model).toBe('gpt-4o-mini')

    const cfg = resolveAgentConfig()
    expect(cfg.apiBaseUrl).toBe('https://api.example.com/v1')
    expect(cfg.model).toBe('gpt-4o-mini')
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
      model: 'gpt-4o-mini',
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
})
