import { loadPdfLib, parsePageRanges } from '@/lib/pdf'
import { sendLastContentToBack } from '@/lib/pdfDraw'

export interface OverlayOptions {
  mapping: 'first' | 'cycle'
  layer: 'foreground' | 'background'
  opacity: number
  fit: 'stretch' | 'contain' | 'none'
  pages: string
}

/** Stamp pages of `overlay` onto `base` (letterheads, stamps, forms). Base annotations/links are preserved. */
export async function overlayPdf(base: Uint8Array, overlay: Uint8Array, o: OverlayOptions): Promise<Uint8Array> {
  const { PDFDocument } = await loadPdfLib()
  const doc = await PDFDocument.load(base)
  const ov = await PDFDocument.load(overlay)
  const ovPages = ov.getPages().filter((p) => p.node.Contents())
  if (!ovPages.length) throw new Error('The overlay PDF has no content')
  const embedded = await doc.embedPages(o.mapping === 'first' ? [ovPages[0]!] : ovPages)
  const pages = doc.getPages()
  for (const [i, n] of parsePageRanges(o.pages, pages.length).entries()) {
    const page = pages[n - 1]!
    const ep = embedded[o.mapping === 'first' ? 0 : i % embedded.length]!
    const { width: W, height: H } = page.getSize()
    let xs = 1
    let ys = 1
    if (o.fit === 'stretch') {
      xs = W / ep.width
      ys = H / ep.height
    } else if (o.fit === 'contain') xs = ys = Math.min(W / ep.width, H / ep.height)
    page.drawPage(ep, { x: (W - ep.width * xs) / 2, y: (H - ep.height * ys) / 2, xScale: xs, yScale: ys, opacity: o.opacity })
    if (o.layer === 'background') await sendLastContentToBack(page)
  }
  return doc.save()
}
