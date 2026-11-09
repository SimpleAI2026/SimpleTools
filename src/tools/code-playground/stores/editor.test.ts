/** @vitest-environment jsdom */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { bufferId, fileNameFor, syntaxFor, useEditorStore } from './editor'

describe('code editor store', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('debounces model edits, flushes them, and keeps JS/TS buffers separate', async () => {
    const editor = useEditorStore()
    editor.dialect = 'js'
    editor.set('quickjs:js', 'console.log(1)', { origin: 'model' })
    expect(localStorage.getItem('st_code:code:quickjs:js')).toBeNull()
    await vi.advanceTimersByTimeAsync(149)
    expect(localStorage.getItem('st_code:code:quickjs:js')).toBeNull()
    await vi.advanceTimersByTimeAsync(1)
    expect(localStorage.getItem('st_code:code:quickjs:js')).toBe('console.log(1)')

    editor.dialect = 'ts'
    expect(bufferId('quickjs', editor.dialect)).toBe('quickjs:ts')
    expect(syntaxFor('quickjs', 'javascript', editor.dialect)).toBe('typescript')
    expect(fileNameFor('quickjs', 'main.js', editor.dialect)).toBe('main.ts')
    expect(editor.get('quickjs:ts')).toContain('interface Greeting')

    editor.set('quickjs:ts', 'const n: number = 1', { origin: 'model' })
    editor.flush()
    expect(localStorage.getItem('st_code:code:quickjs:ts')).toBe('const n: number = 1')
    expect(localStorage.getItem('st_code:code:quickjs:js')).toBe('console.log(1)')
  })

  it('persists document writes immediately and resets to the sample', () => {
    const editor = useEditorStore()
    editor.set('lua', 'print("doc")', { origin: 'doc', blockId: 'lua/index#0' })
    expect(localStorage.getItem('st_code:code:lua')).toBe('print("doc")')
    expect(editor.lastDocWrite('lua')).toEqual({ blockId: 'lua/index#0', code: 'print("doc")' })
    editor.reset('lua')
    expect(localStorage.getItem('st_code:code:lua')).toBeNull()
    expect(editor.get('lua')).toContain('io.write')
  })
})
