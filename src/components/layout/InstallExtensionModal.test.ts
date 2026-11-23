/** @vitest-environment jsdom */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import en from '@/i18n/locales/en'
import InstallExtensionModal from './InstallExtensionModal.vue'
import { CHROME_WEB_STORE_URL } from './install-entry'

function mountModal(props: { kind: 'chrome' | 'vscode'; handheld?: boolean }) {
  const i18n = createI18n({ legacy: false, locale: 'en', messages: { en } })
  return mount(InstallExtensionModal, {
    props: { open: true, ...props },
    global: { plugins: [i18n] },
    attachTo: document.body,
  })
}

describe('InstallExtensionModal', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true })))
  })

  afterEach(() => {
    document.body.innerHTML = ''
    vi.unstubAllGlobals()
  })

  it('puts the Chrome Web Store ahead of a closed manual zip install', async () => {
    mountModal({ kind: 'chrome', handheld: false })
    await flushPromises()

    const store = document.querySelector('[data-testid="chrome-store-link"]') as HTMLAnchorElement | null
    const manual = document.querySelector('[data-testid="chrome-manual-install"]') as HTMLDetailsElement | null
    expect(store).not.toBeNull()
    expect(store!.href).toBe(CHROME_WEB_STORE_URL)
    expect(store!.target).toBe('_blank')
    expect(store!.rel).toContain('noopener')
    expect(store!.tabIndex).toBeGreaterThanOrEqual(0)
    expect(store!.textContent).toContain(en.app.extensions.chromeStore)

    expect(manual).not.toBeNull()
    expect(manual!.tagName).toBe('DETAILS')
    expect(manual!.open).toBe(false)
    expect(store!.compareDocumentPosition(manual!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(manual!.textContent).toContain('manifest.json')
    expect(manual!.querySelector('[data-testid="extension-download"]')).not.toBeNull()
    expect(manual!.querySelector('summary')).not.toBeNull()
    expect(document.querySelector('[data-testid="chrome-handheld-note"]')).toBeNull()
  })

  it('keeps the store link on a handheld device and explains that install needs desktop Chrome', async () => {
    mountModal({ kind: 'chrome', handheld: true })
    await flushPromises()

    const store = document.querySelector('[data-testid="chrome-store-link"]') as HTMLAnchorElement | null
    const note = document.querySelector('[data-testid="chrome-handheld-note"]')
    expect(store?.href).toBe(CHROME_WEB_STORE_URL)
    expect(note?.textContent).toContain(en.app.extensions.chromeHandheld)
    expect(document.querySelector('[data-testid="chrome-manual-install"]')).not.toBeNull()
  })

  it('keeps the VS Code install on the VSIX path', async () => {
    mountModal({ kind: 'vscode' })
    await flushPromises()

    expect(document.querySelector('[data-testid="chrome-store-link"]')).toBeNull()
    expect(document.querySelector('[data-testid="chrome-manual-install"]')).toBeNull()
    expect(document.body.textContent).toContain('simpletools-vscode.vsix')
    const download = document.querySelector('[data-testid="extension-download"]')
    expect(download).not.toBeNull()
    expect(download!.closest('details')).toBeNull()
  })
})
