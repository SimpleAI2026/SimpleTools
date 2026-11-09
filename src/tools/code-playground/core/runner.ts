import { WASIWorkerHost, WASIWorkerHostKilledError, type WASIFS } from '@runno/wasi'
import { cancelJavaRun, pushJavaEOF, pushJavaStdin, runJava } from '@/tools/code-playground/teavm/run'
import type { CommandSpec, LanguageSpec } from './manifest'
import { getLoaded } from './wasmLoader'
import { t } from '@/tools/code-playground/i18n'

export type Phase = 'compile' | 'link' | 'run'
export type RunOutcome =
  | { type: 'complete'; exitCode: number; phase: Phase }
  | { type: 'terminated' }
  | { type: 'crash'; message: string; errorType: string }
export interface RunCallbacks {
  stdout: (text: string) => void
  stderr: (text: string) => void
  phase: (phase: Phase) => void
}
export interface SessionOptions {
  stdin?: string
  stdinEOF?: boolean
}

export const ENTRY = '/program'
const fill = (args: string[] | undefined) => (args ?? []).map((arg) => arg.replaceAll('{entry}', ENTRY))
const now = () => new Date()
const allRuntimes = import.meta.env.VITE_ENABLE_ALL_CODE_RUNTIMES !== 'false'

async function webRuntime() {
  if (!allRuntimes) throw new Error(t('runtimeNotLoaded', { asset: 'web-only' }))
  return import('./web-runtime')
}

export class RunSession {
  private host?: WASIWorkerHost
  private killed = false
  private cancelSpecial?: () => void

  constructor(
    private lang: LanguageSpec,
    private cb: RunCallbacks,
    private opts: SessionOptions = {},
  ) {}

  async pushStdin(data: string) {
    if (this.lang.compiler === 'teavm') {
      pushJavaStdin(data)
      return
    }
    if (this.lang.compiler === 'pyodide') {
      const web = await webRuntime()
      if (!this.killed) web.pushPyodideStdin(data)
      return
    }
    if (!this.host) return
    const encoder = new TextEncoder()
    let chunk = ''
    for (const char of data) {
      if (encoder.encode(chunk + char).byteLength > 4000) {
        await this.host.pushStdin(chunk)
        chunk = ''
      }
      chunk += char
    }
    if (chunk) await this.host.pushStdin(chunk)
  }

  async pushEOF() {
    if (this.lang.compiler === 'teavm') {
      pushJavaEOF()
      return
    }
    if (this.lang.compiler === 'pyodide') {
      const web = await webRuntime()
      if (!this.killed) web.pushPyodideEOF()
      return
    }
    await this.host?.pushEOF()
  }

  kill() {
    this.killed = true
    this.cancelSpecial?.()
    if (this.lang.compiler === 'teavm') cancelJavaRun()
    try {
      this.host?.kill()
    } catch {}
  }

  private binaryFor(cmd: CommandSpec, fs: WASIFS): { url: string; revoke: boolean } {
    if (cmd.asset) {
      const asset = getLoaded(cmd.asset)
      if (!asset?.url) throw new Error(t('runtimeNotLoaded', { asset: cmd.asset }))
      return { url: asset.url, revoke: false }
    }
    if (cmd.fsPath) {
      const file = fs[cmd.fsPath]
      if (!file || file.mode !== 'binary') throw new Error(t('executableMissing', { path: cmd.fsPath }))
      const url = URL.createObjectURL(new Blob([new Uint8Array(file.content)], { type: 'application/wasm' }))
      return { url, revoke: true }
    }
    throw new Error(t('commandMissing'))
  }

  private async exec(cmd: CommandSpec, fs: WASIFS, interactive: boolean) {
    if (cmd.baseFS) {
      const base = getLoaded(cmd.baseFS)
      if (!base?.fs) throw new Error(t('fsNotLoaded', { fs: cmd.baseFS }))
      fs = { ...fs, ...base.fs }
    }
    const { url, revoke } = this.binaryFor(cmd, fs)
    const host = new WASIWorkerHost(url, {
      args: [cmd.binaryName, ...fill(cmd.args)],
      env: cmd.env ?? {},
      fs,
      isTTY: interactive && cmd.tty !== false,
      stdout: (text) => {
        if (!this.killed) this.cb.stdout(text)
      },
      stderr: (text) => {
        if (!this.killed) this.cb.stderr(text)
      },
    })
    this.host = host
    try {
      const pending = host.start()
      const preset = interactive ? this.opts.stdin : undefined
      const eof = this.opts.stdinEOF !== false
      if (preset) {
        void (async () => {
          try {
            await host.pushStdin(preset)
            if (eof) await host.pushEOF()
          } catch {}
        })()
      } else if (!interactive || this.lang.autoEOF || (preset === '' && eof)) {
        void host.pushEOF()
      }
      const result = await pending
      return { exitCode: result.exitCode, fs: { ...fs, ...result.fs } }
    } finally {
      this.host = undefined
      if (revoke) URL.revokeObjectURL(url)
    }
  }

