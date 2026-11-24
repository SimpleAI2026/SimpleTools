/** Browser format strings published by anydoc-wasm v0.2.5. Excel variants are all `xlsx`. */
export const ANYDOC_FORMATS = ['doc', 'docx', 'odt', 'pdf', 'ppt', 'pptx', 'rtf', 'epub', 'xlsx', 'ods', 'odp', 'csv'] as const
export type AnydocFormat = (typeof ANYDOC_FORMATS)[number]

export const CONVERT_ERROR_CODES = ['unsupported', 'needsOcr', 'malformed', 'encrypted', 'resourceLimit', 'missingPart'] as const
export type ConvertErrorCode = (typeof CONVERT_ERROR_CODES)[number]
export type FailureCode = ConvertErrorCode | 'engine'

export interface ConvertFailure {
  code: FailureCode
  message: string
  pages?: number[]
  pageCount?: number
}

export const FORMAT_GROUPS = [
  { id: 'word', extensions: ['.doc', '.docx', '.docm'] },
  { id: 'powerpoint', extensions: ['.ppt', '.pps', '.pot', '.pptx', '.pptm', '.ppsx', '.ppsm'] },
  { id: 'excel', extensions: ['.xls', '.xlsx', '.xlsm', '.xlsb'] },
  { id: 'opendocument', extensions: ['.odt', '.ods', '.odp'] },
  { id: 'rtf', extensions: ['.rtf'] },
  { id: 'epub', extensions: ['.epub'] },
  { id: 'pdf', extensions: ['.pdf'] },
  { id: 'csv', extensions: ['.csv'] },
] as const

export type FormatGroupId = (typeof FORMAT_GROUPS)[number]['id']

/** `<input accept>` value covering every extension anydoc can name. */
export const DOCUMENT_ACCEPT = FORMAT_GROUPS.flatMap((group) => group.extensions).join(',')

/** `anydoc_wasm_bg.wasm` byte length from the committed SHA256SUMS build. */
export const ANYDOC_WASM_BYTES = 6_985_584

export const ANYDOC_JS_FILE = 'anydoc_wasm.js'
export const ANYDOC_WASM_FILE = 'anydoc_wasm_bg.wasm'

const EXTENSION_FORMAT: Record<string, AnydocFormat> = {
  doc: 'doc',
  docx: 'docx',
  docm: 'docx',
  odt: 'odt',
  pdf: 'pdf',
  ppt: 'ppt',
  pps: 'ppt',
  pot: 'ppt',
  pptx: 'pptx',
  pptm: 'pptx',
  ppsx: 'pptx',
  ppsm: 'pptx',
  rtf: 'rtf',
  epub: 'epub',
  xls: 'xlsx',
  xlsx: 'xlsx',
  xlsm: 'xlsx',
  xlsb: 'xlsx',
  ods: 'ods',
  odp: 'odp',
  csv: 'csv',
}

/** Mebibytes, two decimals, for the first-download note. */
export function anydocEngineMib(bytes = ANYDOC_WASM_BYTES): string {
  return (bytes / (1024 * 1024)).toFixed(2)
}

/** Bare extension, lowercased. A leading-dot name such as `.csv` has none, matching Rust `Path::extension`. */
export function fileExtension(filename: string): string {
  const base = filename.split(/[/\\]/).pop() ?? ''
  const dot = base.lastIndexOf('.')
  if (dot <= 0) return ''
  return base.slice(dot + 1).toLowerCase()
}

export function isCsvFilename(filename: string): boolean {
  return fileExtension(filename) === 'csv'
}

/** Same mapping as anydoc `formatFromExtension` / `formatFromPath`. */
export function formatFromFilename(filename: string): AnydocFormat | undefined {
  return EXTENSION_FORMAT[fileExtension(filename)]
}

/**
 * CSV has no magic bytes, so a `.csv` name always becomes `'csv'` and ignores `formatFromBytes`.
 * Every other file prefers the byte signature, then the filename.
 */
export function selectAnydocFormat(
  filename: string,
  detected: AnydocFormat | undefined,
  fromPath: AnydocFormat | undefined,
): AnydocFormat | undefined {
  if (isCsvFilename(filename)) return 'csv'
  return detected ?? fromPath
}

export function isAnydocFormat(value: unknown): value is AnydocFormat {
  return typeof value === 'string' && (ANYDOC_FORMATS as readonly string[]).includes(value)
}

export function mapConvertError(error: unknown): ConvertFailure {
  const record = error && typeof error === 'object' ? (error as { code?: unknown; message?: unknown; pages?: unknown; pageCount?: unknown }) : null
  const code = record && (CONVERT_ERROR_CODES as readonly string[]).includes(String(record.code)) ? (record.code as ConvertErrorCode) : 'engine'
  const message = error instanceof Error ? error.message : typeof record?.message === 'string' ? record.message : String(error ?? 'engine')
  if (code !== 'needsOcr') return { code, message }
  const pages = Array.isArray(record?.pages) ? record.pages.filter((page): page is number => typeof page === 'number') : undefined
  const pageCount = typeof record?.pageCount === 'number' ? record.pageCount : undefined
  return { code, message, pages, pageCount }
}

export function markdownDownloadName(filename: string): string {
  const base = (filename.split(/[/\\]/).pop() ?? '').trim().replace(/\.+$/, '')
  const stem = base.replace(/\.[^.]+$/, '').trim()
  const safe = (stem || 'document').replace(/[\\/:*?"<>|]/g, '_')
  return `${safe}.md`
}

export function conversionStats(markdown: string, elapsedMs: number): { characters: number; lines: number; elapsedMs: number } {
  return {
    characters: Array.from(markdown).length,
    lines: markdown.length === 0 ? 0 : markdown.split(/\r\n|\n|\r/).length,
    elapsedMs: Math.max(0, Math.round(elapsedMs)),
  }
}

/**
 * Absolute same-origin URLs for the glue and the wasm.
 * `pageHref` must be the document URL. A relative `BASE_URL` (`./`) resolved against a
 * Worker script under `assets/` would point at the wrong directory.
 */
export function anydocAssetUrls(baseUrl: string, pageHref: string): { jsUrl: string; wasmUrl: string } {
  const base = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`
  const root = new URL(base, pageHref)
  return {
    jsUrl: new URL(`offline/anydoc/${ANYDOC_JS_FILE}`, root).href,
    wasmUrl: new URL(`offline/anydoc/${ANYDOC_WASM_FILE}`, root).href,
  }
}
