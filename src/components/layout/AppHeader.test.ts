/** @vitest-environment jsdom */
import { describe, expect, it } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import { createMemoryHistory, createRouter } from 'vue-router'
import AppHeader from './AppHeader.vue'
import zhCN from '@/i18n/locales/zh-CN'
import en from '@/i18n/locales/en'

describe('AppHeader mobile overflow', () => {
  it('renders a more-menu trigger with data-testid header-more', async () => {
    setActivePinia(createPinia())
    const i18n = createI18n({ legacy: false, locale: 'en', messages: { en, 'zh-CN': zhCN } })
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/', name: 'home', component: { template: '<div />' } }],
    })
    await router.push('/')
    await router.isReady()
    const w = mount(AppHeader, {
      global: { plugins: [i18n, router, createPinia()], stubs: { InstallExtensionModal: true } },
    })
    await flushPromises()
    expect(w.find('[data-testid="header-more"]').exists()).toBe(true)
  })
})
