import { defineStore } from 'pinia'
import { reactive, ref, watch } from 'vue'
import { locale } from '@/tools/code-playground/i18n'
import { isUntouchedSample, sampleFor } from '@/tools/code-playground/samples'

const key = (id: string) => `st_code:code:${id}`
const DIALECT_KEY = 'st_code:quickjs:dialect'
export type JsDialect = 'js' | 'ts'
export function bufferId(langId: string, dialect: JsDialect) {
  return langId === 'quickjs' ? `quickjs:${dialect}` : langId
}
export function syntaxFor(langId: string, syntax: string, dialect: JsDialect) {
  if (langId !== 'quickjs') return syntax
  return dialect === 'ts' ? 'typescript' : 'javascript'
}
export function fileNameFor(langId: string, fileName: string, dialect: JsDialect) {
  if (langId !== 'quickjs') return fileName
  return dialect === 'ts' ? 'main.ts' : 'main.js'
}
export interface DocWrite {
  blockId: string
  code: string
}

export const useEditorStore = defineStore('code-editor', () => {
  const codes = reactive<Record<string, string>>({})
  const docWrites: Record<string, DocWrite> = {}
  const origins: Record<string, 'user' | 'doc' | 'model'> = {}
  const pending = new Map<string, { code: string; timer: ReturnType<typeof setTimeout> }>()
  const stored = localStorage.getItem(DIALECT_KEY)
  const dialect = ref<JsDialect>(stored === 'ts' ? 'ts' : 'js')
  watch(dialect, (value) => localStorage.setItem(DIALECT_KEY, value))
  watch(locale, (next) => {
    for (const id of Object.keys(codes)) {
      if (!isUntouchedSample(id, codes[id] ?? '')) continue
      const nextCode = sampleFor(id, next)
      codes[id] = nextCode
      persist(id, nextCode)
    }
  })

  function persist(id: string, code: string) {
    try {
      localStorage.setItem(key(id), code)
    } catch {}
  }
  function schedulePersist(id: string, code: string) {
    const current = pending.get(id)
    if (current) clearTimeout(current.timer)
    const timer = setTimeout(() => {
      persist(id, code)
      pending.delete(id)
    }, 150)
    pending.set(id, { code, timer })
  }
  function flush() {
    for (const [id, entry] of pending) {
      clearTimeout(entry.timer)
      persist(id, entry.code)
    }
    pending.clear()
  }
  function activeBuffer(langId: string) {
    return bufferId(langId, dialect.value)
  }
  function get(id: string) {
    if (!(id in codes)) {
      let saved = localStorage.getItem(key(id))
      if (saved !== null && isUntouchedSample(id, saved)) {
        const localized = sampleFor(id, locale.value)
        if (saved !== localized) {
          saved = localized
          persist(id, saved)
        }
      }
      codes[id] = saved ?? sampleFor(id, locale.value)
    }
    return codes[id] ?? ''
  }
  function set(id: string, code: string, opts?: { origin?: 'user' | 'doc' | 'model'; blockId?: string }) {
    const origin = opts?.origin ?? 'user'
    origins[id] = origin
    if (origin === 'doc' && opts?.blockId) docWrites[id] = { blockId: opts.blockId, code }
    codes[id] = code
    if (origin === 'model') schedulePersist(id, code)
    else {
      const current = pending.get(id)
      if (current) {
        clearTimeout(current.timer)
        pending.delete(id)
      }
      persist(id, code)
    }
  }
  function reset(id: string) {
    const current = pending.get(id)
    if (current) {
      clearTimeout(current.timer)
      pending.delete(id)
    }
    localStorage.removeItem(key(id))
    origins[id] = 'user'
    delete docWrites[id]
    codes[id] = sampleFor(id, locale.value)
  }
  function lastDocWrite(id: string): DocWrite | undefined {
    return docWrites[id]
  }
  function consumeOrigin(id: string): 'user' | 'doc' | 'model' {
    const origin = origins[id] ?? 'user'
    origins[id] = 'user'
    return origin
  }
  return { codes, dialect, activeBuffer, get, set, reset, flush, lastDocWrite, consumeOrigin }
})
