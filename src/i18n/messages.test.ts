import { describe, expect, it } from 'vitest'
import { baseCompile, type CompileError } from '@intlify/message-compiler'
import { globalLocale, i18n, SUPPORTED_LOCALES } from './index'

/** Keys that intentionally use vue-i18n pluralization (`a | b | c`). Any other `|` must be escaped as {'|'}. */
const PLURAL_KEYS = new Set<string>([])

/** Flatten nested message objects to [dotted key, message] pairs. */
function flatten(obj: unknown, prefix = ''): [string, string][] {
  if (typeof obj === 'string') return [[prefix, obj]]
  if (obj && typeof obj === 'object') return Object.entries(obj).flatMap(([k, v]) => flatten(v, prefix ? `${prefix}.${k}` : k))
  return []
}

describe('i18n messages compile', () => {
  for (const locale of SUPPORTED_LOCALES) {
    it(`every ${locale} message compiles with the vue-i18n message compiler`, () => {
      const entries = flatten(i18n.global.getLocaleMessage(locale))
      expect(entries.length).toBeGreaterThan(500)
      const failures: string[] = []
      for (const [key, msg] of entries) {
        const errors: CompileError[] = []
        const { ast } = baseCompile(msg, { onError: (e) => errors.push(e), location: true })
        if (errors.length) failures.push(`${locale} ${key}: ${errors[0]!.message} → ${JSON.stringify(msg)}`)
        else if (ast.body.type === 1 /* NodeTypes.Plural (const enum) */ && !PLURAL_KEYS.has(key)) failures.push(`${locale} ${key}: unescaped "|" turns this into a plural message → ${JSON.stringify(msg)}`)
        // `%{name}` is legacy modulo syntax; `$` / `%` are otherwise literal in vue-i18n v11
        if (/%\{/.test(msg)) failures.push(`${locale} ${key}: "%{" is interpreted as a placeholder → ${JSON.stringify(msg)}`)
      }
      expect(failures).toEqual([])
    })
  }

  it('escaped literals, interpolation and pluralization render correctly', () => {
    const { t } = i18n.global
    globalLocale.value = 'zh-CN'
    expect(t('tools.json-xml.description')).toContain('"@_"')
    expect(t('tools.aes-encryption.note')).toContain('盐16字节 | IV 12字节 | 密文')
    expect(t('tools.regex-tester.replace')).toContain('$1、$<name>')
    expect(t('tools.image-compressor.total', { from: '2 MB', to: '1 MB', pct: 50 })).toBe('合计 2 MB → 1 MB（节省 50%）')
    globalLocale.value = 'en'
    expect(globalLocale.value).toBe('en')
    expect(t('tools.pdf-redact.prev')).toBe('Previous')
    expect(t('tools.pdf-redact.page', { n: 2, total: 5 })).toBe('Page 2 / 5')
    i18n.global.mergeLocaleMessage('en', { __plural: 'no items | one item | {count} items' })
    expect(t('__plural' as never, 0)).toBe('no items')
    expect(t('__plural' as never, 1)).toBe('one item')
    expect(t('__plural' as never, 7)).toBe('7 items')
    globalLocale.value = 'zh-CN'
  })
})
