/** @vitest-environment jsdom */
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import TextIO from './TextIO.vue'
import en from '@/i18n/locales/en'
import zhCN from '@/i18n/locales/zh-CN'

describe('TextIO', () => {
  it('uses responsive pane height classes instead of fixed h-[500px]', () => {
    const i18n = createI18n({ legacy: false, locale: 'en', messages: { en, 'zh-CN': zhCN } })
    const w = mount(TextIO, {
      props: { modelValue: 'a', output: 'b' },
      global: { plugins: [i18n] },
    })
    const html = w.html()
    expect(html).not.toMatch(/min-h-\[500px\] h-\[500px\]/)
    expect(html).toMatch(/min\(500px,\s*45dvh\)/)
    expect(w.find('[data-testid="textio-tabs"]').exists()).toBe(true)
  })
})
