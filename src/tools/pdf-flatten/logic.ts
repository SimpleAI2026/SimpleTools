import { loadPdfLib, openPdf, closePdf, renderPage } from '@/lib/pdf'
import { canvasesToPdf } from '@/lib/rasterPdf'

/** Flatten interactive form fields into static page content (text stays selectable). */
export async function flattenForms(bytes: Uint8Array): Promise<{ bytes: Uint8Array; fields: number }> {
  const { PDFDocument } = await loadPdfLib()
  const doc = await PDFDocument.load(bytes)
  const form = doc.getForm()
  const fields = form.getFields().length
  if (fields) {
    try {
      form.updateFieldAppearances()
    } catch {
      /* fields without fonts keep their existing appearance */
    }
    form.flatten()
  }
  return { bytes: await doc.save(), fields }
}

/** Fully flatten: render every page (incl. annotations and forms) to an image. Text is no longer selectable. */
export async function flattenRaster(bytes: Uint8Array, dpi: number, onProgress?: (d: number, t: number) => void): Promise<Uint8Array> {
  const src = await openPdf(bytes)
  const pages = []
  for (let i = 1; i <= src.numPages; i++) {
    const vp = (await src.getPage(i)).getViewport({ scale: 1 })
    pages.push({ canvas: await renderPage(src, i, dpi / 72), widthPt: vp.width, heightPt: vp.height })
    onProgress?.(i, src.numPages)
  }
  await closePdf(src)
  return canvasesToPdf(pages, 'jpeg', 0.9)
}
