import { offlineUrl } from '@/lib/offlineAssets'
import { extFor, isBinaryFormat, isPdfFormat } from './logic'

type ConvertFn = (
  options: Record<string, unknown>,
  stdin: string | null,
  files: Record<string, string | Blob>,
) => Promise<{ stdout: string; stderr: string; files: Record<string, string | Blob>; mediaFiles?: Record<string, Blob> }>

type QueryFn = (options: Record<string, unknown>) => Promise<unknown>

let convertFn: ConvertFn | null = null
let queryFn: QueryFn | null = null

async function loadInstance() {
  if (convertFn && queryFn) return
  const [{ createPandocInstance }, res] = await Promise.all([
    import('pandoc-wasm-core') as Promise<{
      createPandocInstance: (wasm: ArrayBuffer) => Promise<{ convert: ConvertFn; query: QueryFn }>
    }>,
    fetch(offlineUrl('pandoc', 'pandoc.wasm')),
  ])
  if (!res.ok) throw new Error(`Failed to fetch pandoc.wasm (${res.status})`)
  const instance = await createPandocInstance(await res.arrayBuffer())
  convertFn = instance.convert.bind(instance)
  queryFn = instance.query.bind(instance)
}

export async function loadPandocConvert(): Promise<ConvertFn> {
  await loadInstance()
  return convertFn!
}

export async function queryPandoc(options: Record<string, unknown>): Promise<unknown> {
  await loadInstance()
  return queryFn!(options)
}

export async function listPandocFormats(): Promise<{ input: string[]; output: string[] }> {
  const [input, output] = await Promise.all([
    queryPandoc({ query: 'input-formats' }),
    queryPandoc({ query: 'output-formats' }),
  ])
  const asList = (v: unknown) => (Array.isArray(v) ? v.map(String) : typeof v === 'string' ? v.split(/[\s,]+/).filter(Boolean) : [])
  return { input: asList(input), output: asList(output).filter((f) => !isPdfFormat(f)) }
}

export async function listHighlightStyles(): Promise<string[]> {
  const v = await queryPandoc({ query: 'highlight-styles' })
  return Array.isArray(v) ? v.map(String) : []
}

export async function runPandoc(opts: {
  from: string
  to: string
  text?: string
  files?: File[]
  standalone?: boolean
  toc?: boolean
  numberSections?: boolean
  template?: string
  css?: string
  bibliography?: File | null
  csl?: File | null
  citeproc?: boolean
  highlightStyle?: string
  extractMedia?: boolean
  embedResources?: boolean
  luaFilter?: File | null
  fromExtensions?: string
  toExtensions?: string
}): Promise<{ blob: Blob; text?: string; filename: string; warnings: string; media?: { name: string; blob: Blob }[] }> {
  if (isPdfFormat(opts.to)) throw new Error('PDF output is disabled for WASM Pandoc')
  const convert = await loadPandocConvert()
  const outName = `output.${extFor(opts.to)}`
  const options: Record<string, unknown> = { from: opts.from, to: opts.to }
  if (opts.fromExtensions) options.from = `${opts.from}${opts.fromExtensions.startsWith('+') || opts.fromExtensions.startsWith('-') ? opts.fromExtensions : '+' + opts.fromExtensions}`
  if (opts.toExtensions) options.to = `${opts.to}${opts.toExtensions.startsWith('+') || opts.toExtensions.startsWith('-') ? opts.toExtensions : '+' + opts.toExtensions}`
  if (opts.standalone || opts.to === 'html') options.standalone = !!opts.standalone
  if (opts.toc) options.toc = true
  if (opts.numberSections) options['number-sections'] = true
  if (opts.citeproc) options.citeproc = true
  if (opts.highlightStyle) options['highlight-style'] = opts.highlightStyle
  if (opts.embedResources) options['embed-resources'] = true
  if (opts.extractMedia) options['extract-media'] = 'media'
  if (isBinaryFormat(opts.to) || opts.to === 'html' || opts.to === 'epub') options['output-file'] = outName

  const files: Record<string, string | Blob> = {}
  if (opts.template) {
    files['template.tpl'] = opts.template
    options.template = 'template.tpl'
  }
  if (opts.css) {
    files['style.css'] = opts.css
    options.css = ['style.css']
  }
  if (opts.bibliography) {
    files[opts.bibliography.name || 'refs.bib'] = opts.bibliography
    options.bibliography = [opts.bibliography.name || 'refs.bib']
  }
  if (opts.csl) {
    files[opts.csl.name || 'style.csl'] = opts.csl
    options.csl = opts.csl.name || 'style.csl'
  }
  if (opts.luaFilter) {
    files[opts.luaFilter.name || 'filter.lua'] = opts.luaFilter
    options.lua = true
    // pandoc defaults use filters: - type: lua path: ...
    options.filters = [{ type: 'lua', path: opts.luaFilter.name || 'filter.lua' }]
  }

  let stdin: string | null = null
  const inputs = opts.files?.filter(Boolean) ?? []
  if (inputs.length) {
    const names: string[] = []
    for (const f of inputs) {
      const n = f.name || `input.${opts.from}`
      files[n] = f
      names.push(n)
    }
    options['input-files'] = names
  } else {
    stdin = opts.text ?? ''
  }

  const result = await convert(options, stdin, files)
  const warnings = result.stderr || ''
  const fromFiles = result.files[outName]
  const base = inputs[0]?.name?.replace(/\.[^.]+$/, '') || 'document'
  const filename = `${base}.${extFor(opts.to)}`
  const textMime = opts.to === 'html' ? 'text/html;charset=utf-8' : 'text/plain;charset=utf-8'
  const media = result.mediaFiles
    ? Object.entries(result.mediaFiles).map(([name, blob]) => ({ name, blob: blob instanceof Blob ? blob : new Blob([blob]) }))
    : undefined

  if (fromFiles instanceof Blob) return { blob: fromFiles, filename, warnings, media }
  if (typeof fromFiles === 'string') return { blob: new Blob([fromFiles], { type: textMime }), text: fromFiles, filename, warnings, media }
  const text = result.stdout ?? ''
  return { blob: new Blob([text], { type: textMime }), text, filename, warnings, media }
}
