/// <reference lib="webworker" />
import { fitWithin, outputType, type CompressRequest, type CompressResponse } from './logic'

self.onmessage = async (e: MessageEvent<CompressRequest>) => {
  const r = e.data
  try {
    const bmp = await createImageBitmap(r.file, { imageOrientation: 'from-image' })
    const { width, height } = fitWithin(bmp.width, bmp.height, r.maxWidth, r.maxHeight)
    const canvas = new OffscreenCanvas(width, height)
    const ctx = canvas.getContext('2d')!
    const type = outputType(r.file.type, r.format)
    if (type === 'image/jpeg') {
      ctx.fillStyle = '#fff'
      ctx.fillRect(0, 0, width, height)
    }
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(bmp, 0, 0, width, height)
    bmp.close()
    const blob = await canvas.convertToBlob({ type, quality: r.quality })
    self.postMessage({ id: r.id, ok: true, blob, width, height } satisfies CompressResponse)
  } catch (err) {
    self.postMessage({ id: r.id, ok: false, error: String(err) } satisfies CompressResponse)
  }
}
