/** @vitest-environment jsdom */
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import UsageSteps from './UsageSteps.vue'
import { SUPPORTED_LOCALES, TOOL_MESSAGES } from '@/i18n'
import { getTool } from '@/registry'

const RETAINED_WORKFLOW_SLUGS = [
  'utm-builder',
  'ab-test-analyzer',
  'product-feed-auditor',
  'hreflang-map-auditor',
  'redirect-migration-planner',
  'subtitle-toolkit',
  'video-delivery-preflight',
  'design-token-auditor',
] as const

describe('UsageSteps', () => {
  it('provides a title and three localized steps for every retained workflow tool', () => {
    expect(RETAINED_WORKFLOW_SLUGS).toHaveLength(8)
    for (const slug of RETAINED_WORKFLOW_SLUGS) {
      expect(getTool(slug), slug).toBeDefined()
      for (const locale of SUPPORTED_LOCALES) {
        const messages = TOOL_MESSAGES[slug]?.[locale] as Record<string, unknown>
        expect(messages?.usageTitle, `${locale} ${slug} usageTitle`).toBeTypeOf('string')
        for (const key of ['step1', 'step2', 'step3']) {
          expect(messages?.[key], `${locale} ${slug} ${key}`).toBeTypeOf('string')
          expect(String(messages?.[key]).trim().length, `${locale} ${slug} ${key}`).toBeGreaterThan(0)
        }
      }
    }
  })

  it('renders a retained tool with the existing three-step layout', () => {
    const i18n = createI18n({
      legacy: false,
      locale: 'en',
      messages: { en: { tools: { 'utm-builder': TOOL_MESSAGES['utm-builder']!.en } } },
    })
    const wrapper = mount(UsageSteps, { props: { slug: 'utm-builder' }, global: { plugins: [i18n] } })
    expect(wrapper.get('[data-testid="usage-steps"] h2').text()).toBe('How to use')
    expect(wrapper.findAll('ol li')).toHaveLength(3)
    expect(wrapper.text()).toContain('Paste one landing URL per line')
  })
})
