import { describe, expect, it } from 'vitest'
import { parseFenceInfo } from './fence'
import { DOC_LANG_TO_RUNTIME, resolveRuntime } from './runtime'
import { shouldBackup } from './backup'
import { chapterId, chapterSlug, englishGap } from './edition'

describe('code playground docs', () => {
  it('parses fences and marks only excluded or unknown languages as not runnable', () => {
    const parsed = parseFenceInfo('javascript run stdin="Ada\\n42" expect="Hello" title="Greeting" foo=bar')
    expect(parsed.attrs).toMatchObject({ runnable: true, stdin: 'Ada\n42', expect: 'Hello', title: 'Greeting', eof: true })
    expect(parsed.extra.foo).toBe('bar')
    expect(parseFenceInfo('python').attrs.runnable).toBe(true)
    expect(parseFenceInfo('rust').attrs.runnable).toBe(true)
    expect(parseFenceInfo('zig').attrs.runnable).toBe(false)
    expect(parseFenceInfo('java norun').attrs.runnable).toBe(false)
    expect(parseFenceInfo('java norun', 'en').attrs.reason).toBe('For reading only')
    expect(parseFenceInfo('java eof="false"').attrs.eof).toBe(false)
  })

  it('maps all SimpleCode runtime aliases', () => {
    expect(Object.keys(DOC_LANG_TO_RUNTIME)).toHaveLength(25)
    expect(resolveRuntime('TS')).toBe('quickjs')
    expect(resolveRuntime('sql')).toBe('sqlite')
    expect(resolveRuntime('bash')).toBe('shell')
    expect(resolveRuntime('python')).toBe('python')
    expect(resolveRuntime('c++')).toBe('clangpp')
    expect(resolveRuntime('np')).toBe('numpy')
    expect(resolveRuntime('zig')).toBeUndefined()
  })

  it('handles editions and decides when a document write needs a backup', () => {
    expect(englishGap({ edition: 'zh', slugs: [], viewingChapter: false })).toBeNull()
    expect(englishGap({ edition: 'en', slugs: [], viewingChapter: false })).toBe('book')
    expect(englishGap({ edition: 'en', slugs: ['index'], slug: '01-hello', viewingChapter: true })).toBe('chapter')
    expect(chapterId('java', 'index', 'en')).toBe('en/java/index')
    expect(chapterSlug('en/java/01-hello')).toBe('01-hello')
    expect(shouldBackup('', 'print(1)', undefined)).toBe(false)
    expect(shouldBackup('same', 'same', undefined)).toBe(false)
    expect(shouldBackup('user', 'new', undefined)).toBe(true)
    expect(shouldBackup('user', 'new', { code: 'old' })).toBe(true)
  })
})
