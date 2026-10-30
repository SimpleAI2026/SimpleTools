export const FALLBACK_FORMATS = [
  { id: 'markdown', ext: 'md', label: 'Markdown' },
  { id: 'html', ext: 'html', label: 'HTML' },
  { id: 'docx', ext: 'docx', label: 'DOCX' },
  { id: 'odt', ext: 'odt', label: 'ODT' },
  { id: 'epub', ext: 'epub', label: 'EPUB' },
  { id: 'rst', ext: 'rst', label: 'reStructuredText' },
  { id: 'latex', ext: 'tex', label: 'LaTeX' },
  { id: 'plain', ext: 'txt', label: 'Plain text' },
  { id: 'asciidoc', ext: 'adoc', label: 'AsciiDoc' },
  { id: 'org', ext: 'org', label: 'Org' },
  { id: 'rtf', ext: 'rtf', label: 'RTF' },
  { id: 'twiki', ext: 'twiki', label: 'TWiki' },
  { id: 'mediawiki', ext: 'mediawiki', label: 'MediaWiki' },
] as const

export type PandocFormatId = string

export function extFor(id: string): string {
  const known: Record<string, string> = {
    markdown: 'md', html: 'html', docx: 'docx', odt: 'odt', epub: 'epub', rst: 'rst',
    latex: 'tex', plain: 'txt', asciidoc: 'adoc', org: 'org', rtf: 'rtf', pdf: 'pdf',
  }
  return known[id] ?? id.replace(/[^a-z0-9]+/gi, '_')
}

export function guessFormat(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() ?? ''
  const map: Record<string, string> = {
    md: 'markdown', markdown: 'markdown', html: 'html', htm: 'html', docx: 'docx', odt: 'odt',
    epub: 'epub', rst: 'rst', tex: 'latex', latex: 'latex', txt: 'plain', adoc: 'asciidoc',
    asciidoc: 'asciidoc', org: 'org', rtf: 'rtf', bib: 'biblatex', csl: 'csl',
  }
  return map[ext] ?? 'markdown'
}

export function isBinaryFormat(id: string): boolean {
  return ['docx', 'odt', 'epub', 'pdf', 'pptx', 'xlsx'].includes(id)
}

export function isPdfFormat(id: string): boolean {
  return id === 'pdf' || id.startsWith('pdf')
}

export function outputFileName(inputName: string, to: string): string {
  const base = inputName.replace(/\.[^.]+$/, '') || 'document'
  return `${base}.${extFor(to)}`
}

export const SAMPLE_MARKDOWN = `# Pandoc WASM demo

Convert **Markdown** with citations [@smith2020] and options.

## Features

- TOC / numbered sections
- Bibliography + CSL
- Extract media

> WASM Pandoc typically **cannot emit PDF**.
`

export const SAMPLE_BIB = `@article{smith2020,
  author = {Smith, Jane},
  title = {Example Paper},
  journal = {Journal of Demos},
  year = {2020}
}
`
