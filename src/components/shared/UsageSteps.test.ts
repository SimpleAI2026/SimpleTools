/** @vitest-environment jsdom */
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import UsageSteps from './UsageSteps.vue'
import { SUPPORTED_LOCALES, TOOL_MESSAGES } from '@/i18n'
import { getTool } from '@/registry'

const RECENT_WORKFLOW_SLUGS = [
  'geo-question-panel',
  'ai-answer-snapshot',
  'ai-panel-observations',
  'claim-evidence-ledger',
  'evidence-answer-brief',
  'agent-eval-cases',
  'brand-entity-consistency',
  'geo-change-experiment',
  'citation-gap-map',
  'source-quote-verifier',
  'agent-trace-review',
  'blind-output-review',
  'eval-dataset-splitter',
  'localization-lqa',
  'geo-access-evidence',
  'agent-workflow-preflight',
  'utm-builder',
  'owned-marketing-report',
  'keyword-intent-map',
  'campaign-unit-economics',
  'cohort-retention-analyzer',
  'ab-test-analyzer',
  'responsive-ad-asset-validator',
  'product-feed-auditor',
  'hreflang-map-auditor',
  'redirect-migration-planner',
  'promotion-stack-simulator',
  'review-theme-coder',
  'ai-storyboard-variants',
  'subtitle-toolkit',
  'generation-take-ledger',
  'video-delivery-preflight',
  'audio-level-auditor',
  'edit-decision-log',
  'chapter-author',
  'visual-selects-board',
  'image-alt-review',
  'design-token-auditor',
  'project-handoff-auditor',
  'voiceover-timing-planner',
] as const

describe('UsageSteps', () => {
  it('provides a title and three localized steps for every recent workflow tool', () => {
    expect(RECENT_WORKFLOW_SLUGS).toHaveLength(40)
    for (const slug of RECENT_WORKFLOW_SLUGS) {
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

  it('renders a newly documented tool with the existing three-step layout', () => {
    const i18n = createI18n({
      legacy: false,
      locale: 'en',
      messages: { en: { tools: { 'utm-builder': TOOL_MESSAGES['utm-builder']!.en } } },
    })
    const wrapper = mount(UsageSteps, { props: { slug: 'utm-builder' }, global: { plugins: [i18n] } })
    expect(wrapper.get('[data-testid="usage-steps"] h2').text()).toBe('How to use')
    expect(wrapper.findAll('ol li')).toHaveLength(3)
    expect(wrapper.text()).toContain('Paste campaign URLs')
  })
})
