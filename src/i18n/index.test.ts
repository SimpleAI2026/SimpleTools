import { describe, expect, it } from 'vitest'
import { detectLocale, TOOL_MESSAGES } from './index'
import zhCN from './locales/zh-CN'
import en from './locales/en'

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
    expect(detectLocale(null, ['fr'])).toBe('zh-CN')
  })
  it('zh-CN and en have identical keys', () => {
    expect(keys(en).sort()).toEqual(keys(zhCN).sort())
  })
  it('every per-tool message file has matching zh/en keys with name and description', () => {
    for (const [slug, m] of Object.entries(TOOL_MESSAGES)) {
      expect(keys(m.en).sort(), slug).toEqual(keys(m.zh).sort())
      expect(m.zh, slug).toHaveProperty('name')
      expect(m.zh, slug).toHaveProperty('description')
    }
  })
})
