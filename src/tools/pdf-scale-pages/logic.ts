import { loadPdfLib } from '@/lib/pdf'
import { PAGE_SIZES, type PageSizeName } from '@/lib/rasterPdf'

export interface ScaleOptions {
  target: PageSizeName | 'custom'
  width: number // pt (custom)
  height: number
  orientation: 'auto' | 'portrait' | 'landscape'
  margin: number // pt
}

export function targetSize(o: ScaleOptions, srcW: number, srcH: number): [number, number] {
  let [w, h] = o.target === 'custom' ? [o.width, o.height] : [...PAGE_SIZES[o.target]]
  const landscape = o.orientation === 'landscape' || (o.orientation === 'auto' && srcW > srcH)
  if (landscape !== w > h) [w, h] = [h, w]
  return [w, h]
}

/** Scale factor and offset to fit (w×h) centred into (W×H) minus margin. */
export function fitInto(w: number, h: number, W: number, H: number, margin: number) {
  const s = Math.min((W - 2 * margin) / w, (H - 2 * margin) / h)
  return { scale: s, x: (W - w * s) / 2, y: (H - h * s) / 2 }
}

/** Re-create every page at the target size with the original content scaled to fit (vector, text preserved). */
export async function scalePages(bytes: Uint8Array, o: ScaleOptions): Promise<Uint8Array> {
  const { PDFDocument } = await loadPdfLib()
  const src = await PDFDocument.load(bytes)
  const out = await PDFDocument.create()
  for (const sp of src.getPages()) {
    const { width: sw, height: sh } = sp.getSize()
    const rot = sp.getRotation().angle % 180 !== 0
    const [W, H] = targetSize(o, rot ? sh : sw, rot ? sw : sh)
    const page = out.addPage([W, H])
    if (!sp.node.Contents()) continue // pages without content streams stay blank at the new size
    const ep = await out.embedPage(sp)
    const f = fitInto(ep.width, ep.height, W, H, o.margin)
    page.drawPage(ep, { x: f.x, y: f.y, xScale: f.scale, yScale: f.scale })
  }
  return out.save()
}
