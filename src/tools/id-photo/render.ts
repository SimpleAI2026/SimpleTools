/** Canvas helpers for the ID photo tool (browser only). */
import { makeCanvas, canvasToBlob } from '@/lib/canvas'
import { rotatedSize, searchQuality, setJpegDpi, setPngDpi, type CropRect, type SheetLayout } from './logic'

export const MAX_SIDE = 2048

/** Decode a file into a canvas, downscaled so the long side is at most MAX_SIDE. */
export async function fileToCanvas(file: Blob): Promise<HTMLCanvasElement> {
  const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' })
  const s = Math.min(1, MAX_SIDE / Math.max(bmp.width, bmp.height))
  const [c, ctx] = makeCanvas(bmp.width * s, bmp.height * s)
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(bmp, 0, 0, c.width, c.height)
  bmp.close()
  return c
}

/** True when a meaningful share of pixels is transparent (an already cut-out PNG). */
export function hasTransparency(c: HTMLCanvasElement): boolean {
  const ctx = c.getContext('2d')!
  const { data } = ctx.getImageData(0, 0, c.width, c.height)
  let clear = 0
  const step = Math.max(1, Math.floor(data.length / 4 / 40000)) * 4
  let total = 0
  for (let i = 3; i < data.length; i += step) {
    total++
    if (data[i]! < 250) clear++
  }
  return clear / total > 0.02
}

/** Rotate a canvas by `deg` (clockwise on screen) about its centre into an expanded canvas. */
export function rotateCanvas(src: HTMLCanvasElement, deg: number): HTMLCanvasElement {
  if (Math.abs(deg) < 0.05) return src
  const { width, height } = rotatedSize(src.width, src.height, deg)
  const [c, ctx] = makeCanvas(width, height)
  ctx.imageSmoothingQuality = 'high'
  ctx.translate(width / 2, height / 2)
  ctx.rotate((deg * Math.PI) / 180)
  ctx.drawImage(src, -src.width / 2, -src.height / 2)
  return c
}

/** Turn an alpha map (mw×mh, 0..1) into a w×h mask canvas usable with destination-in. */
export function alphaToMask(alpha: Float32Array, mw: number, mh: number, w: number, h: number): HTMLCanvasElement {
  const [small, sctx] = makeCanvas(mw, mh)
  const img = sctx.createImageData(mw, mh)
  for (let i = 0; i < alpha.length; i++) {
    img.data[i * 4 + 3] = Math.round(Math.min(1, Math.max(0, alpha[i]!)) * 255)
  }
  sctx.putImageData(img, 0, 0)
  const [c, ctx] = makeCanvas(w, h)
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(small, 0, 0, w, h)
  return c
}

/** Alpha channel of a canvas, resampled to mw×mh, as 0..1 values. */
export function canvasAlpha(src: HTMLCanvasElement, mw: number, mh: number): Float32Array {
  const [, ctx] = makeCanvas(mw, mh)
  ctx.drawImage(src, 0, 0, mw, mh)
  const { data } = ctx.getImageData(0, 0, mw, mh)
  const out = new Float32Array(mw * mh)
  for (let i = 0; i < out.length; i++) out[i] = data[i * 4 + 3]! / 255
  return out
}

/** Subject cut out with the mask (or the source as-is when mask is null). */
export function cutout(src: HTMLCanvasElement, mask: HTMLCanvasElement | null): HTMLCanvasElement {
  if (!mask) return src
  const [c, ctx] = makeCanvas(src.width, src.height)
  ctx.drawImage(src, 0, 0)
  ctx.globalCompositeOperation = 'destination-in'
  ctx.drawImage(mask, 0, 0)
  return c
}

/** Draw the crop of `subject` onto a w×h canvas over a solid background. */
export function composePhoto(subject: HTMLCanvasElement, crop: CropRect, w: number, h: number, bg: string): HTMLCanvasElement {
  const [c, ctx] = makeCanvas(w, h)
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, w, h)
  ctx.imageSmoothingQuality = 'high'
  const s = w / crop.width
  ctx.setTransform(s, 0, 0, h / crop.height, -crop.x * s, (-crop.y * h) / crop.height)
  ctx.drawImage(subject, 0, 0)
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  return c
}

/** Tile the photo on a sheet with light cut marks around every cell. */
export function composeSheet(photo: HTMLCanvasElement, layout: SheetLayout): HTMLCanvasElement {
  const [c, ctx] = makeCanvas(layout.width, layout.height)
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, c.width, c.height)
  const pw = photo.width
  const ph = photo.height
  ctx.strokeStyle = '#9ca3af'
  ctx.lineWidth = 2
  ctx.setLineDash([12, 8])
  for (const p of layout.cells) {
    ctx.drawImage(photo, p.x, p.y)
    ctx.strokeRect(p.x - 1, p.y - 1, pw + 2, ph + 2)
  }
  ctx.setLineDash([])
  return c
}

export interface Encoded {
  blob: Blob
  quality?: number
  ok: boolean
}

export async function encodeJpeg(c: HTMLCanvasElement, dpi: number, kbMin?: number, kbMax?: number): Promise<Encoded> {
  let last: Blob | null = null
  let lastQ = -1
  const enc = async (q: number) => {
    last = await canvasToBlob(c, 'image/jpeg', q)
    lastQ = q
    return last.size + 18 // room for the JFIF header we may insert
  }
  const r = await searchQuality(enc, kbMin ? kbMin * 1024 : undefined, kbMax ? kbMax * 1024 : undefined)
  const blob: Blob = lastQ === r.quality && last ? last : await canvasToBlob(c, 'image/jpeg', r.quality)
  const bytes = setJpegDpi(new Uint8Array(await blob.arrayBuffer()), dpi)
  return { blob: new Blob([bytes as BlobPart], { type: 'image/jpeg' }), quality: r.quality, ok: r.ok }
}

export async function encodePng(c: HTMLCanvasElement, dpi: number): Promise<Encoded> {
  const blob = await canvasToBlob(c, 'image/png')
  const bytes = setPngDpi(new Uint8Array(await blob.arrayBuffer()), dpi)
  return { blob: new Blob([bytes as BlobPart], { type: 'image/png' }), ok: true }
}
