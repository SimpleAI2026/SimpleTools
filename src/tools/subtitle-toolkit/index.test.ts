/** @vitest-environment jsdom */
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import SubtitleToolkit from './index.vue'
import { i18n as appI18n } from '@/i18n'

function mountTool() {
  const i18n = createI18n({ legacy: false, locale: 'en', messages: { en: appI18n.global.getLocaleMessage('en') } })
  return mount(SubtitleToolkit, { global: { plugins: [i18n] } })
}

describe('subtitle-toolkit editor', () => {
  it('renders shifted VTT output from the visible controls', async () => {
    const wrapper = mountTool()
    await wrapper.get('[data-testid="subtitle-input"]').setValue('1\n00:00:59,900 --> 00:01:00,200\nHello\n')
    await wrapper.get('input[type="number"]').setValue('200')
    await wrapper.get('select').setValue('vtt')
    expect((wrapper.get('[data-testid="subtitle-output"]').element as HTMLTextAreaElement).value).toContain('00:01:00.100 --> 00:01:00.400')
  })

  it('keeps complex input raw and shows the boundary warning', async () => {
    const wrapper = mountTool()
    await wrapper.get('[data-testid="subtitle-input"]').setValue('WEBVTT\n\nSTYLE\n::cue { color: red }\n\n00:00.000 --> 00:01.000\nHi\n')
    expect(wrapper.text()).toContain('STYLE, REGION, or voice markup was detected')
    expect((wrapper.get('[data-testid="subtitle-output"]').element as HTMLTextAreaElement).value).toContain('::cue')
  })
})
