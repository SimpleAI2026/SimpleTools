/// <reference lib="webworker" />
import { isCsvFilename, mapConvertError, selectAnydocFormat, fileExtension, type AnydocFormat, type ConvertFailure } from './logic'

export interface ConvertRequest {
  id: number
  filename: string
  bytes: ArrayBuffer
  jsUrl: string
  wasmUrl: string
}

export type WorkerPhase = { id: number; phase: 'loading' | 'converting' }

export type WorkerResult =
  | { id: number; ok: true; markdown: string; format: AnydocFormat; elapsedMs: number }
  | { id: number; ok: false; failure: ConvertFailure }

interface AnydocModule {
  default: (input?: { module_or_path: string }) => Promise<unknown>
  formatFromBytes: (bytes: Uint8Array) => AnydocFormat | undefined
  formatFromExtension: (extension: string) => AnydocFormat | undefined
  formatFromPath: (path: string) => AnydocFormat | undefined
  toMarkdownBytes: (bytes: Uint8Array, format?: AnydocFormat | null) => string
}

let engine: Promise<AnydocModule> | null = null

function loadEngine(jsUrl: string, wasmUrl: string): Promise<AnydocModule> {
  if (!engine) {
    engine = (async () => {
      const mod = (await import(/* @vite-ignore */ jsUrl)) as AnydocModule
      await mod.default({ module_or_path: wasmUrl })
      return mod
    })().catch((error: unknown) => {
      engine = null
      throw error
    })
  }
  return engine
}

function chooseFormat(mod: AnydocModule, filename: string, bytes: Uint8Array): AnydocFormat | undefined {
  if (isCsvFilename(filename)) {
    const named = mod.formatFromExtension(fileExtension(filename))
    return selectAnydocFormat(filename, undefined, named ?? 'csv')
  }
  return selectAnydocFormat(filename, mod.formatFromBytes(bytes), mod.formatFromPath(filename))
}

self.onmessage = async (event: MessageEvent<ConvertRequest>) => {
  const request = event.data
  try {
    self.postMessage({ id: request.id, phase: 'loading' } satisfies WorkerPhase)
    const mod = await loadEngine(request.jsUrl, request.wasmUrl)
    const bytes = new Uint8Array(request.bytes)
    const format = chooseFormat(mod, request.filename, bytes)
    if (!format) {
      self.postMessage({
        id: request.id,
        ok: false,
        failure: { code: 'unsupported', message: 'unrecognized file content and extension' },
      } satisfies WorkerResult)
      return
    }
    self.postMessage({ id: request.id, phase: 'converting' } satisfies WorkerPhase)
    const started = performance.now()
    const markdown = mod.toMarkdownBytes(bytes, format)
    const elapsedMs = performance.now() - started
    self.postMessage({ id: request.id, ok: true, markdown, format, elapsedMs } satisfies WorkerResult)
  } catch (error) {
    self.postMessage({ id: request.id, ok: false, failure: mapConvertError(error) } satisfies WorkerResult)
  }
}
