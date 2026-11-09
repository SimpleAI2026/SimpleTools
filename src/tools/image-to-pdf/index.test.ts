/** @vitest-environment jsdom */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import ImageToPdf from './index.vue'
import FileDropzone from '@/components/shared/FileDropzone.vue'
import { i18n as appI18n } from '@/i18n'

let revokeMock: ReturnType<typeof vi.fn>

function mountTool() {
  const i18n = createI18n({ legacy: false, locale: 'en', messages: { en: appI18n.global.getLocaleMessage('en') } })
  return mount(ImageToPdf, {
    global: { plugins: [i18n], stubs: { FileDropzone: true, ModeToggle: true, RangeField: true } },
  })
}

beforeEach(() => {
  let created = 0
  revokeMock = vi.fn()
  vi.stubGlobal('URL', {
    createObjectURL: vi.fn(() => `blob:image-${++created}`),
    revokeObjectURL: revokeMock,
  })
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('image-to-pdf object URL lifecycle', () => {
  it('revokes removed images immediately and all remaining images on unmount', async () => {
    const wrapper = mountTool()
    wrapper.findComponent(FileDropzone).vm.$emit('files', [
      new File(['a'], 'a.png', { type: 'image/png' }),
      new File(['b'], 'b.png', { type: 'image/png' }),
    ])
    await wrapper.vm.$nextTick()
    expect(wrapper.findAll('img').map((img) => img.attributes('src'))).toEqual(['blob:image-1', 'blob:image-2'])

    await wrapper.get('button[aria-label="Remove"]').trigger('click')
    expect(revokeMock.mock.calls.map(([url]) => url)).toEqual(['blob:image-1'])
    wrapper.unmount()
    expect(revokeMock.mock.calls.map(([url]) => url)).toEqual(['blob:image-1', 'blob:image-2'])
  })
})
