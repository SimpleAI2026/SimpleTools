import { loadPdfLib, parsePageRanges } from '@/lib/pdf'

export interface Margins {
  top: number
  right: number
  bottom: number
  left: number
}
export const MM = 72 / 25.4

/** Set the visible area (CropBox, optionally MediaBox too) by trimming margins, in points. */
export async function cropPdf(bytes: Uint8Array, m: Margins, pages: string, alsoMediaBox: boolean): Promise<Uint8Array> {
  const { PDFDocument } = await loadPdfLib()
  const doc = await PDFDocument.load(bytes)
  const all = doc.getPages()
  for (const n of parsePageRanges(pages, all.length)) {
    const p = all[n - 1]!
    const box = p.getCropBox()
    const w = box.width - m.left - m.right
    const h = box.height - m.top - m.bottom
    if (w <= 1 || h <= 1) throw new Error(`Margins are larger than page ${n}`)
    p.setCropBox(box.x + m.left, box.y + m.bottom, w, h)
    if (alsoMediaBox) p.setMediaBox(box.x + m.left, box.y + m.bottom, w, h)
  }
  return doc.save()
}
