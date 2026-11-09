import { computed } from 'vue'
import { globalLocale, type AppLocale } from '@/i18n'
import { useSettingsStore } from '@/stores/settings'
import { en, zh, type MessageKey } from './messages'
import { ja } from './messages.ja'
import { ko } from './messages.ko'
import { de } from './messages.de'
import { fr } from './messages.fr'
import { es } from './messages.es'
import { ptBR } from './messages.pt-BR'

export type Locale = 'zh' | 'en'
export const messages = { zh, en, ja, ko, de, fr, es, 'pt-BR': ptBR }
const packs: Record<AppLocale, Record<MessageKey, string>> = { 'zh-CN': zh, en, ja, ko, de, fr, es, 'pt-BR': ptBR }
export const locale = computed<Locale>(() => globalLocale.value === 'zh-CN' ? 'zh' : 'en')

export function setLocale(next: Locale) {
  useSettingsStore().setLocale(next === 'en' ? 'en' : 'zh-CN')
}

function fill(template: string, vars?: Record<string, string | number>) {
  if (!vars) return template
  let out = template
  for (const [key, value] of Object.entries(vars)) out = out.split(`{${key}}`).join(String(value))
  return out
}

export function runtimeName(id: string, fallback: string): string {
  void id
  return fallback
}
export function bookName(id: string, fallback: string): string {
  void id
  return fallback
}

export function t(key: MessageKey, vars?: Record<string, string | number>): string {
  return fill(packs[globalLocale.value][key], vars)
}
