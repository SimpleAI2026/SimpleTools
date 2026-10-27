import type { PDFDocument, PDFFont, PDFImage } from '@cantoo/pdf-lib'

/** True when a standard (WinAnsi) font can encode the text. */
export function canEncode(font: PDFFont, text: string): boolean {
  const set = new Set(font.getCharacterSet())
  for (const ch of text) if (ch !== '\n' && !set.has(ch.codePointAt(0)!)) return false
  return true
}

export function hexToRgb01(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  const n = parseInt(h.length === 3 ? [...h].map((c) => c + c).join('') : h, 16)
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}

/** Renders text to a PNG (browser canvas); used to place CJK/emoji text when no embeddable font is available. */
export type TextRasterizer = (text: string, fontSizePt: number, color: string, bold?: boolean) => Promise<{ png: Uint8Array; widthPt: number; heightPt: number }>

export const canvasTextRasterizer: TextRasterizer = async (text, size, color, bold) => {
  const scale = 4
  const font = `${bold ? '700 ' : ''}${size * scale}px system-ui, -apple-system, "PingFang SC", "Microsoft YaHei", "Noto Sans CJK SC", sans-serif`
  const m = document.createElement('canvas').getContext('2d')!
  m.font = font
  const lines = text.split('\n')
  const w = Math.max(1, ...lines.map((l) => m.measureText(l).width))
  const lh = size * scale * 1.25
  const c = document.createElement('canvas')
  c.width = Math.ceil(w)
  c.height = Math.ceil(lh * lines.length)
  const ctx = c.getContext('2d')!
  ctx.font = font
  ctx.fillStyle = color
  ctx.textBaseline = 'top'
  lines.forEach((l, i) => ctx.fillText(l, 0, i * lh + size * scale * 0.1))
  const blob = await new Promise<Blob>((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error('encode'))), 'image/png'))
  return { png: new Uint8Array(await blob.arrayBuffer()), widthPt: c.width / scale, heightPt: c.height / scale }
}

export async function embedTextImage(doc: PDFDocument, r: TextRasterizer, text: string, size: number, color: string, bold?: boolean): Promise<{ image: PDFImage; width: number; height: number }> {
  const { png, widthPt, heightPt } = await r(text, size, color, bold)
  return { image: await doc.embedPng(png), width: widthPt, height: heightPt }
}

/**
 * Move the content stream that was just appended by pdf-lib (drawText/drawPage/drawImage) to the front,
 * so it renders *behind* the existing page content.
 */
export async function sendLastContentToBack(page: import('@cantoo/pdf-lib').PDFPage): Promise<void> {
  const { PDFArray } = await import('@cantoo/pdf-lib')
  const contents = page.node.Contents()
  if (!(contents instanceof PDFArray) || contents.size() < 2) return
  const last = contents.get(contents.size() - 1)
  contents.remove(contents.size() - 1)
  contents.insert(0, last)
}
