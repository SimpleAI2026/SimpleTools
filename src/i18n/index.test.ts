import { describe, expect, it } from 'vitest'
import { detectLocale, SUPPORTED_LOCALES, TOOL_MESSAGES, type AppLocale } from './index'
import zhCN from './locales/zh-CN'
import en from './locales/en'
import ja from './locales/ja'
import ko from './locales/ko'
import de from './locales/de'
import fr from './locales/fr'
import es from './locales/es'
import ptBR from './locales/pt-BR'

const LOCALE_MODULES: Record<AppLocale, object> = {
  'zh-CN': zhCN,
  en,
  ja,
  ko,
  de,
  fr,
  es,
  'pt-BR': ptBR,
}

function keys(obj: object, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([k, v]) =>
    v && typeof v === 'object' ? keys(v as object, `${prefix}${k}.`) : [`${prefix}${k}`],
  )
}

describe('i18n', () => {
  it('detects locale', () => {
    expect(detectLocale('en', ['zh-CN'])).toBe('en')
    expect(detectLocale(null, ['en-US'])).toBe('en')
    expect(detectLocale('xx', ['zh-TW'])).toBe('zh-CN')
    expect(detectLocale(null, ['fr'])).toBe('fr')
    expect(detectLocale(null, ['fr-FR'])).toBe('fr')
    expect(detectLocale(null, ['ja-JP'])).toBe('ja')
    expect(detectLocale(null, ['ko-KR'])).toBe('ko')
    expect(detectLocale(null, ['de-DE'])).toBe('de')
    expect(detectLocale(null, ['es-MX'])).toBe('es')
    expect(detectLocale(null, ['pt-BR'])).toBe('pt-BR')
    expect(detectLocale(null, ['pt-PT'])).toBe('pt-BR')
    expect(detectLocale(null, ['it-IT'])).toBe('zh-CN')
  })

  it('all supported locale modules have identical keys', () => {
    const enKeys = keys(en).sort()
    for (const locale of SUPPORTED_LOCALES) {
      expect(keys(LOCALE_MODULES[locale]).sort(), locale).toEqual(enKeys)
    }
  })

  it('every per-tool message file has matching keys across all locales with name and description', () => {
    for (const [slug, m] of Object.entries(TOOL_MESSAGES)) {
      const enKeys = keys(m.en).sort()
      for (const locale of SUPPORTED_LOCALES) {
        expect(keys(m[locale] as object).sort(), `${slug}/${locale}`).toEqual(enKeys)
      }
      expect(m['zh-CN'], slug).toHaveProperty('name')
      expect(m['zh-CN'], slug).toHaveProperty('description')
    }
  })
})
