import { closePdf, loadPdfLib, openPdf, pdfBlob, renderPage } from '@/lib/pdf'

export type PdfCompressMode = 'lossless' | 'raster'
export interface PdfCompressOptions {
  mode: PdfCompressMode
  dpi: number
  quality: number // 0..1 JPEG quality (raster mode)
  grayscale: boolean
  stripMetadata: boolean
}

export const PRESETS = {
  light: { dpi: 150, quality: 0.8 },
  balanced: { dpi: 110, quality: 0.65 },
  strong: { dpi: 72, quality: 0.5 },
} as const

/** Lossless: re-save with object streams and (optionally) without metadata. Text stays selectable. */
export async function compressLossless(bytes: Uint8Array, stripMetadata: boolean): Promise<Uint8Array> {
  const { PDFDocument, PDFName } = await loadPdfLib()
  const doc = await PDFDocument.load(bytes, { updateMetadata: false })
  if (stripMetadata) {
    doc.setTitle('')
    doc.setAuthor('')
    doc.setSubject('')
    doc.setKeywords([])
    doc.setProducer('')
    doc.setCreator('')
    doc.catalog.delete(PDFName.of('Metadata'))
  }
  return doc.save({ useObjectStreams: true })
}

/** Raster: every page is rendered with pdf.js and re-embedded as a JPEG. Text is no longer selectable. */
export async function compressRaster(bytes: Uint8Array, o: PdfCompressOptions, onProgress?: (done: number, total: number) => void): Promise<Uint8Array> {
  const { PDFDocument } = await loadPdfLib()
  const src = await openPdf(bytes)
  const out = await PDFDocument.create()
  for (let i = 1; i <= src.numPages; i++) {
    const page = await src.getPage(i)
    const vp = page.getViewport({ scale: 1 })
    const canvas = await renderPage(src, i, o.dpi / 72)
    if (o.grayscale) {
      const ctx = canvas.getContext('2d')!
      const img = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const d = img.data
      for (let p = 0; p < d.length; p += 4) d[p] = d[p + 1] = d[p + 2] = 0.299 * d[p]! + 0.587 * d[p + 1]! + 0.114 * d[p + 2]!
      ctx.putImageData(img, 0, 0)
    }
    const jpg = await new Promise<Blob>((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error('encode'))), 'image/jpeg', o.quality))
    const embedded = await out.embedJpg(new Uint8Array(await jpg.arrayBuffer()))
    out.addPage([vp.width, vp.height]).drawImage(embedded, { x: 0, y: 0, width: vp.width, height: vp.height })
    onProgress?.(i, src.numPages)
  }
  await closePdf(src)
  return out.save({ useObjectStreams: true })
}

export async function compressPdf(file: Blob, o: PdfCompressOptions, onProgress?: (done: number, total: number) => void): Promise<Blob> {
  const bytes = new Uint8Array(await file.arrayBuffer())
  const out = o.mode === 'lossless' ? await compressLossless(bytes, o.stripMetadata) : await compressRaster(bytes, o, onProgress)
  return pdfBlob(out)
}
