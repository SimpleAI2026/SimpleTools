import type { PDFFont } from '@cantoo/pdf-lib'
import { loadPdfLib } from './pdf'
import { canEncode, hexToRgb01, type TextRasterizer } from './pdfDraw'

/** A paragraph-like unit laid out by `layoutPdf`. */
export interface Block {
  text: string
  size: number
  bold?: boolean
  /** left indent (pt) */
  indent?: number
  /** extra space before (pt) */
  before?: number
  pageBreak?: boolean
  color?: string
  /** draw a horizontal rule instead of text */
  rule?: boolean
}

export type StdFamily = 'Helvetica' | 'TimesRoman' | 'Courier'
export interface LayoutOptions {
  pageSize: [number, number]
  margin: number
  lineHeight: number
  family: StdFamily
  /** optional TTF/OTF bytes (embedded via fontkit; enables CJK as real, selectable text) */
  customFont?: Uint8Array
  title?: string
}

const WIDE = /[\u1100-\u11ff\u2e80-\u9fff\uac00-\ud7af\uf900-\ufaff\uff00-\uffef]/u
const TOKENS = /[\u1100-\u11ff\u2e80-\u9fff\uac00-\ud7af\uf900-\ufaff\uff00-\uffef]|\s+|[^\s\u1100-\u11ff\u2e80-\u9fff\uac00-\ud7af\uf900-\ufaff\uff00-\uffef]+/gu

/** Greedy line wrapping; CJK characters break anywhere, other words at whitespace (over-long words are split). */
export function wrapText(text: string, width: (s: string) => number, max: number): string[] {
  const lines: string[] = []
  let cur = ''
  const push = () => {
    lines.push(cur.trimEnd())
    cur = ''
  }
  for (const tok of text.match(TOKENS) ?? []) {
    if (/^\s+$/.test(tok)) {
      if (cur) cur += ' '
      continue
    }
    if (width(cur + tok) <= max) {
      cur += tok
      continue
    }
    if (cur.trim()) push()
    if (width(tok) <= max) {
      cur = tok
      continue
    }
    for (const ch of tok) {
      if (cur && width(cur + ch) > max) push()
      cur += ch
    }
  }
  if (cur.trim() || !lines.length) push()
  return lines
}

/** Approximate width for text the font cannot encode (rendered as an image instead). */
function approxWidth(font: PDFFont, s: string, size: number): number {
  let w = 0
  for (const ch of s) w += canEncode(font, ch) ? font.widthOfTextAtSize(ch, size) : WIDE.test(ch) ? size : size * 0.6
  return w
}

/**
 * Flow blocks of text onto pages with pdf-lib. Text the chosen font can encode stays selectable;
 * other lines fall back to `rasterize` (image) or throw when none is given.
 */
export async function layoutPdf(blocks: Block[], o: LayoutOptions, rasterize?: TextRasterizer): Promise<Uint8Array> {
  const { PDFDocument, StandardFonts, rgb } = await loadPdfLib()
  const doc = await PDFDocument.create()
  if (o.title) doc.setTitle(o.title)
  let regular: PDFFont
  let bold: PDFFont
  if (o.customFont) {
    doc.registerFontkit((await import('@pdf-lib/fontkit')).default)
    regular = bold = await doc.embedFont(o.customFont, { subset: true })
  } else {
    const map = { Helvetica: ['Helvetica', 'HelveticaBold'], TimesRoman: ['TimesRoman', 'TimesRomanBold'], Courier: ['Courier', 'CourierBold'] } as const
    regular = await doc.embedFont(StandardFonts[map[o.family][0]])
    bold = await doc.embedFont(StandardFonts[map[o.family][1]])
  }
  const [W, H] = o.pageSize
  let page = doc.addPage([W, H])
  let y = H - o.margin
  const newPage = () => {
    page = doc.addPage([W, H])
    y = H - o.margin
  }
  for (const b of blocks) {
    if (b.pageBreak) {
      if (y < H - o.margin) newPage()
      continue
    }
    const font = b.bold ? bold : regular
    const lh = b.size * o.lineHeight
    y -= b.before ?? 0
    if (b.rule) {
      if (y - lh < o.margin) newPage()
      y -= lh / 2
      page.drawLine({ start: { x: o.margin, y }, end: { x: W - o.margin, y }, thickness: 0.75, color: rgb(0.7, 0.7, 0.7) })
      y -= lh / 2
      continue
    }
    const indent = b.indent ?? 0
    const ok = canEncode(font, b.text)
    if (!ok && !rasterize) throw new Error('The text contains characters the selected font cannot encode; upload a TTF/OTF font that covers them.')
    const measure = (s: string) => (ok ? font.widthOfTextAtSize(s, b.size) : approxWidth(font, s, b.size))
    const [r, g, bl] = hexToRgb01(b.color ?? '#000000')
    for (const line of b.text ? wrapText(b.text, measure, W - 2 * o.margin - indent) : ['']) {
      if (y - lh < o.margin) newPage()
      y -= lh
      if (!line) continue
      const baseline = y + (lh - b.size) / 2 + b.size * 0.2
      if (ok) page.drawText(line, { x: o.margin + indent, y: baseline, size: b.size, font, color: rgb(r, g, bl) })
      else {
        const img = await rasterize!(line, b.size, b.color ?? '#000000', b.bold)
        const png = await doc.embedPng(img.png)
        page.drawImage(png, { x: o.margin + indent, y: y + (lh - img.heightPt) / 2, width: img.widthPt, height: img.heightPt })
      }
    }
  }
  return doc.save()
}
