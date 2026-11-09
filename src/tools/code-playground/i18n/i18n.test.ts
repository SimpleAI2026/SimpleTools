import { describe, expect, it } from 'vitest'
import { globalLocale, SUPPORTED_LOCALES, type AppLocale } from '@/i18n'
import { en, zh, type MessageKey } from './messages'
import { messages, t } from './index'

const packs: Record<AppLocale, Record<MessageKey, string>> = {
  'zh-CN': zh,
  en,
  ja: messages.ja,
  ko: messages.ko,
  de: messages.de,
  fr: messages.fr,
  es: messages.es,
  'pt-BR': messages['pt-BR'],
}

function placeholders(text: string) {
  return [...text.matchAll(/\{([A-Za-z0-9_]+)\}/g)].map((match) => match[1]).sort()
}

describe('code playground i18n', () => {
  it('has complete, non-empty messages with matching placeholders in all eight locales', () => {
    const expected = Object.keys(en).sort()
    for (const locale of SUPPORTED_LOCALES) {
      const pack = packs[locale]
      expect(Object.keys(pack).sort(), locale).toEqual(expected)
      for (const key of expected as MessageKey[]) {
        expect(pack[key].trim(), `${locale} ${key}`).not.toBe('')
        expect(placeholders(pack[key]), `${locale} ${key}`).toEqual(placeholders(en[key]))
      }
    }
  })

  it('updates translations with the global SimpleTools locale', () => {
    const previous = globalLocale.value
    try {
      globalLocale.value = 'zh-CN'
      expect(t('runtimeLanguages')).toBe('运行语言')
      globalLocale.value = 'fr'
      expect(t('runtimeLanguages')).toBe('Langages de programmation')
    } finally {
      globalLocale.value = previous
    }
  })
})
