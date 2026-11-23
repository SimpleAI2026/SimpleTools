/** @vitest-environment jsdom */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import { createMemoryHistory, createRouter } from 'vue-router'
import AppHeader from './AppHeader.vue'
import zhCN from '@/i18n/locales/zh-CN'
import en from '@/i18n/locales/en'
import { CHROME_WEB_STORE_URL, GITHUB_REPO_URL } from './install-entry'

function media(matches: (query: string) => boolean) {
  window.matchMedia = ((query: string) => ({
    matches: matches(query),
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia
}

async function header(options?: { stubModal?: boolean }) {
  setActivePinia(createPinia())
  const i18n = createI18n({ legacy: false, locale: 'en', messages: { en, 'zh-CN': zhCN } })
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/', name: 'home', component: { template: '<div />' } }],
  })
  await router.push('/')
  await router.isReady()
  const w = mount(AppHeader, {
    attachTo: document.body,
    global: {
      plugins: [i18n, router, createPinia()],
      stubs: options?.stubModal === false ? {} : { InstallExtensionModal: true },
    },
  })
  await flushPromises()
  return w
}

describe('AppHeader mobile overflow', () => {
  afterEach(() => {
    document.body.innerHTML = ''
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
  })

  it('renders a more-menu trigger with data-testid header-more', async () => {
    const w = await header()
    expect(w.find('[data-testid="header-more"]').exists()).toBe(true)
  })

  it('links GitHub to the repository and describes an optional star outside the header flow', async () => {
    const fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)
    const w = await header()
    const link = w.get('a[data-testid="github-link"]')
    expect(link.attributes('href')).toBe(GITHUB_REPO_URL)
    expect(link.attributes('target')).toBe('_blank')
    expect(link.attributes('rel')).toContain('noopener')
    expect(link.attributes('aria-label')).toBe(en.app.github)
    expect((link.element as HTMLAnchorElement).tabIndex).toBeGreaterThanOrEqual(0)
    const hint = link.get('[role="tooltip"]')
    expect(hint.classes()).toContain('absolute')
    expect(hint.classes()).toContain('whitespace-normal')
    expect(hint.classes()).toContain('opacity-0')
    expect(hint.text()).toBe(en.app.github)
    await link.trigger('mouseenter')
    expect(hint.classes()).toContain('opacity-100')
    await link.trigger('mouseleave')
    expect(hint.classes()).toContain('opacity-0')
    await link.trigger('focus')
    expect(hint.classes()).toContain('opacity-100')
    await link.trigger('click')
    expect(fetchSpy).not.toHaveBeenCalled()
    w.unmount()
  })

  it('opens the store-first Chrome install from the website, including on a handheld viewport', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true })))
    media((query) => query === '(max-width: 767px)' || query === '(pointer: coarse)')
    const w = await header({ stubModal: false })
    expect(w.find('[data-testid="chrome-extension-entry"]').exists()).toBe(true)
    await w.get('[data-testid="header-more"]').trigger('click')
    expect(w.find('[data-testid="chrome-extension-entry-icon"]').exists()).toBe(true)
    await w.get('[data-testid="chrome-extension-entry"]').trigger('click')
    await flushPromises()
    const store = document.querySelector('[data-testid="chrome-store-link"]') as HTMLAnchorElement | null
    expect(store?.href).toBe(CHROME_WEB_STORE_URL)
    expect(document.querySelector('[data-testid="chrome-handheld-note"]')?.textContent).toContain(en.app.extensions.chromeHandheld)
    w.unmount()
  })
})

describe('AppHeader extension hosts', () => {
  afterEach(() => {
    document.body.innerHTML = ''
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it.each(['chrome', 'vscode'])('hides install actions when the host is %s and keeps the repository link', async (target) => {
    vi.stubEnv('VITE_TARGET', target)
    vi.resetModules()
    const { default: HostHeader } = await import('./AppHeader.vue')
    setActivePinia(createPinia())
    const i18n = createI18n({ legacy: false, locale: 'en', messages: { en, 'zh-CN': zhCN } })
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/', name: 'home', component: { template: '<div />' } }],
    })
    await router.push('/')
    await router.isReady()
    const w = mount(HostHeader, {
      global: { plugins: [i18n, router, createPinia()], stubs: { InstallExtensionModal: true } },
    })
    await flushPromises()
    expect(w.find('[data-testid="chrome-extension-entry"]').exists()).toBe(false)
    expect(w.find('[data-testid="vscode-extension-entry"]').exists()).toBe(false)
    expect(w.get('a[data-testid="github-link"]').attributes('href')).toBe(GITHUB_REPO_URL)
    w.unmount()
  })
})
