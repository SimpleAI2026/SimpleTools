import { hexToRgb01 } from '@/lib/pdfDraw'
import { loadPdfLib, parsePageRanges } from '@/lib/pdf'

export type Position = 'bottom-center' | 'bottom-right' | 'bottom-left' | 'top-center' | 'top-right' | 'top-left'
export interface PageNumberOptions {
  format: string // tokens {n} {total}
  position: Position
  fontSize: number
  margin: number
  start: number
  pages: string // range spec
  color: string
  skipFirst: boolean
}

export function formatLabel(format: string, n: number, total: number): string {
  return format.replace(/\{n\}/g, String(n)).replace(/\{total\}/g, String(total))
}

export function labelPosition(pos: Position, pageW: number, pageH: number, textW: number, size: number, margin: number): { x: number; y: number } {
  const [v, h] = pos.split('-') as ['top' | 'bottom', 'left' | 'center' | 'right']
  const x = h === 'left' ? margin : h === 'right' ? pageW - margin - textW : (pageW - textW) / 2
  const y = v === 'bottom' ? margin : pageH - margin - size
  return { x, y }
}

export async function addPageNumbers(bytes: Uint8Array, o: PageNumberOptions): Promise<Uint8Array> {
  const { PDFDocument, StandardFonts, rgb } = await loadPdfLib()
  const doc = await PDFDocument.load(bytes)
  const font = await doc.embedFont(StandardFonts.Helvetica)
  const pages = doc.getPages()
  const targets = parsePageRanges(o.pages, pages.length).filter((p) => !(o.skipFirst && p === 1))
  const total = targets.length + o.start - 1
  const [r, g, b] = hexToRgb01(o.color)
  targets.forEach((pn, i) => {
    const page = pages[pn - 1]!
    const label = formatLabel(o.format, o.start + i, total)
    const w = font.widthOfTextAtSize(label, o.fontSize)
    const { width, height } = page.getSize()
    const { x, y } = labelPosition(o.position, width, height, w, o.fontSize, o.margin)
    page.drawText(label, { x, y, size: o.fontSize, font, color: rgb(r, g, b) })
  })
  return doc.save()
}
