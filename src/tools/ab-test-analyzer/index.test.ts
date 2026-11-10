/** @vitest-environment jsdom */
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import AbTestAnalyzer from './index.vue'
import { i18n as appI18n } from '@/i18n'

function mountTool() {
  const i18n = createI18n({ legacy: false, locale: 'en', messages: { en: appI18n.global.getLocaleMessage('en') } })
  return mount(AbTestAnalyzer, { global: { plugins: [i18n] } })
}

describe('ab-test-analyzer form', () => {
  it('recalculates rates and significance from user input', async () => {
    const wrapper = mountTool()
    expect(wrapper.get('[data-testid="ab-result"]').text()).toContain('13.00%')
    await wrapper.get('[data-testid="successB"]').setValue('100')
    expect(wrapper.get('[data-testid="ab-result"]').text()).toContain('0 / 1')
    await wrapper.get('[data-testid="successB"]').setValue('1001')
    expect(wrapper.text()).toContain('The input does not match this tool.')
  })
})
