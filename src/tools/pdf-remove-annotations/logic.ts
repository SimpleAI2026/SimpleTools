import { loadPdfLib } from '@/lib/pdf'

export interface RemoveAnnotOptions {
  keepLinks: boolean
  removeForms: boolean
}

/** Remove page annotations (comments, highlights, stamps…); optionally keep links and drop AcroForm fields. */
export async function removeAnnotations(bytes: Uint8Array, o: RemoveAnnotOptions): Promise<{ bytes: Uint8Array; removed: number }> {
  const { PDFDocument, PDFName, PDFArray, PDFDict } = await loadPdfLib()
  const doc = await PDFDocument.load(bytes)
  let removed = 0
  for (const page of doc.getPages()) {
    const annots = page.node.lookupMaybe(PDFName.of('Annots'), PDFArray)
    if (!annots) continue
    const keep = []
    for (let i = 0; i < annots.size(); i++) {
      const ref = annots.get(i)
      const dict = doc.context.lookupMaybe(ref, PDFDict)
      const subtype = dict?.get(PDFName.of('Subtype'))?.toString()
      const isWidget = subtype === '/Widget'
      if ((o.keepLinks && subtype === '/Link') || (isWidget && !o.removeForms)) keep.push(ref)
      else removed++
    }
    if (keep.length) page.node.set(PDFName.of('Annots'), doc.context.obj(keep))
    else page.node.delete(PDFName.of('Annots'))
  }
  if (o.removeForms) doc.catalog.delete(PDFName.of('AcroForm'))
  return { bytes: await doc.save(), removed }
}
