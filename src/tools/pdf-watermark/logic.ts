import type { PDFImage, PDFPage } from '@cantoo/pdf-lib'
import { loadPdfLib, parsePageRanges } from '@/lib/pdf'
import { canEncode, embedTextImage, hexToRgb01, sendLastContentToBack, type TextRasterizer } from '@/lib/pdfDraw'

export interface WatermarkOptions {
  kind: 'text' | 'image'
  text: string
  image?: { bytes: Uint8Array; type: 'png' | 'jpg' }
  fontSize: number
  color: string
  opacity: number
  rotation: number // degrees
  layout: 'center' | 'tile'
  /** tile gap in pt */
  gap: number
  /** image scale relative to page width (0..1) */
  imageScale: number
  layer: 'foreground' | 'background'
  pages: string
}

/** Grid of centres covering the page for tiled watermarks. */
export function tilePositions(W: number, H: number, w: number, h: number, gap: number): [number, number][] {
  const sx = w + gap
  const sy = h + gap
  const out: [number, number][] = []
  for (let y = -sy; y < H + sy; y += sy) for (let x = -sx; x < W + sx; x += sx) out.push([x + sx / 2, y + sy / 2])
  return out
}

/** Bottom-left origin for an item of size w×h rotated by `deg` around its centre (cx, cy). */
export function rotatedOrigin(cx: number, cy: number, w: number, h: number, deg: number): { x: number; y: number } {
  const r = (deg * Math.PI) / 180
  return { x: cx - (w / 2) * Math.cos(r) + (h / 2) * Math.sin(r), y: cy - (w / 2) * Math.sin(r) - (h / 2) * Math.cos(r) }
}

export async function watermarkPdf(bytes: Uint8Array, o: WatermarkOptions, rasterize?: TextRasterizer): Promise<Uint8Array> {
  const { PDFDocument, StandardFonts, rgb, degrees } = await loadPdfLib()
  const doc = await PDFDocument.load(bytes)
  const font = await doc.embedFont(StandardFonts.HelveticaBold)
  const [r, g, b] = hexToRgb01(o.color)
  let image: PDFImage | null = null
  let iw = 0
  let ih = 0
  const useImageText = o.kind === 'text' && !canEncode(font, o.text)
  if (o.kind === 'image') {
    if (!o.image) throw new Error('Choose an image')
    image = o.image.type === 'png' ? await doc.embedPng(o.image.bytes) : await doc.embedJpg(o.image.bytes)
  } else if (useImageText) {
    if (!rasterize) throw new Error('Text contains characters the standard font cannot encode')
    const t = await embedTextImage(doc, rasterize, o.text, o.fontSize, o.color, true)
    ;({ image } = t)
    iw = t.width
    ih = t.height
  }
  const pages = doc.getPages()
  for (const n of parsePageRanges(o.pages, pages.length)) {
    const page: PDFPage = pages[n - 1]!
    const { width: W, height: H } = page.getSize()
    let w: number
    let h: number
    if (o.kind === 'image' && image) {
      w = W * o.imageScale
      h = (w * image.height) / image.width
    } else if (image) {
      w = iw
      h = ih
    } else {
      w = font.widthOfTextAtSize(o.text, o.fontSize)
      h = font.heightAtSize(o.fontSize, { descender: false })
    }
    const centres = o.layout === 'tile' ? tilePositions(W, H, w, h, o.gap) : [[W / 2, H / 2] as [number, number]]
    for (const [cx, cy] of centres) {
      const { x, y } = rotatedOrigin(cx, cy, w, h, o.rotation)
      if (image) page.drawImage(image, { x, y, width: w, height: h, rotate: degrees(o.rotation), opacity: o.opacity })
      else page.drawText(o.text, { x, y, size: o.fontSize, font, color: rgb(r, g, b), rotate: degrees(o.rotation), opacity: o.opacity })
    }
    if (o.layer === 'background') await sendLastContentToBack(page)
  }
  return doc.save()
}
