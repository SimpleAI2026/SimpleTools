export type Rotation = 0 | 90 | 180 | 270
export interface Rect {
  x: number
  y: number
  w: number
  h: number
}
export interface EditState {
  crop: Rect
  rotation: Rotation
  flipH: boolean
  flipV: boolean
}

export function clampCrop(c: Rect, w: number, h: number): Rect {
  const x = Math.min(Math.max(0, Math.round(c.x)), w - 1)
  const y = Math.min(Math.max(0, Math.round(c.y)), h - 1)
  return { x, y, w: Math.min(Math.max(1, Math.round(c.w)), w - x), h: Math.min(Math.max(1, Math.round(c.h)), h - y) }
}

/** Largest centred crop with the given aspect ratio (w / h); null ratio = full image. */
export function aspectCrop(w: number, h: number, ratio: number | null): Rect {
  if (!ratio) return { x: 0, y: 0, w, h }
  let cw = w
  let ch = Math.round(w / ratio)
  if (ch > h) {
    ch = h
    cw = Math.round(h * ratio)
  }
  return { x: Math.floor((w - cw) / 2), y: Math.floor((h - ch) / 2), w: cw, h: ch }
}

export function outputSize(s: EditState): { width: number; height: number } {
  const swap = s.rotation === 90 || s.rotation === 270
  return swap ? { width: s.crop.h, height: s.crop.w } : { width: s.crop.w, height: s.crop.h }
}

export const rotate = (r: Rotation, dir: 1 | -1): Rotation => (((r + dir * 90 + 360) % 360) as Rotation)

/** Draw `src` into `ctx` (sized to outputSize) applying crop, rotation and flips. */
export function drawEdited(ctx: CanvasRenderingContext2D, src: CanvasImageSource, s: EditState): void {
  const { width, height } = outputSize(s)
  ctx.save()
  ctx.translate(width / 2, height / 2)
  ctx.rotate((s.rotation * Math.PI) / 180)
  ctx.scale(s.flipH ? -1 : 1, s.flipV ? -1 : 1)
  ctx.drawImage(src, s.crop.x, s.crop.y, s.crop.w, s.crop.h, -s.crop.w / 2, -s.crop.h / 2, s.crop.w, s.crop.h)
  ctx.restore()
}
