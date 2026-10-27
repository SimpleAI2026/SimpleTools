import type { Ref } from 'vue'
import { createI18n } from 'vue-i18n'
import zhCN, { type MessageSchema } from './locales/zh-CN'
import en from './locales/en'

export const SUPPORTED_LOCALES = ['zh-CN', 'en'] as const
export type AppLocale = (typeof SUPPORTED_LOCALES)[number]
export const LOCALE_STORAGE_KEY = 'st_locale'

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
export interface ToolMessages {
  zh: Record<string, unknown>
  en: Record<string, unknown>
}
export const TOOL_MESSAGES: Record<string, ToolMessages> = Object.fromEntries(
  Object.entries(import.meta.glob<ToolMessages>('../tools/*/messages.ts', { eager: true, import: 'default' })).map(
    ([path, m]) => [path.split('/').at(-2) as string, m],
  ),
)

function withTools(base: MessageSchema, lang: keyof ToolMessages): MessageSchema {
  const extra = Object.fromEntries(Object.entries(TOOL_MESSAGES).map(([slug, m]) => [slug, m[lang]]))
  return { ...base, tools: { ...base.tools, ...extra } } as MessageSchema
}

export const i18n = createI18n<[MessageSchema], AppLocale>({
  legacy: false,
  locale: typeof window === 'undefined' ? 'zh-CN' : detectLocale(readStored(), navigator.languages ?? []),
  fallbackLocale: 'en',
  messages: { 'zh-CN': withTools(zhCN, 'zh'), en: withTools(en, 'en') },
})

/** Typed access to the composition-mode global locale ref. */
export const globalLocale = i18n.global.locale as unknown as Ref<AppLocale>
