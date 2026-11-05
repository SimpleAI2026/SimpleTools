/** @vitest-environment jsdom */
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import SheetTable from './SheetTable.vue'
import en from '@/i18n/locales/en'
import zhCN from '@/i18n/locales/zh-CN'

describe('SheetTable', () => {
  it('renders a horizontal scroll hint', () => {
    const i18n = createI18n({ legacy: false, locale: 'en', messages: { en, 'zh-CN': zhCN } })
    const w = mount(SheetTable, {
      props: { rows: [['A', 'B', 'C'], ['1', '2', '3']] },
      global: { plugins: [i18n] },
    })
    expect(w.find('[data-testid="sheet-scroll-hint"]').exists()).toBe(true)
  })
})
