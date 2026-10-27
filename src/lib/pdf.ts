import type { PDFDocumentProxy } from 'pdfjs-dist'

/** pdf-lib (maintained @cantoo fork: adds encryption/decryption); loaded on demand. */
export const loadPdfLib = () => import('@cantoo/pdf-lib')

let pdfjsPromise: Promise<typeof import('pdfjs-dist')> | null = null
/** pdf.js with its worker; loaded on demand and cached. */
export function loadPdfjs() {
  pdfjsPromise ??= (async () => {
    const [pdfjs, worker] = await Promise.all([import('pdfjs-dist'), import('pdfjs-dist/build/pdf.worker.min.mjs?url')])
    pdfjs.GlobalWorkerOptions.workerSrc = worker.default
    return pdfjs
  })()
  return pdfjsPromise
}

const ASSET_BASE = `${import.meta.env.BASE_URL}pdfjs/`

/** Open a PDF with pdf.js. The input is copied because pdf.js transfers the buffer to its worker. */
export async function openPdf(data: ArrayBuffer | Uint8Array, password?: string): Promise<PDFDocumentProxy> {
  const pdfjs = await loadPdfjs()
  const bytes = data instanceof Uint8Array ? data.slice() : new Uint8Array(data.slice(0))
  return pdfjs.getDocument({ data: bytes, password, cMapUrl: `${ASSET_BASE}cmaps/`, cMapPacked: true, standardFontDataUrl: `${ASSET_BASE}standard_fonts/` }).promise
}

/** Render page `n` (1-based) to a new canvas at `scale` (1 = 72 dpi). */
export async function renderPage(doc: PDFDocumentProxy, n: number, scale = 1.5, background = '#ffffff'): Promise<HTMLCanvasElement> {
  const page = await doc.getPage(n)
  const viewport = page.getViewport({ scale })
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.floor(viewport.width))
  canvas.height = Math.max(1, Math.floor(viewport.height))
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = background
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  await page.render({ canvas, canvasContext: ctx, viewport }).promise
  page.cleanup()
  return canvas
}

export interface TextItemLite {
  str: string
  hasEOL?: boolean
  transform: number[]
  width: number
  height: number
}

export async function pageTextItems(doc: PDFDocumentProxy, n: number): Promise<TextItemLite[]> {
  const page = await doc.getPage(n)
  const tc = await page.getTextContent()
  return tc.items.filter((i): i is TextItemLite & typeof i => 'str' in i) as TextItemLite[]
}

export async function pageText(doc: PDFDocumentProxy, n: number): Promise<string> {
  return joinTextItems(await pageTextItems(doc, n))
}

/** Join pdf.js text items, inserting line breaks on EOL markers or baseline changes. */
export function joinTextItems(items: TextItemLite[]): string {
  let out = ''
  let lastY: number | null = null
  for (const it of items) {
    const y = it.transform[5] ?? 0
    if (lastY !== null && Math.abs(y - lastY) > Math.max(2, (it.height || 10) * 0.5) && !out.endsWith('\n')) out += '\n'
    out += it.str
    if (it.hasEOL) out += '\n'
    lastY = y
  }
  return out.replace(/[ \t]+\n/g, '\n').trim()
}

export async function readFileBytes(f: Blob): Promise<Uint8Array> {
  return new Uint8Array(await f.arrayBuffer())
}

export function pdfBlob(bytes: Uint8Array): Blob {
  return new Blob([bytes as BlobPart], { type: 'application/pdf' })
}

/** Parse "1-3, 5, 8-" into sorted unique 1-based page numbers within [1, total]. */
export function parsePageRanges(spec: string, total: number): number[] {
  const set = new Set<number>()
  const s = spec.trim()
  if (!s) return Array.from({ length: total }, (_, i) => i + 1)
  for (const part of s.split(/[,，\s]+/).filter(Boolean)) {
    const m = /^(\d*)\s*-\s*(\d*)$/.exec(part)
    if (m) {
      const a = m[1] ? Number(m[1]) : 1
      const b = m[2] ? Number(m[2]) : total
      if (a > b) throw new Error(`Invalid range: ${part}`)
      for (let i = Math.max(1, a); i <= Math.min(total, b); i++) set.add(i)
    } else if (/^\d+$/.test(part)) {
      const n = Number(part)
      if (n < 1 || n > total) throw new Error(`Page ${n} is out of range (1–${total})`)
      set.add(n)
    } else throw new Error(`Invalid page spec: ${part}`)
  }
  return [...set].sort((a, b) => a - b)
}

/** Release a pdf.js document and its worker-side resources. */
export async function closePdf(doc: PDFDocumentProxy): Promise<void> {
  await doc.loadingTask.destroy()
}
