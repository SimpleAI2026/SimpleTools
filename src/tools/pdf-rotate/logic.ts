import { loadPdfLib } from '@/lib/pdf'

/** Add `rotations[page]` degrees (multiples of 90) to the given 1-based pages. */
export async function rotatePdf(bytes: Uint8Array, rotations: Record<number, number>): Promise<Uint8Array> {
  const { PDFDocument, degrees } = await loadPdfLib()
  const doc = await PDFDocument.load(bytes)
  doc.getPages().forEach((p, i) => {
    const add = rotations[i + 1] ?? 0
    if (add % 360) p.setRotation(degrees((((p.getRotation().angle + add) % 360) + 360) % 360))
  })
  return doc.save()
}

export function rotationMap(pages: number[], angle: number, prev: Record<number, number> = {}): Record<number, number> {
  const next = { ...prev }
  for (const p of pages) next[p] = ((((next[p] ?? 0) + angle) % 360) + 360) % 360
  return next
}
