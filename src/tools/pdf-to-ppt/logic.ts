export interface SlidePage {
  /** data:image/... URL */
  image: string
  widthPt: number
  heightPt: number
  notes?: string
}

/** Slide size in inches matching the first page's aspect ratio (10in wide). */
export function slideSize(widthPt: number, heightPt: number): { width: number; height: number } {
  return { width: 10, height: Math.round((10 * heightPt * 1000) / widthPt) / 1000 }
}

/** One slide per page: full-bleed image (contain-fitted) plus the page text as speaker notes. */
export async function buildPdfPptx(pages: SlidePage[], title: string): Promise<Uint8Array> {
  if (!pages.length) throw new Error('No pages')
  const { default: PptxGenJS } = await import('pptxgenjs')
  const pptx = new PptxGenJS()
  const { width, height } = slideSize(pages[0]!.widthPt, pages[0]!.heightPt)
  pptx.defineLayout({ name: 'PDF', width, height })
  pptx.layout = 'PDF'
  pptx.title = title
  for (const p of pages) {
    const s = pptx.addSlide()
    const scale = Math.min(width / p.widthPt, height / p.heightPt)
    const w = p.widthPt * scale
    const h = p.heightPt * scale
    s.addImage({ data: p.image, x: (width - w) / 2, y: (height - h) / 2, w, h })
    if (p.notes) s.addNotes(p.notes)
  }
  return (await pptx.write({ outputType: 'uint8array' })) as Uint8Array
}
