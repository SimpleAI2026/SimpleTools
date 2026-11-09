import type { Ref } from 'vue'
import { createI18n } from 'vue-i18n'
import zhCN, { type MessageSchema } from './locales/zh-CN'
import en from './locales/en'
import ja from './locales/ja'
import ko from './locales/ko'
import de from './locales/de'
import fr from './locales/fr'
import es from './locales/es'
import ptBR from './locales/pt-BR'
import { PROGRAMMING_MESSAGES } from './programming'

export const SUPPORTED_LOCALES = ['zh-CN', 'en', 'ja', 'ko', 'de', 'fr', 'es', 'pt-BR'] as const
export type AppLocale = (typeof SUPPORTED_LOCALES)[number]
export const LOCALE_STORAGE_KEY = 'st_locale'

/** Native labels for the language picker. */
export const LOCALE_META: Record<AppLocale, { nativeLabel: string }> = {
  'zh-CN': { nativeLabel: '中文' },
  en: { nativeLabel: 'English' },
  ja: { nativeLabel: '日本語' },
  ko: { nativeLabel: '한국어' },
  de: { nativeLabel: 'Deutsch' },
  fr: { nativeLabel: 'Français' },
  es: { nativeLabel: 'Español' },
  'pt-BR': { nativeLabel: 'Português (Brasil)' },
}

export function isAppLocale(v: unknown): v is AppLocale {
  return typeof v === 'string' && (SUPPORTED_LOCALES as readonly string[]).includes(v)
}

/** Stored choice first, then browser language, defaulting to Chinese. */
export function detectLocale(stored: string | null, browserLanguages: readonly string[]): AppLocale {
  if (isAppLocale(stored)) return stored
  for (const lang of browserLanguages) {
    const l = lang.toLowerCase()
    if (l.startsWith('zh')) return 'zh-CN'
    if (l.startsWith('en')) return 'en'
    if (l.startsWith('ja')) return 'ja'
    if (l.startsWith('ko')) return 'ko'
    if (l.startsWith('de')) return 'de'
    if (l.startsWith('fr')) return 'fr'
    if (l.startsWith('es')) return 'es'
    if (l.startsWith('pt')) return 'pt-BR'
  }
  return 'zh-CN'
}

function readStored(): string | null {
  try {
    return localStorage.getItem(LOCALE_STORAGE_KEY)
  } catch {
    return null
  }
}

/** Per-tool messages live next to each tool in `tools/<slug>/messages.ts`. */
export type ToolMessages = Record<AppLocale, Record<string, unknown>>
export const TOOL_MESSAGES: Record<string, ToolMessages> = Object.fromEntries(
  Object.entries(import.meta.glob<ToolMessages>('../tools/*/messages.ts', { eager: true, import: 'default' })).map(
    ([path, m]) => [path.split('/').at(-2) as string, m],
  ),
)

function withTools(base: MessageSchema, lang: AppLocale): MessageSchema {
  const extra = Object.fromEntries(Object.entries(TOOL_MESSAGES).map(([slug, m]) => [slug, m[lang]]))
  const programming = Object.fromEntries(Object.entries(PROGRAMMING_MESSAGES).map(([slug, m]) => [slug, m[lang]]))
  return { ...base, tools: { ...base.tools, ...extra, ...programming } } as MessageSchema
}

export const i18n = createI18n<[MessageSchema], AppLocale>({
  legacy: false,
  locale: typeof window === 'undefined' ? 'zh-CN' : detectLocale(readStored(), navigator.languages ?? []),
  fallbackLocale: 'en',
  messages: {
    'zh-CN': withTools(zhCN, 'zh-CN'),
    en: withTools(en, 'en'),
    ja: withTools(ja, 'ja'),
    ko: withTools(ko, 'ko'),
    de: withTools(de, 'de'),
    fr: withTools(fr, 'fr'),
    es: withTools(es, 'es'),
    'pt-BR': withTools(ptBR, 'pt-BR'),
  },
})

/** Typed access to the composition-mode global locale ref. */
export const globalLocale = i18n.global.locale as unknown as Ref<AppLocale>
