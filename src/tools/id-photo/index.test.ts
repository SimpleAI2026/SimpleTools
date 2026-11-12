/** @vitest-environment jsdom */
import { describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { i18n as appI18n } from '@/i18n'

let releaseDetect: (v: null) => void = () => {}
vi.mock('./engine', () => ({
  initBackend: vi.fn(async () => 'wasm'),
  detectFace: vi.fn(() => new Promise<null>((resolve) => { releaseDetect = resolve })),
  matte: vi.fn(async () => new Float32Array(0)),
  disposeModels: vi.fn(),
}))
vi.mock('./render', async (orig) => ({
  ...(await orig<typeof import('./render')>()),
  fileToCanvas: vi.fn(async () => document.createElement('canvas')),
  hasTransparency: vi.fn(() => false),
}))
vi.mock('@/lib/sampleImage', () => ({ loadSampleImage: vi.fn(async () => new File(['x'], 'portrait.jpg', { type: 'image/jpeg' })) }))

import IdPhoto from './index.vue'

describe('id-photo loading state', () => {
  it('shows a spinner overlay with the stage text and disables actions while busy', async () => {
    const i18n = createI18n({ legacy: false, locale: 'en', messages: { en: appI18n.global.getLocaleMessage('en') } })
    const wrapper = mount(IdPhoto, { global: { plugins: [i18n], stubs: { FileDropzone: true, ModeToggle: true, RangeField: true } } })
    expect(wrapper.find('[data-testid="id-photo-loading"]').exists()).toBe(false)

    const sample = wrapper.findAll('button').find((b) => b.text().includes('Sample'))!
    await sample.trigger('click')
    await flushPromises()

    const overlay = wrapper.get('[data-testid="id-photo-loading"]')
    expect(overlay.attributes('role')).toBe('status')
    expect(overlay.text()).toContain('Detecting face…')
    expect(overlay.find('svg.animate-spin').exists()).toBe(true)
    expect(wrapper.attributes('data-busy')).toBe('true')
    expect(sample.attributes('disabled')).toBeDefined()
    for (const b of wrapper.findAll('button').filter((b) => b.text().includes('Download'))) expect(b.attributes('disabled')).toBeDefined()
    expect(wrapper.get('select').attributes('disabled')).toBeDefined()
    expect(wrapper.text()).not.toContain('Processing')

    releaseDetect(null)
    await flushPromises()
    expect(wrapper.find('[data-testid="id-photo-loading"]').exists()).toBe(false)
    expect(wrapper.attributes('data-busy')).toBe('false')
    wrapper.unmount()
  })
})
