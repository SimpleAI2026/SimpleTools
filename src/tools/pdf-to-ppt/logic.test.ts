import { describe, expect, it } from 'vitest'
import { unzipSync, strFromU8 } from 'fflate'
import { buildPdfPptx, slideSize } from './logic'

const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
describe('pdf-to-ppt', () => {
  it('slide size', () => expect(slideSize(612, 792)).toEqual({ width: 10, height: 12.941 }))
  it('builds slides with notes', async () => {
    const out = await buildPdfPptx([{ image: PNG, widthPt: 800, heightPt: 450, notes: 'page one' }, { image: PNG, widthPt: 800, heightPt: 450 }], 'deck')
    const files = unzipSync(out)
    expect(Object.keys(files).filter((k) => /^ppt\/slides\/slide\d+\.xml$/.test(k))).toHaveLength(2)
    expect(Object.entries(files).some(([k, v]) => k.includes('notesSlide') && strFromU8(v).includes('page one'))).toBe(true)
  })
})
