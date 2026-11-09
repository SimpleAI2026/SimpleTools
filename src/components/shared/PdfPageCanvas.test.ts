/** @vitest-environment jsdom */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import type { PDFDocumentProxy } from 'pdfjs-dist'
import PdfPageCanvas from './PdfPageCanvas.vue'
import { renderPage } from '@/lib/pdf'

vi.mock('@/lib/pdf', () => ({ renderPage: vi.fn() }))

const renderPageMock = vi.mocked(renderPage)
let callbacks: Record<number, ((blob: Blob | null) => void) | undefined>
let revokeMock: ReturnType<typeof vi.fn>

function makeDoc(): PDFDocumentProxy {
  return {
    getPage: vi.fn(async () => ({
      rotate: 0,
      getViewport: ({ scale }: { scale: number }) => ({ width: 100 * scale, height: 200 * scale }),
    })),
  } as unknown as PDFDocumentProxy
}

function mountCanvas() {
  const i18n = createI18n({ legacy: false, locale: 'en', messages: { en: { app: { loadError: 'Failed to render' } } } })
  const wrapper = mount(PdfPageCanvas, {
    props: { doc: makeDoc(), page: 1, width: 100 },
    global: { plugins: [i18n] },
  })
  return wrapper
}

beforeEach(() => {
  callbacks = {}
  revokeMock = vi.fn()
  let created = 0
  vi.stubGlobal('URL', {
    createObjectURL: vi.fn(() => `blob:mock-${++created}`),
    revokeObjectURL: revokeMock,
  })
  vi.stubGlobal('ResizeObserver', class {
    observe() {}
    unobserve() {}
    disconnect() {}
  })
  renderPageMock.mockImplementation(async (_doc, page) => {
    const canvas = {
      toBlob: vi.fn((callback: (blob: Blob | null) => void) => {
        callbacks[page] = callback
      }),
    }
    return canvas as unknown as HTMLCanvasElement
  })
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.clearAllMocks()
})

describe('PdfPageCanvas', () => {
  it('keeps the latest page when an older blob finishes last and revokes the stale URL', async () => {
    const wrapper = mountCanvas()
    await flushPromises()
    expect(callbacks[1]).toBeTypeOf('function')

    await wrapper.setProps({ page: 2 })
    await flushPromises()
    expect(callbacks[2]).toBeTypeOf('function')

    callbacks[2]!(new Blob(['new']))
    await flushPromises()
    expect(wrapper.get('img').attributes('src')).toBe('blob:mock-1')

    callbacks[1]!(new Blob(['old']))
    await flushPromises()
    expect(wrapper.get('img').attributes('src')).toBe('blob:mock-1')
    expect(revokeMock).toHaveBeenCalledWith('blob:mock-2')
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    wrapper.unmount()
  })

  it('revokes a URL produced after unmount without committing it', async () => {
    const wrapper = mountCanvas()
    await flushPromises()
    wrapper.unmount()

    callbacks[1]!(new Blob(['late']))
    await flushPromises()
    expect(revokeMock).toHaveBeenCalledExactlyOnceWith('blob:mock-1')
  })

  it('shows a localized error when the latest canvas cannot produce a blob', async () => {
    const wrapper = mountCanvas()
    await flushPromises()
    callbacks[1]!(null)
    await flushPromises()

    expect(wrapper.get('[role="alert"]').text()).toBe('Failed to render')
    expect(wrapper.find('img').exists()).toBe(false)
    wrapper.unmount()
  })
})
