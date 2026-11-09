import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { RunSession, type Phase } from '@/tools/code-playground/core/runner'
import { terminal } from '@/tools/code-playground/core/terminal'
import { TranspileError, transpileTypeScript } from '@/tools/code-playground/core/transpile'
import { useLanguageStore } from './language'
import { useEditorStore } from './editor'
import { t } from '@/tools/code-playground/i18n'
import type { MessageKey } from '@/tools/code-playground/i18n/messages'

export type RunStatus = 'idle' | 'preparing' | 'compile' | 'link' | 'run' | 'done' | 'failed' | 'terminated' | 'crash'
export interface RunOptions {
  stdin?: string
  stdinEOF?: boolean
  source?: string
}

export const useRunStore = defineStore('code-run', () => {
  const status = ref<RunStatus>('idle')
  const exitCode = ref<number>()
  const elapsed = ref(0)
  const message = ref<string>()
  const messageKey = ref<MessageKey>()
  const source = ref<string>()
  let session: RunSession | undefined
  let timer: number | undefined
  let started = 0
  let generation = 0

  const running = computed(() => ['preparing', 'compile', 'link', 'run'].includes(status.value))
  function startTimer() {
    started = performance.now()
    elapsed.value = 0
    timer = window.setInterval(() => (elapsed.value = performance.now() - started), 100)
  }
  function stopTimer() {
    window.clearInterval(timer)
    elapsed.value = performance.now() - started
  }
  async function waitUntilIdle(timeout = 1500) {
    const start = Date.now()
    while (running.value && Date.now() - start < timeout) await new Promise((resolve) => setTimeout(resolve, 30))
    return !running.value
  }
  function abandon() {
    generation++
    const current = session
    session = undefined
    current?.kill()
    window.clearInterval(timer)
    status.value = 'idle'
    exitCode.value = undefined
    message.value = undefined
    messageKey.value = undefined
    source.value = undefined
    elapsed.value = 0
  }

  async function run(opts?: RunOptions) {
    const langs = useLanguageStore()
    const editor = useEditorStore()
    const lang = langs.selected
    if (!lang || running.value) return
    const gen = generation
    const langId = lang.id
    const still = () => gen === generation && langs.selectedId === langId
    source.value = opts?.source ?? 'editor'
    status.value = 'preparing'
    message.value = undefined
    messageKey.value = undefined
    exitCode.value = undefined
    let code = editor.get(editor.activeBuffer(lang.id)) ?? ''
    if (lang.id === 'quickjs' && editor.dialect === 'ts') {
      try {
        code = await transpileTypeScript(code)
      } catch (e) {
        if (!still()) return
        stop()
        terminal.clear()
        elapsed.value = 0
        status.value = 'failed'
        messageKey.value = 'transpileFailed'
        message.value = t('transpileFailed')
        const detail = e instanceof TranspileError ? e.detail : e instanceof Error ? e.message : String(e)
        terminal.system('tsTranspileFailed', undefined, '31')
        terminal.write(detail.endsWith('\n') ? detail : `${detail}\n`)
        return
      }
    }
    if (!still() || !(await langs.ensure(lang.id)) || !still()) {
      if (still()) status.value = 'idle'
      return
    }
    stop()
    terminal.clear()
    status.value = 'preparing'
    const stdin = opts?.stdin
    const stdinEOF = opts?.stdinEOF
    const current = new RunSession(lang, {
      stdout: (text) => {
        if (still()) terminal.write(text)
      },
      stderr: (text) => {
        if (still()) terminal.stderr(text)
      },
      phase: (phase: Phase) => {
        if (!still() || session !== current) return
        status.value = phase
        if (phase === 'run') {
          terminal.setInputHandler(inputHandler)
          if (stdin) terminal.write(`\x1b[38;5;247m${stdin.endsWith('\n') ? stdin : `${stdin}\n`}\x1b[39m`)
        }
      },
    }, { stdin, stdinEOF })
    const inputHandler: { onLine: (line: string) => void; onEOF: () => void; onInterrupt: () => void } = {
      onLine: (line: string) => void current.pushStdin(line),
      onEOF: () => void current.pushEOF(),
      onInterrupt: () => stop(),
    }
    session = current
    startTimer()
    const out = await current.run(code)
    if (!still() || session !== current) return
    stopTimer()
    terminal.flush()
    terminal.setInputHandler(undefined)
    session = undefined
    switch (out.type) {
      case 'complete':
        exitCode.value = out.exitCode
        if (out.phase !== 'run' && out.exitCode !== 0) {
          status.value = 'failed'
          const key = out.phase === 'compile' ? 'compileFailed' : 'linkFailed'
          messageKey.value = key
          message.value = t(key)
          terminal.system(key, undefined, '31')
        } else status.value = out.exitCode === 0 ? 'done' : 'failed'
        break
      case 'terminated':
        status.value = 'terminated'
        terminal.system('terminated')
        break
      case 'crash': {
        status.value = 'crash'
        const detail = `${out.errorType}: ${out.message}`
        message.value = detail
        terminal.system('crashedBanner', { detail }, '31')
        break
      }
    }
  }

  function stop() {
    session?.kill()
  }

  return { status, exitCode, elapsed, message, messageKey, source, running, run, stop, abandon, waitUntilIdle }
})
