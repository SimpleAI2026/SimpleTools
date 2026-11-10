/** @vitest-environment jsdom */
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import UtmBuilder from './index.vue'
import { i18n as appI18n } from '@/i18n'

function mountTool() {
  const i18n = createI18n({ legacy: false, locale: 'en', messages: { en: appI18n.global.getLocaleMessage('en') } })
  return mount(UtmBuilder, { global: { plugins: [i18n] } })
}

describe('utm-builder form', () => {
  it('builds each URL from the visible fields', async () => {
    const wrapper = mountTool()
    await wrapper.get('[data-testid="utm-urls"]').setValue('https://ex.com/a?x=1#hero\nhttps://ex.com/b')
    await wrapper.get('[data-testid="utm_campaign"]').setValue('春促')
    const first = wrapper.get('[data-testid="utm-result-1"]').element as HTMLInputElement
    const second = wrapper.get('[data-testid="utm-result-2"]').element as HTMLInputElement
    expect(first.value).toContain('x=1')
    expect(first.value).toContain('utm_campaign=%E6%98%A5%E4%BF%83')
    expect(first.value.endsWith('#hero')).toBe(true)
    expect(second.value).toContain('utm_source=newsletter')
  })
})
