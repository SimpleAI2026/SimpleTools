/// <reference lib="webworker" />
import {
  initializeImageMagick,
  ImageMagick,
  Magick,
  MagickFormat,
  MagickGeometry,
  MagickImage,
  MagickImageCollection,
  Percentage,
  Point,
  CompositeOperator,
  Gravity,
  type IMagickImage,
} from '@imagemagick/magick-wasm'
import { clampQuality, fitSize, IM_MIME, type MagickOp } from './logic'

export type MagickRequest =
  | { id: number; kind: 'formats'; wasmUrl: string }
  | {
      id: number
      kind: 'process'
      wasmUrl: string
      bytes: ArrayBuffer
      format: string
      ops: MagickOp[]
      watermark?: { bytes: ArrayBuffer; gravity: string; x: number; y: number } | null
      frameIndex?: number | null
      mode?: 'single' | 'splitGif' | 'joinGif' | 'stats'
      extraFrames?: ArrayBuffer[]
    }

export type MagickResponse =
  | { id: number; ok: true; kind: 'formats'; formats: string[] }
  | {
      id: number
      ok: true
      kind: 'process'
      buffer: ArrayBuffer
      mime: string
      width: number
      height: number
      stats?: string
      frames?: { name: string; buffer: ArrayBuffer; mime: string }[]
    }
  | { id: number; ok: false; error: string }

let ready: Promise<void> | null = null

async function ensureInit(wasmUrl: string) {
  ready ??= (async () => {
    const res = await fetch(wasmUrl)
    if (!res.ok) throw new Error(`Failed to fetch magick.wasm (${res.status})`)
    await initializeImageMagick(new Uint8Array(await res.arrayBuffer()))
  })()
  await ready
}

function applyOps(image: IMagickImage, ops: MagickOp[]) {
  for (const op of ops) {
    switch (op.type) {
      case 'autoOrient':
        image.autoOrient()
        break
      case 'crop':
        image.crop(new MagickGeometry(op.x, op.y, op.width, op.height))
        break
      case 'resize': {
        const { width, height } = fitSize(image.width, image.height, op.maxWidth, op.maxHeight)
        if (width !== image.width || height !== image.height) image.resize(width, height)
        break
      }
      case 'rotate':
        if (op.degrees) image.rotate(op.degrees)
        break
      case 'flip':
        image.flip()
        break
      case 'flop':
        image.flop()
        break
      case 'blur':
        image.blur(op.radius, op.sigma)
        break
      case 'sharpen':
        image.sharpen(op.radius, op.sigma)
        break
      case 'modulate':
        image.modulate(new Percentage(op.brightness), new Percentage(op.saturation), new Percentage(op.hue))
        break
      case 'quality':
        image.quality = clampQuality(op.value)
        break
    }
  }
}

function applyWatermark(image: IMagickImage, wm: { bytes: ArrayBuffer; gravity: string; x: number; y: number }) {
  ImageMagick.read(new Uint8Array(wm.bytes), (mark) => {
    const g = (Gravity as Record<string, number>)[wm.gravity] ?? Gravity.Southeast
    image.compositeGravity(mark, g as (typeof Gravity)[keyof typeof Gravity], CompositeOperator.Over, new Point(wm.x, wm.y))
  })
}

function writeFormat(image: IMagickImage, format: string): Uint8Array {
  const key = format in MagickFormat ? format : format.charAt(0) + format.slice(1).toLowerCase()
  // MagickFormat keys are Pascal-ish (Jpeg) but values are "JPEG". Prefer value match.
  const fmt =
    (Object.values(MagickFormat) as string[]).includes(format)
      ? (format as (typeof MagickFormat)[keyof typeof MagickFormat])
      : ((MagickFormat as Record<string, string>)[key] as (typeof MagickFormat)[keyof typeof MagickFormat]) ?? MagickFormat.Png
  return image.write(fmt, (data) => {
    const copy = new Uint8Array(data.byteLength)
    copy.set(data)
    return copy
  })
}

