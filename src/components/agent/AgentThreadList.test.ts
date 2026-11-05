/** @vitest-environment jsdom */
import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import AgentThreadList from './AgentThreadList.vue'
import en from '@/i18n/locales/en'
import zhCN from '@/i18n/locales/zh-CN'

vi.mock('@/stores/agent', () => ({
  useAgentStore: () => ({
    threads: [{ id: 't1', title: 'Hello', createdAt: 1, updatedAt: 1 }],
    currentThreadId: 't1',
    newThread: vi.fn(),
    selectThread: vi.fn(),
    deleteThread: vi.fn(),
  }),
}))

describe('AgentThreadList', () => {
  it('keeps delete button visible (no opacity-0 hover gate)', () => {
    setActivePinia(createPinia())
    const i18n = createI18n({ legacy: false, locale: 'en', messages: { en, 'zh-CN': zhCN } })
    const w = mount(AgentThreadList, { global: { plugins: [i18n] }, props: { mobileOpen: true } })
    expect(w.html()).not.toMatch(/opacity-0 group-hover:opacity-100/)
    expect(w.find('[data-testid="agent-thread-list"]').exists()).toBe(true)
  })
})
