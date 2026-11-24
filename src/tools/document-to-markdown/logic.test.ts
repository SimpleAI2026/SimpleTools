import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { loadAnydocUrls } from './loader'
import {
  ANYDOC_WASM_BYTES,
  CONVERT_ERROR_CODES,
  DOCUMENT_ACCEPT,
  FORMAT_GROUPS,
  anydocAssetUrls,
  anydocEngineMib,
  conversionStats,
  fileExtension,
  formatFromFilename,
  isCsvFilename,
  mapConvertError,
  markdownDownloadName,
  selectAnydocFormat,
} from './logic'

const fixture = (path: string) => readFileSync(new URL(`../../../vendor/anydoc/tests/fixtures/${path}`, import.meta.url))

describe('document-to-markdown formats', () => {
  it('lists eight groups and an accept string for every extension', () => {
    expect(FORMAT_GROUPS).toHaveLength(8)
    expect(DOCUMENT_ACCEPT.split(',')).toEqual([
      '.doc', '.docx', '.docm',
      '.ppt', '.pps', '.pot', '.pptx', '.pptm', '.ppsx', '.ppsm',
      '.xls', '.xlsx', '.xlsm', '.xlsb',
      '.odt', '.ods', '.odp',
      '.rtf', '.epub', '.pdf', '.csv',
    ])
  })

  it('maps container variants onto the wasm format strings', () => {
    expect(formatFromFilename('memo.doc')).toBe('doc')
    expect(formatFromFilename('memo.docx')).toBe('docx')
    expect(formatFromFilename('memo.DOCM')).toBe('docx')
    expect(formatFromFilename('deck.ppt')).toBe('ppt')
    expect(formatFromFilename('deck.pps')).toBe('ppt')
    expect(formatFromFilename('deck.pot')).toBe('ppt')
    expect(formatFromFilename('deck.pptx')).toBe('pptx')
    expect(formatFromFilename('deck.pptm')).toBe('pptx')
    expect(formatFromFilename('deck.ppsx')).toBe('pptx')
    expect(formatFromFilename('deck.ppsm')).toBe('pptx')
    expect(formatFromFilename('sheet.xls')).toBe('xlsx')
    expect(formatFromFilename('sheet.xlsx')).toBe('xlsx')
    expect(formatFromFilename('sheet.xlsm')).toBe('xlsx')
    expect(formatFromFilename('sheet.xlsb')).toBe('xlsx')
    expect(formatFromFilename('notes.odt')).toBe('odt')
    expect(formatFromFilename('notes.ods')).toBe('ods')
    expect(formatFromFilename('notes.odp')).toBe('odp')
    expect(formatFromFilename('notes.rtf')).toBe('rtf')
    expect(formatFromFilename('book.epub')).toBe('epub')
    expect(formatFromFilename('scan.pdf')).toBe('pdf')
    expect(formatFromFilename('folder/table.csv')).toBe('csv')
    expect(formatFromFilename('readme.txt')).toBeUndefined()
    expect(formatFromFilename('.csv')).toBeUndefined()
    expect(fileExtension('.csv')).toBe('')
  })

  it('forces csv from the suffix and does not trust byte detection', () => {
    expect(isCsvFilename('data.CSV')).toBe(true)
    expect(isCsvFilename('data.csv.xlsx')).toBe(false)
    expect(selectAnydocFormat('data.csv', undefined, undefined)).toBe('csv')
    expect(selectAnydocFormat('data.CSV', 'pdf', 'docx')).toBe('csv')
    expect(selectAnydocFormat('report.docx', 'docx', 'pdf')).toBe('docx')
    expect(selectAnydocFormat('report.docx', undefined, 'docx')).toBe('docx')
    expect(selectAnydocFormat('mystery.bin', undefined, undefined)).toBeUndefined()
    expect(selectAnydocFormat('legacy.xls', undefined, 'xlsx')).toBe('xlsx')
  })
})