  async run(code: string): Promise<RunOutcome> {
    if (this.lang.runtime === 'v86') return this.runV86(code)
    if (this.lang.compiler === 'teavm') return this.runTeaVM(code)
    if (this.lang.compiler === 'pyodide') return this.runPyodide(code)
    let fs: WASIFS = {
      [ENTRY]: { path: 'program', content: code, mode: 'string', timestamps: { access: now(), modification: now(), change: now() } },
    }
    try {
      if (this.lang.compiler === 'weblings') {
        this.cb.phase('compile')
        const web = await webRuntime()
        this.cancelSpecial = web.cancelRustCompile
        const compiled = await web.compileRust(code)
        if (this.killed) return { type: 'terminated' }
        if (compiled.stderr) this.cb.stderr(compiled.stderr.endsWith('\n') ? compiled.stderr : `${compiled.stderr}\n`)
        if (!compiled.ok || !compiled.wasm) return { type: 'complete', exitCode: compiled.exit || 1, phase: 'compile' }
        const stamp = now()
        fs['/program.wasm'] = { path: '/program.wasm', content: compiled.wasm, mode: 'binary', timestamps: { access: stamp, modification: stamp, change: stamp } }
      }
      for (const step of this.lang.prepare ?? []) {
        const phase = (step.step as Phase) ?? 'compile'
        this.cb.phase(phase)
        const result = await this.exec(step, fs, false)
        fs = result.fs
        if (result.exitCode !== 0) return { type: 'complete', exitCode: result.exitCode, phase }
        if (this.killed) return { type: 'terminated' }
      }
      this.cb.phase('run')
      const result = await this.exec(this.lang.run, fs, true)
      return { type: 'complete', exitCode: result.exitCode, phase: 'run' }
    } catch (error) {
      if (error instanceof WASIWorkerHostKilledError || this.killed) return { type: 'terminated' }
      const err = error as { message?: string; type?: string }
      return { type: 'crash', message: err?.message ?? String(error), errorType: err?.type ?? (error instanceof Error ? error.constructor.name : 'Error') }
    }
  }

  private async runPyodide(code: string): Promise<RunOutcome> {
    this.cb.phase('compile')
    try {
      const web = await webRuntime()
      this.cancelSpecial = web.cancelPyodide
      const exitCode = await web.runPyodide(code, {
        stdin: this.opts.stdin,
        stdinEOF: this.opts.stdin !== undefined && this.opts.stdinEOF !== false,
        stdout: (text) => { if (!this.killed) this.cb.stdout(text) },
        stderr: (text) => { if (!this.killed) this.cb.stderr(text) },
        onRunning: () => { if (!this.killed) this.cb.phase('run') },
      })
      if (this.killed) return { type: 'terminated' }
      return { type: 'complete', exitCode, phase: 'run' }
    } catch (error) {
      if (this.killed || (error as Error).name === 'AbortError') return { type: 'terminated' }
      const err = error as Error
      return { type: 'crash', message: err.message ?? String(error), errorType: err.name || 'Error' }
    }
  }

  private async runTeaVM(code: string): Promise<RunOutcome> {
    this.cb.phase('compile')
    try {
      const result = await runJava(code, {
        stdin: this.opts.stdin,
        stdinEOF: this.opts.stdinEOF,
        stdout: (text) => { if (!this.killed) this.cb.stdout(text) },
        stderr: (text) => { if (!this.killed) this.cb.stderr(text) },
        onRunning: () => { if (!this.killed) this.cb.phase('run') },
      })
      if (this.killed) return { type: 'terminated' }
      return { type: 'complete', exitCode: result.exit, phase: result.phase }
    } catch (error) {
      if (this.killed || (error as Error).name === 'AbortError') return { type: 'terminated' }
      const err = error as Error
      return { type: 'crash', message: err.message ?? String(error), errorType: err.name || 'Error' }
    }
  }

  private async runV86(code: string): Promise<RunOutcome> {
    this.cb.phase('run')
    try {
      const web = await webRuntime()
      this.cancelSpecial = () => web.linuxMachine.shutdown()
      const exitCode = await web.linuxMachine.runScript(code, this.opts.stdin ?? '')
      if (this.killed) return { type: 'terminated' }
      return { type: 'complete', exitCode, phase: 'run' }
    } catch (error) {
      const web = await webRuntime()
      if (error instanceof web.LinuxKilled || this.killed) return { type: 'terminated' }
      const err = error as { message?: string; name?: string }
      return { type: 'crash', message: err?.message ?? String(error), errorType: err?.name ?? 'Error' }
    }
  }
}
