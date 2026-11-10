/** @vitest-environment jsdom */
import { describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import VideoDeliveryPreflight from './index.vue'
import FileDropzone from '@/components/shared/FileDropzone.vue'
import { i18n as appI18n } from '@/i18n'

const { probeMock, terminateMock } = vi.hoisted(() => ({ probeMock: vi.fn(), terminateMock: vi.fn() }))
vi.mock('@/tools/ffmpeg/engine', () => ({ runFfmpeg: probeMock, terminateFfmpeg: terminateMock }))

function mountTool() {
  const i18n = createI18n({ legacy: false, locale: 'en', messages: { en: appI18n.global.getLocaleMessage('en') } })
  return mount(VideoDeliveryPreflight, { global: { plugins: [i18n] } })
}

describe('video-delivery-preflight media flow', () => {
  it('probes the selected local file and shows the contract comparison', async () => {
    probeMock.mockResolvedValue({ log: 'Stream #0:0: Video: h264, yuv420p, 1280x720, 30 fps\nStream #0:1: Audio: aac, 48000 Hz, stereo' })
    terminateMock.mockResolvedValue(undefined)
    const wrapper = mountTool()
    wrapper.findComponent(FileDropzone).vm.$emit('file', new File(['media'], 'sample.mp4', { type: 'video/mp4' }))
    await wrapper.vm.$nextTick()
    await wrapper.get('[data-testid="run-probe"]').trigger('click')
    await flushPromises()
    expect(probeMock).toHaveBeenCalledWith(expect.objectContaining({ mode: 'probe' }))
    expect(wrapper.get('[data-testid="preflight-result"]').text()).toContain('Pass')
    wrapper.unmount()
    expect(terminateMock).toHaveBeenCalled()
  })

  it('ignores an old probe after the selected file is removed', async () => {
    let resolveProbe: (value: { log: string }) => void = () => {}
    probeMock.mockReturnValue(new Promise<{ log: string }>((resolve) => { resolveProbe = resolve }))
    terminateMock.mockResolvedValue(undefined)
    const wrapper = mountTool()
    wrapper.findComponent(FileDropzone).vm.$emit('file', new File(['media'], 'old.mp4', { type: 'video/mp4' }))
    await wrapper.vm.$nextTick()
    await wrapper.get('[data-testid="run-probe"]').trigger('click')
    const remove = wrapper.findAll('button').find((button) => button.text() === 'Remove')
    await remove?.trigger('click')
    resolveProbe({ log: 'Stream #0:0: Video: h264, 1280x720, 30 fps' })
    await flushPromises()
    expect(wrapper.find('[data-testid="preflight-result"]').exists()).toBe(false)
    expect(terminateMock).toHaveBeenCalled()
  })
})