describe('document-to-markdown errors and output', () => {
  it('maps every published error code and engine failures', () => {
    for (const code of CONVERT_ERROR_CODES) {
      expect(mapConvertError(Object.assign(new Error(`${code} detail`), { code })).code).toBe(code)
    }
    const ocr = mapConvertError(Object.assign(new Error('all 1 pages need OCR'), { code: 'needsOcr', pages: [1], pageCount: 1 }))
    expect(ocr).toEqual({ code: 'needsOcr', message: 'all 1 pages need OCR', pages: [1], pageCount: 1 })
    expect(mapConvertError(Object.assign(new Error('disk'), { code: 'io' })).code).toBe('engine')
    expect(mapConvertError(new Error('fetch failed')).code).toBe('engine')
    expect(mapConvertError('boom')).toEqual({ code: 'engine', message: 'boom' })
  })

  it('derives a markdown filename and stats', () => {
    expect(markdownDownloadName('Quarterly Report.docx')).toBe('Quarterly Report.md')
    expect(markdownDownloadName('a.b.csv')).toBe('a.b.md')
    expect(markdownDownloadName('noext')).toBe('noext.md')
    expect(markdownDownloadName('   ')).toBe('document.md')
    expect(markdownDownloadName('../../secret.docx')).toBe('secret.md')
    expect(markdownDownloadName('file.')).toBe('file.md')
    expect(conversionStats('', 1.2)).toEqual({ characters: 0, lines: 0, elapsedMs: 1 })
    expect(conversionStats('a\nb', 0)).toEqual({ characters: 3, lines: 2, elapsedMs: 0 })
    expect(conversionStats('你', -5).characters).toBe(1)
    expect(anydocEngineMib(ANYDOC_WASM_BYTES)).toBe('6.66')
  })

  it('resolves web and extension asset URLs from the page, not a worker script', () => {
    expect(anydocAssetUrls('/', 'https://tools.example/tools/document-to-markdown')).toEqual({
      jsUrl: 'https://tools.example/offline/anydoc/anydoc_wasm.js',
      wasmUrl: 'https://tools.example/offline/anydoc/anydoc_wasm_bg.wasm',
    })
    expect(anydocAssetUrls('./', 'https://tools.example/index.html')).toEqual({
      jsUrl: 'https://tools.example/offline/anydoc/anydoc_wasm.js',
      wasmUrl: 'https://tools.example/offline/anydoc/anydoc_wasm_bg.wasm',
    })
    expect(anydocAssetUrls('./', 'chrome-extension://abcdefgh/index.html')).toEqual({
      jsUrl: 'chrome-extension://abcdefgh/offline/anydoc/anydoc_wasm.js',
      wasmUrl: 'chrome-extension://abcdefgh/offline/anydoc/anydoc_wasm_bg.wasm',
    })
    expect(anydocAssetUrls('/', 'http://127.0.0.1:4173/assets/worker-abc.js').wasmUrl).toBe(
      'http://127.0.0.1:4173/offline/anydoc/anydoc_wasm_bg.wasm',
    )
    const nested = anydocAssetUrls('./', 'chrome-extension://abcdefgh/assets/worker.js')
    expect(nested.jsUrl).toBe('chrome-extension://abcdefgh/assets/offline/anydoc/anydoc_wasm.js')
    expect(loadAnydocUrls('chrome-extension://abcdefgh/index.html').wasmUrl).toBe(
      'chrome-extension://abcdefgh/offline/anydoc/anydoc_wasm_bg.wasm',
    )
  })
})

describe('document-to-markdown wasm', () => {
  it('converts csv without a magic number and rejects a scanned pdf', async () => {
    const wasm = readFileSync(new URL('../../../public/offline/anydoc/anydoc_wasm_bg.wasm', import.meta.url))
    const mod = await import('../../../public/offline/anydoc/anydoc_wasm.js')
    await mod.default({ module_or_path: wasm })
    const csvName = 'sheet.csv'
    expect(mod.formatFromBytes(fixture('csv/sheet.csv'))).toBeUndefined()
    const format = selectAnydocFormat(csvName, mod.formatFromBytes(fixture('csv/sheet.csv')), mod.formatFromExtension('csv'))
    expect(format).toBe('csv')
    const csvMarkdown = mod.toMarkdownBytes(fixture('csv/sheet.csv'), format)
    expect(csvMarkdown).toContain('Percent')
    expect(csvMarkdown).toContain('ides of March')
    const rtf = mod.toMarkdownBytes(fixture('rtf/text.rtf'), mod.formatFromBytes(fixture('rtf/text.rtf')))
    expect(rtf).toContain('Fixture Document')
    expect(rtf).toContain('bold')
    let scanned: unknown
    try {
      mod.toMarkdownBytes(fixture('pdf/handmade-scanned.pdf'), 'pdf')
    } catch (error) {
      scanned = error
    }
    expect(mapConvertError(scanned)).toMatchObject({ code: 'needsOcr', pages: [1, 2], pageCount: 2 })
    const textPdf = mod.toMarkdownBytes(fixture('pdf/text.pdf'), 'pdf')
    expect(textPdf.trim().length).toBeGreaterThan(0)
  })
})
