/** @vitest-environment jsdom */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import PdfEditor from './index.vue'
import FileDropzone from '@/components/shared/FileDropzone.vue'
import PdfInput from '@/components/shared/PdfInput.vue'
import { i18n as appI18n } from '@/i18n'

const loadPdfMock = vi.hoisted(() => vi.fn())
vi.mock('@/lib/usePdfFile', async () => {
  const { ref } = await import('vue')
  return {
    usePdfFile: () => ({
      file: ref(null),
      bytes: ref(new Uint8Array([1])),
      doc: ref({}),
      numPages: ref(1),
      error: ref(''),
      busy: ref(false),
      needsPassword: ref(false),
      load: loadPdfMock,
      baseName: () => 'sample',
    }),
  }
})

let revokeMock: ReturnType<typeof vi.fn>
let createMock: ReturnType<typeof vi.fn>

function mountTool() {
  const i18n = createI18n({ legacy: false, locale: 'en', messages: { en: appI18n.global.getLocaleMessage('en') } })
  return mount(PdfEditor, {
    global: {
      plugins: [i18n],
      stubs: {
        FileDropzone: true,
        PdfInput: true,
        RangeField: true,
        PdfPageCanvas: {
          template: '<div data-testid="pdf-canvas" @click="$emit(\'down\', { x: 10, y: 20 })"><slot :scale="1" /></div>',
        },
      },
    },
  })
}

async function addImageEdits(wrapper: VueWrapper, count = 1) {
  const imageMode = wrapper.findAll('button').find((button) => button.text() === 'Image')!
  await imageMode.trigger('click')
  wrapper.findComponent(FileDropzone).vm.$emit('file', new File(['image'], 'image.png', { type: 'image/png' }))
  await flushPromises()
  const canvas = wrapper.get('[data-testid="pdf-canvas"]')
  for (let i = 0; i < count; i++) await canvas.trigger('click')
}

beforeEach(() => {
  let created = 0
  createMock = vi.fn(() => `blob:edit-${++created}`)
  revokeMock = vi.fn()
  vi.stubGlobal('URL', { createObjectURL: createMock, revokeObjectURL: revokeMock })
  vi.stubGlobal('createImageBitmap', vi.fn(async () => ({ width: 100, height: 50, close: vi.fn() })))
  loadPdfMock.mockReset().mockResolvedValue(undefined)
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.clearAllMocks()
})

describe('pdf-editor image URL lifecycle', () => {
  it('shares an edit image URL and revokes it only on unmount', async () => {
    const wrapper = mountTool()
    await addImageEdits(wrapper, 2)
    expect(createMock).toHaveBeenCalledOnce()
    expect(wrapper.findAll('img').map((img) => img.attributes('src'))).toEqual(['blob:edit-1', 'blob:edit-1'])

    const remove = wrapper.findAll('button').find((button) => button.text() === 'Delete')!
    await remove.trigger('click')
    expect(revokeMock).not.toHaveBeenCalled()
    wrapper.unmount()
    expect(revokeMock.mock.calls.map(([url]) => url)).toEqual(['blob:edit-1'])
  })

  it('revokes edit image URLs when a replacement PDF is loaded', async () => {
    const wrapper = mountTool()
    await addImageEdits(wrapper)
    wrapper.findComponent(PdfInput).vm.$emit('load', new File(['pdf'], 'next.pdf', { type: 'application/pdf' }))
    await flushPromises()

    expect(loadPdfMock).toHaveBeenCalledOnce()
    expect(revokeMock.mock.calls.map(([url]) => url)).toEqual(['blob:edit-1'])
    expect(wrapper.find('[data-testid="pdf-canvas"] img').exists()).toBe(false)
    wrapper.unmount()
    expect(revokeMock).toHaveBeenCalledOnce()
  })
})