function toAb(buf: Uint8Array): ArrayBuffer {
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer
}

self.onmessage = async (e: MessageEvent<MagickRequest>) => {
  const r = e.data
  try {
    await ensureInit(r.wasmUrl)
    if (r.kind === 'formats') {
      self.postMessage({
        id: r.id,
        ok: true,
        kind: 'formats',
        formats: Magick.supportedFormats.map((f) => String(f.format)),
      } satisfies MagickResponse)
      return
    }

    if (r.mode === 'joinGif') {
      const parts = [r.bytes, ...(r.extraFrames ?? [])]
      const out = MagickImageCollection.use((col) => {
        for (const part of parts) {
          const img = MagickImage.create(new Uint8Array(part))
          applyOps(img, r.ops)
          col.push(img)
        }
        return col.write(MagickFormat.Gif, (data) => {
          const copy = new Uint8Array(data.byteLength)
          copy.set(data)
          return copy
        })
      })
      const buffer = toAb(out)
      self.postMessage(
        { id: r.id, ok: true, kind: 'process', buffer, mime: 'image/gif', width: 0, height: 0 } satisfies MagickResponse,
        [buffer],
      )
      return
    }

    if (r.mode === 'splitGif') {
      const frames: { name: string; buffer: ArrayBuffer; mime: string }[] = []
      ImageMagick.readCollection(new Uint8Array(r.bytes), (col) => {
        col.forEach((img, i) => {
          applyOps(img, r.ops.filter((o) => o.type !== 'quality'))
          img.quality = 92
          const png = writeFormat(img, 'PNG')
          frames.push({
            name: `frame-${String(i + 1).padStart(3, '0')}.png`,
            buffer: toAb(png),
            mime: 'image/png',
          })
        })
      })
      const transfer = frames.map((f) => f.buffer)
      self.postMessage(
        {
          id: r.id,
          ok: true,
          kind: 'process',
          buffer: transfer[0] ?? new ArrayBuffer(0),
          mime: 'image/png',
          width: 0,
          height: 0,
          frames,
        } satisfies MagickResponse,
        transfer,
      )
      return
    }

    // Frame select or single image
    if (r.frameIndex != null && r.frameIndex >= 0) {
      const picked = ImageMagick.readCollection(new Uint8Array(r.bytes), (col) => {
        const frame = col[r.frameIndex!]
        if (!frame) throw new Error(`Frame ${r.frameIndex} out of range (0..${col.length - 1})`)
        applyOps(frame, r.ops)
        if (r.watermark) applyWatermark(frame, r.watermark)
        const stats = r.mode === 'stats' ? frame.toString() : undefined
        const data = writeFormat(frame, r.format)
        return { data, width: frame.width, height: frame.height, stats }
      })
      const buffer = toAb(picked.data)
      self.postMessage(
        {
          id: r.id,
          ok: true,
          kind: 'process',
          buffer,
          mime: IM_MIME[r.format] ?? 'application/octet-stream',
          width: picked.width,
          height: picked.height,
          stats: picked.stats,
        } satisfies MagickResponse,
        [buffer],
      )
      return
    }

    const result = ImageMagick.read(new Uint8Array(r.bytes), (image) => {
      applyOps(image, r.ops)
      if (r.watermark) applyWatermark(image, r.watermark)
      const stats = r.mode === 'stats' ? image.toString() : undefined
      const data = writeFormat(image, r.format)
      return { data, width: image.width, height: image.height, stats }
    })
    const buffer = toAb(result.data)
    self.postMessage(
      {
        id: r.id,
        ok: true,
        kind: 'process',
        buffer,
        mime: IM_MIME[r.format] ?? 'application/octet-stream',
        width: result.width,
        height: result.height,
        stats: result.stats,
      } satisfies MagickResponse,
      [buffer],
    )
  } catch (err) {
    self.postMessage({ id: r.id, ok: false, error: String(err) } satisfies MagickResponse)
  }
}
