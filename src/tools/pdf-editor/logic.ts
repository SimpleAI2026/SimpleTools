import { loadPdfLib } from '@/lib/pdf'
import { canEncode, embedTextImage, hexToRgb01, type TextRasterizer } from '@/lib/pdfDraw'

/** Positions are in unrotated page units (pt) with a top-left origin relative to the crop box. */
interface Base {
  page: number
  x: number
  y: number
}
export type Edit =
  | (Base & { type: 'text'; text: string; size: number; color: string; bold?: boolean })
  | (Base & { type: 'rect'; w: number; h: number; color: string; fill: boolean; opacity: number; stroke: number })
  | (Base & { type: 'image'; w: number; h: number; bytes: Uint8Array; imgType: 'png' | 'jpg' })

/** Convert a top-left box to pdf-lib bottom-left coordinates. */
export function toPdfBox(crop: { x: number; y: number; height: number }, x: number, y: number, h: number) {
  return { x: crop.x + x, y: crop.y + crop.height - y - h }
}

export async function applyEdits(bytes: Uint8Array, edits: Edit[], rasterize?: TextRasterizer): Promise<Uint8Array> {
  const { PDFDocument, StandardFonts, rgb } = await loadPdfLib()
  const doc = await PDFDocument.load(bytes)
  const regular = await doc.embedFont(StandardFonts.Helvetica)
  const bold = await doc.embedFont(StandardFonts.HelveticaBold)
  const pages = doc.getPages()
  for (const e of edits) {
    const page = pages[e.page - 1]
    if (!page) continue
    const crop = page.getCropBox()
    if (e.type === 'rect') {
      const p = toPdfBox(crop, e.x, e.y, e.h)
      const [r, g, b] = hexToRgb01(e.color)
      page.drawRectangle({ ...p, width: e.w, height: e.h, opacity: e.opacity, borderOpacity: e.opacity, ...(e.fill ? { color: rgb(r, g, b) } : { borderColor: rgb(r, g, b), borderWidth: e.stroke }) })
    } else if (e.type === 'image') {
      const img = e.imgType === 'png' ? await doc.embedPng(e.bytes) : await doc.embedJpg(e.bytes)
      page.drawImage(img, { ...toPdfBox(crop, e.x, e.y, e.h), width: e.w, height: e.h })
    } else {
      const font = e.bold ? bold : regular
      const lines = e.text.split('\n')
      const lh = e.size * 1.25
      if (lines.every((l) => canEncode(font, l))) {
        const [r, g, b] = hexToRgb01(e.color)
        lines.forEach((l, i) => page.drawText(l, { ...toPdfBox(crop, e.x, e.y + i * lh, e.size), size: e.size, font, color: rgb(r, g, b) }))
      } else {
        if (!rasterize) throw new Error('Text contains characters the standard font cannot encode')
        const t = await embedTextImage(doc, rasterize, e.text, e.size, e.color, e.bold)
        page.drawImage(t.image, { ...toPdfBox(crop, e.x, e.y, t.height), width: t.width, height: t.height })
      }
    }
  }
  return doc.save()
}
