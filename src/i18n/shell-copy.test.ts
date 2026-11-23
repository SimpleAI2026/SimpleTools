import { describe, expect, it } from 'vitest'
import de from './locales/de'
import en from './locales/en'
import es from './locales/es'
import fr from './locales/fr'
import ja from './locales/ja'
import ko from './locales/ko'
import ptBR from './locales/pt-BR'
import zhCN from './locales/zh-CN'

const locales = { 'zh-CN': zhCN, en, ja, ko, de, fr, es, 'pt-BR': ptBR }
const absoluteOffline = /从不离开|从不联网|never leaves|never leave|niemals|nunca salen|ne quittent jamais|jamais|離れ|떠나지|nunca saem/i

describe('shell copy', () => {
  it('states local processing, on-demand downloads, and a configured Agent API in every language', () => {
    const markers: Record<keyof typeof locales, [string, string, string]> = {
      'zh-CN': ['本地', '下载', 'API'],
      en: ['locally', 'download', 'API'],
      ja: ['ローカル', '取得', 'API'],
      ko: ['로컬', '받', 'API'],
      de: ['lokal', 'geladen', 'API'],
      fr: ['localement', 'télécharg', 'API'],
      es: ['en local', 'descarg', 'API'],
      'pt-BR': ['aparelho', 'baix', 'API'],
    }
    for (const [name, messages] of Object.entries(locales) as [keyof typeof locales, (typeof locales)['en']][]) {
      const [local, download, api] = markers[name]
      for (const text of [messages.app.privacy, messages.app.tagline]) {
        expect(text, name).not.toMatch(absoluteOffline)
        expect(text.toLowerCase(), name).toContain(local.toLowerCase())
        expect(text.toLowerCase(), name).toContain(download.toLowerCase())
        expect(text, name).toContain(api)
      }
    }
  })

  it('invites a voluntary star without a count, and names the store ahead of the zip', () => {
    for (const [name, messages] of Object.entries(locales)) {
      expect(messages.app.github, name).toMatch(/star/i)
      expect(messages.app.github, name).not.toMatch(/\d/)
      expect(messages.app.extensions.chromeStore.length, name).toBeGreaterThan(0)
      expect(messages.app.extensions.chromeManual.toLowerCase(), name).toMatch(/zip/)
      expect(messages.app.extensions.chromeHandheld.length, name).toBeGreaterThan(0)
      expect(messages.app.extensions.chromeStep2.toLowerCase(), name).toContain('manifest.json')
    }
    for (const [name, messages] of Object.entries(locales)) {
      if (name === 'en') continue
      expect(messages.app.extensions.chromeStore, name).not.toBe(en.app.extensions.chromeStore)
      expect(messages.app.github, name).not.toBe(en.app.github)
    }
  })
})
