/** @vitest-environment jsdom */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import PdfiumPreview from './index.vue'
import FileDropzone from '@/components/shared/FileDropzone.vue'
import { i18n as appI18n } from '@/i18n'
import { destroyPdfium, openPdfiumDoc, renderPdfiumPage, renderThumb, type PdfiumDoc } from './pdfium'

vi.mock('./pdfium', () => ({
  destroyPdfium: vi.fn(),
  extractEmbeddedImages: vi.fn(),
  openPdfiumDoc: vi.fn(),
  renderPdfiumPage: vi.fn(),
  renderThumb: vi.fn(),
}))

const openMock = vi.mocked(openPdfiumDoc)
const renderMock = vi.mocked(renderPdfiumPage)
const thumbMock = vi.mocked(renderThumb)
let revokeMock: ReturnType<typeof vi.fn>

type RenderResult = Awaited<ReturnType<typeof renderPdfiumPage>>

function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((r) => {
    resolve = r
  })
  return { promise, resolve }
}

function makeDoc(): PdfiumDoc {
  return { destroy: vi.fn(async () => {}) } as unknown as PdfiumDoc
}

function makeFile(name: string, marker: number): File {
  return {
    name,
    size: 1,
    type: 'application/pdf',
    arrayBuffer: async () => new Uint8Array([marker]).buffer,
  } as unknown as File
}

function result(text: string): RenderResult {
  return { blob: new Blob([text]), width: 100, height: 100, text }
}

function mountPreview() {
  const i18n = createI18n({
    legacy: false,
    locale: 'en',
    messages: { en: appI18n.global.getLocaleMessage('en') },
  })
  return mount(PdfiumPreview, {
    global: {
      plugins: [i18n],
      stubs: { FileDropzone: true, ModeToggle: true, RangeField: true },
    },
  })
}

beforeEach(() => {
  revokeMock = vi.fn()
  vi.stubGlobal('URL', {
    createObjectURL: vi.fn(() => 'blob:preview'),
    revokeObjectURL: revokeMock,
  })
  openMock.mockReset().mockImplementation(async () => ({ doc: makeDoc(), pageCount: 2 }))
  renderMock.mockReset().mockImplementation(async (_doc, index) => result(`page ${index}`))
  thumbMock.mockReset().mockImplementation(async (_doc, index) => `blob:thumb-${index}`)
  vi.mocked(destroyPdfium).mockReset().mockResolvedValue(undefined)
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.clearAllMocks()
})

describe('pdfium-preview async lifecycle', () => {
  it('keeps busy true until initial rendering and thumbnails have finished', async () => {
    const pendingThumb = deferred<string>()
    openMock.mockResolvedValueOnce({ doc: makeDoc(), pageCount: 1 })
    thumbMock.mockImplementationOnce(() => pendingThumb.promise)
    const wrapper = mountPreview()

    wrapper.findComponent(FileDropzone).vm.$emit('file', makeFile('one.pdf', 1))
    await flushPromises()
    expect(thumbMock).toHaveBeenCalledOnce()
    expect(wrapper.get('[data-testid="open-pdf"]').attributes('disabled')).toBeDefined()

    pendingThumb.resolve('blob:thumb-0')
    await flushPromises()
    expect(wrapper.get('[data-testid="open-pdf"]').attributes('disabled')).toBeUndefined()
    wrapper.unmount()
  })

  it('discards an older page render that finishes after the latest render', async () => {
    const wrapper = mountPreview()
    wrapper.findComponent(FileDropzone).vm.$emit('file', makeFile('one.pdf', 1))
    await flushPromises()
    expect((wrapper.get('textarea').element as HTMLTextAreaElement).value).toBe('page 0')

    const oldRender = deferred<RenderResult>()
    const latestRender = deferred<RenderResult>()
    renderMock.mockImplementationOnce(() => oldRender.promise).mockImplementationOnce(() => latestRender.promise)
    await wrapper.get('[data-testid="next-page"]').trigger('click')
    await wrapper.get('[data-testid="thumbnail-0"]').trigger('click')
    latestRender.resolve(result('latest page 0'))
    await flushPromises()
    expect((wrapper.get('textarea').element as HTMLTextAreaElement).value).toBe('latest page 0')

    oldRender.resolve(result('stale page 1'))
    await flushPromises()
    expect((wrapper.get('textarea').element as HTMLTextAreaElement).value).toBe('latest page 0')
    wrapper.unmount()
  })

  it('revokes stale thumbnails and does not mix them into a replacement document', async () => {
    const oldDoc = makeDoc()
    const newDoc = makeDoc()
    const oldThumb = deferred<string>()
    openMock
      .mockResolvedValueOnce({ doc: oldDoc, pageCount: 1 })
      .mockResolvedValueOnce({ doc: newDoc, pageCount: 1 })
    thumbMock.mockImplementationOnce(() => oldThumb.promise).mockResolvedValueOnce('blob:new-thumb')
    const wrapper = mountPreview()
    const dropzone = wrapper.findComponent(FileDropzone)

    dropzone.vm.$emit('file', makeFile('old.pdf', 1))
    await flushPromises()
    dropzone.vm.$emit('file', makeFile('new.pdf', 2))
    await flushPromises()
    expect(wrapper.get('[data-testid="thumbnail-list"] img').attributes('src')).toBe('blob:new-thumb')

    oldThumb.resolve('blob:old-thumb')
    await flushPromises()
    expect(revokeMock).toHaveBeenCalledWith('blob:old-thumb')
    expect(wrapper.findAll('[data-testid="thumbnail-list"] img').map((img) => img.attributes('src'))).toEqual(['blob:new-thumb'])
    wrapper.unmount()
  })
})
