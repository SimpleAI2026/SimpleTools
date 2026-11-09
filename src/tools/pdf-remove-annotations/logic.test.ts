import { describe, expect, it } from 'vitest'
import { PDFArray, PDFDocument, PDFName } from '@cantoo/pdf-lib'
import { removeAnnotations } from './logic'

async function sample() {
  const d = await PDFDocument.create()
  const p = d.addPage()
  const link = d.context.register(d.context.obj({ Type: 'Annot', Subtype: 'Link', Rect: [0, 0, 10, 10] }))
  const note = d.context.register(d.context.obj({ Type: 'Annot', Subtype: 'Text', Rect: [0, 0, 10, 10], Contents: 'hi' }))
  p.node.set(PDFName.of('Annots'), d.context.obj([link, note]))
  return d.save()
}
const count = async (b: Uint8Array) => (await PDFDocument.load(b)).getPage(0).node.lookupMaybe(PDFName.of('Annots'), PDFArray)?.size() ?? 0

describe('pdf-remove-annotations', () => {
  it('keeps links when asked', async () => {
    const r = await removeAnnotations(await sample(), { keepLinks: true, removeForms: false })
    expect(r.removed).toBe(1)
    expect(await count(r.bytes)).toBe(1)
  })
  it('removes everything', async () => {
    const r = await removeAnnotations(await sample(), { keepLinks: false, removeForms: true })
    expect(r.removed).toBe(2)
    expect(await count(r.bytes)).toBe(0)
  })
})
