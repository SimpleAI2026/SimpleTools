import { canvasToBlob } from './canvas'
import { loadPdfLib } from './pdf'

export const PAGE_SIZES = { a4: [595.28, 841.89], letter: [612, 792], a3: [841.89, 1190.55], a5: [419.53, 595.28] } as const
export type PageSizeName = keyof typeof PAGE_SIZES

export function pageSize(name: PageSizeName, landscape: boolean): [number, number] {
  const [w, h] = PAGE_SIZES[name]
  return landscape ? [h, w] : [w, h]
}

export interface RasterPage {
  canvas: HTMLCanvasElement
  widthPt: number
  heightPt: number
}

/** Embed rendered canvases as full-page images into a new PDF. */
export async function canvasesToPdf(pages: RasterPage[], type: 'png' | 'jpeg' = 'png', quality = 0.92, title?: string): Promise<Uint8Array> {
  const { PDFDocument } = await loadPdfLib()
  const doc = await PDFDocument.create()
  if (title) doc.setTitle(title)
  for (const p of pages) {
    const bytes = new Uint8Array(await (await canvasToBlob(p.canvas, type === 'png' ? 'image/png' : 'image/jpeg', quality)).arrayBuffer())
    const img = type === 'png' ? await doc.embedPng(bytes) : await doc.embedJpg(bytes)
    doc.addPage([p.widthPt, p.heightPt]).drawImage(img, { x: 0, y: 0, width: p.widthPt, height: p.heightPt })
  }
  return doc.save()
}

/** Slice a tall canvas (e.g. a rendered HTML document) into page-sized canvases. */
export function sliceCanvas(src: HTMLCanvasElement, sliceHeightPx: number): HTMLCanvasElement[] {
  const out: HTMLCanvasElement[] = []
  for (let y = 0; y < src.height; y += sliceHeightPx) {
    const c = document.createElement('canvas')
    c.width = src.width
    c.height = sliceHeightPx
    const ctx = c.getContext('2d')!
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, c.width, c.height)
    ctx.drawImage(src, 0, y, src.width, Math.min(sliceHeightPx, src.height - y), 0, 0, src.width, Math.min(sliceHeightPx, src.height - y))
    out.push(c)
  }
  return out
}
