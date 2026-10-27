import { loadPdfLib } from '@/lib/pdf'
import { PAGE_SIZES, type PageSizeName } from '@/lib/rasterPdf'

export interface PdfImage {
  bytes: Uint8Array
  type: 'png' | 'jpg'
  /** pixel size */
  width: number
  height: number
}
export interface ImagePdfOptions {
  page: 'fit' | PageSizeName
  orientation: 'auto' | 'portrait' | 'landscape'
  margin: number
}

/** Contain-fit an image into a box, centred. */
export function placeImage(iw: number, ih: number, W: number, H: number, margin: number) {
  const s = Math.min((W - 2 * margin) / iw, (H - 2 * margin) / ih)
  const w = iw * s
  const h = ih * s
  return { x: (W - w) / 2, y: (H - h) / 2, width: w, height: h }
}

export function pageFor(img: { width: number; height: number }, o: ImagePdfOptions): [number, number] {
  if (o.page === 'fit') return [img.width * 0.75 + 2 * o.margin, img.height * 0.75 + 2 * o.margin]
  const [a, b] = PAGE_SIZES[o.page]
  const land = o.orientation === 'landscape' || (o.orientation === 'auto' && img.width > img.height)
  return land ? [b, a] : [a, b]
}

export async function imagesToPdf(images: PdfImage[], o: ImagePdfOptions): Promise<Uint8Array> {
  if (!images.length) throw new Error('No images')
  const { PDFDocument } = await loadPdfLib()
  const doc = await PDFDocument.create()
  for (const im of images) {
    const emb = im.type === 'png' ? await doc.embedPng(im.bytes) : await doc.embedJpg(im.bytes)
    const [W, H] = pageFor(im, o)
    doc.addPage([W, H]).drawImage(emb, placeImage(im.width, im.height, W, H, o.margin))
  }
  return doc.save()
}
