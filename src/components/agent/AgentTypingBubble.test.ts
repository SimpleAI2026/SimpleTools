/** @vitest-environment jsdom */
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import { reactive } from 'vue'
import AgentMessage from './AgentMessage.vue'
import AgentMessageList from './AgentMessageList.vue'
import AgentTypingBubble from './AgentTypingBubble.vue'
import en from '@/i18n/locales/en'
import zhCN from '@/i18n/locales/zh-CN'
import type { ChatMessage } from '@/agent'

const storeState = reactive({
  messages: [] as ChatMessage[],
  streaming: false,
})

vi.mock('@/stores/agent', () => ({
  useAgentStore: () => storeState,
}))

function makeI18n() {
  return createI18n({ legacy: false, locale: 'en', messages: { en, 'zh-CN': zhCN } })
}

function assistant(partial: Partial<ChatMessage> = {}): ChatMessage {
  return {
    id: 'a1',
    threadId: 't1',
    role: 'assistant',
    content: '',
    createdAt: 1,
    status: 'streaming',
    ...partial,
  }
}

describe('AgentTypingBubble', () => {
  it('renders three dots with aria-busy', () => {
    const i18n = makeI18n()
    const w = mount(AgentTypingBubble, { global: { plugins: [i18n] } })
    const tip = w.find('[data-testid="agent-typing"]')
    expect(tip.exists()).toBe(true)
    expect(tip.attributes('aria-busy')).toBe('true')
    expect(tip.attributes('aria-label')).toBe('Typing')
    expect(tip.findAll('.agent-typing-dot').length).toBe(3)
  })
})

describe('AgentMessage typing', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    storeState.messages = []
    storeState.streaming = false
  })

  it('shows typing bubble for empty streaming assistant', () => {
    storeState.streaming = true
    const i18n = makeI18n()
    const w = mount(AgentMessage, {
      global: { plugins: [i18n] },
      props: { message: assistant() },
    })
    expect(w.find('[data-testid="agent-typing"]').exists()).toBe(true)
    expect(w.text()).not.toContain('Generating')
  })

  it('hides typing once assistant has text', () => {
    storeState.streaming = true
    const i18n = makeI18n()
    const w = mount(AgentMessage, {
      global: { plugins: [i18n] },
      props: { message: assistant({ content: 'Hello' }) },
    })
    expect(w.find('[data-testid="agent-typing"]').exists()).toBe(false)
    expect(w.text()).toContain('Hello')
  })

  it('hides typing when streaming stops', () => {
    storeState.streaming = false
    const i18n = makeI18n()
    const w = mount(AgentMessage, {
      global: { plugins: [i18n] },
      props: { message: assistant({ status: 'streaming', content: '' }) },
    })
    expect(w.find('[data-testid="agent-typing"]').exists()).toBe(false)
  })
})

describe('AgentMessageList optimistic typing', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    storeState.messages = []
    storeState.streaming = false
  })

  it('shows optimistic typing while streaming before assistant message exists', () => {
    storeState.streaming = true
    storeState.messages = [
      {
        id: 'u1',
        threadId: 't1',
        role: 'user',
        content: 'hi',
        createdAt: 1,
      },
    ]
    const i18n = makeI18n()
    const w = mount(AgentMessageList, { global: { plugins: [i18n] } })
    expect(w.find('[data-testid="agent-message-assistant-typing"]').exists()).toBe(true)
    expect(w.find('[data-testid="agent-typing"]').exists()).toBe(true)
  })

  it('does not duplicate typing when streaming assistant row already exists', () => {
    storeState.streaming = true
    storeState.messages = [assistant()]
    const i18n = makeI18n()
    const w = mount(AgentMessageList, { global: { plugins: [i18n] } })
    expect(w.findAll('[data-testid="agent-typing"]').length).toBe(1)
    expect(w.find('[data-testid="agent-message-assistant-typing"]').exists()).toBe(false)
  })
})
