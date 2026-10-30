/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ROUTER_MODE?: 'hash' | 'history' | string
  readonly VITE_TARGET?: 'chrome' | 'vscode' | string
  /** 'false' in chrome/vscode builds — Pandoc tool omitted */
  readonly VITE_ENABLE_PANDOC?: 'true' | 'false' | string
  readonly BASE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '*.wasm' {
  const url: string
  export default url
}

declare module 'pandoc-wasm-core' {
  export function createPandocInstance(wasmBinary: ArrayBuffer): Promise<{
    convert: (
      options: Record<string, unknown>,
      stdin: string | null,
      files: Record<string, string | Blob>,
    ) => Promise<{
      stdout: string
      stderr: string
      files: Record<string, string | Blob>
      mediaFiles?: Record<string, Blob>
    }>
    query: (options: Record<string, unknown>) => Promise<unknown>
    pandoc: (args: string[], inData?: Uint8Array | string) => Promise<Uint8Array>
  }>
}

declare module 'pandoc-wasm' {
  export function convert(
    options: Record<string, unknown>,
    stdin: string | null,
    files: Record<string, string | Blob>,
  ): Promise<{
    stdout: string
    stderr: string
    files: Record<string, string | Blob>
    mediaFiles?: Record<string, Blob>
  }>
  export function query(options: Record<string, unknown>): Promise<unknown>
}

declare module '@ffmpeg/ffmpeg/worker?url' {
  const url: string
  export default url
}
