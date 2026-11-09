import type { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist'
import { loadPdfLib, renderPage } from './pdf'

/** Rectangle in page *viewport* units (scale 1, page rotation applied, top-left origin). */
export interface RedactRect {
  page: number
  x: number
  y: number
  w: number
  h: number
}

export interface RasterizedPage {
  bytes: Uint8Array
  type: 'png' | 'jpg'
  widthPt: number
  heightPt: number
}

/** Produces a flattened image of page `n` with the given rects burned in. */
export type PageRasterizer = (n: number, rects: RedactRect[]) => Promise<RasterizedPage>

/**
 * True redaction: every page that has redaction rects is replaced by a flat image with the boxes burned in,
 * so no text, vector or image data from that page survives. Untouched pages are copied losslessly.
 * Document metadata is reset (it may contain sensitive data too).
 */
export async function redactPdf(bytes: Uint8Array, rects: RedactRect[], rasterize: PageRasterizer): Promise<Uint8Array> {
  const { PDFDocument } = await loadPdfLib()
  const src = await PDFDocument.load(bytes)
  const out = await PDFDocument.create()
  out.setProducer('SimpleTools')
  out.setCreator('SimpleTools')
  const byPage = new Map<number, RedactRect[]>()
  for (const r of rects) byPage.set(r.page, [...(byPage.get(r.page) ?? []), r])
  const n = src.getPageCount()
  for (let i = 1; i <= n; i++) {
    const rs = byPage.get(i)
    if (!rs?.length) {
      const [p] = await out.copyPages(src, [i - 1])
      out.addPage(p!)
      continue
    }
    const r = await rasterize(i, rs)
    const img = r.type === 'png' ? await out.embedPng(r.bytes) : await out.embedJpg(r.bytes)
    out.addPage([r.widthPt, r.heightPt]).drawImage(img, { x: 0, y: 0, width: r.widthPt, height: r.heightPt })
  }
  return out.save()
}

/** Browser rasterizer: render with pdf.js at `dpi`, then paint the boxes. */
export function canvasRedactor(doc: PDFDocumentProxy, dpi: number, color = '#000000', format: 'png' | 'jpg' = 'png'): PageRasterizer {
  return async (n, rects) => {
    const scale = dpi / 72
    const page = await doc.getPage(n)
    const vp = page.getViewport({ scale: 1 })
    const c = await renderPage(doc, n, scale)
    const ctx = c.getContext('2d')!
    ctx.fillStyle = color
    for (const r of rects) ctx.fillRect(Math.floor(r.x * scale), Math.floor(r.y * scale), Math.ceil(r.w * scale) + 1, Math.ceil(r.h * scale) + 1)
    const type = format === 'png' ? 'image/png' : 'image/jpeg'
    const blob = await new Promise<Blob>((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error('encode failed'))), type, 0.92))
    c.width = c.height = 0
    return { bytes: new Uint8Array(await blob.arrayBuffer()), type: format, widthPt: vp.width, heightPt: vp.height }
  }
}

export interface MatchOptions {
  regex: boolean
  caseSensitive: boolean
  wholeWord: boolean
  /** padding around each match, pt */
  padding: number
}

export function buildMatcher(terms: string[], o: MatchOptions): RegExp | null {
  const parts = terms.map((t) => t.trim()).filter(Boolean).map((t) => (o.regex ? t : t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
  if (!parts.length) return null
  const body = parts.map((p) => `(?:${p})`).join('|')
  return new RegExp(o.wholeWord ? `(?<![\\p{L}\\p{N}_])(?:${body})(?![\\p{L}\\p{N}_])` : body, `gu${o.caseSensitive ? '' : 'i'}`)
}

/** Apply a viewport transform matrix [a b c d e f] to a PDF-space point. */
export function toViewport(t: number[], x: number, y: number): [number, number] {
  return [t[0]! * x + t[2]! * y + t[4]!, t[1]! * x + t[3]! * y + t[5]!]
}

/** Find matches in one page's text items and return their boxes in viewport units (proportional glyph widths). */
export async function findMatchRects(page: PDFPageProxy, pageNum: number, re: RegExp, padding: number): Promise<(RedactRect & { text: string })[]> {
  const vp = page.getViewport({ scale: 1 })
  const tc = await page.getTextContent()
  const out: (RedactRect & { text: string })[] = []
  for (const it of tc.items) {
    if (!('str' in it) || !it.str) continue
    const [, b = 0, , d = 0, e = 0, f = 0] = it.transform as number[]
    const size = Math.hypot(b, d) || it.height || 10
    const len = it.str.length
    re.lastIndex = 0
    for (const m of it.str.matchAll(re)) {
      if (!m[0]) continue
      const x0 = e + (it.width * m.index) / len
      const x1 = e + (it.width * (m.index + m[0].length)) / len
      const [ax, ay] = toViewport(vp.transform, x0 - padding, f - size * 0.25 - padding)
      const [bx, by] = toViewport(vp.transform, x1 + padding, f + size * 0.95 + padding)
      out.push({ page: pageNum, x: Math.min(ax, bx), y: Math.min(ay, by), w: Math.abs(bx - ax), h: Math.abs(by - ay), text: m[0] })
    }
  }
  return out
}
