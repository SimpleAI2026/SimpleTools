import { describe, expect, it } from 'vitest'
import { DOCX_MIME, docxToText } from './word'
import { loadSampleDocx } from './sampleDocx'

describe('loadSampleDocx', () => {
  it('returns a non-empty docx File', async () => {
    const file = await loadSampleDocx()
    expect(file).toBeInstanceOf(File)
    expect(file.name).toBe('simpletools-sample.docx')
    expect(file.type).toBe(DOCX_MIME)
    expect(file.size).toBeGreaterThan(100)
    const text = await docxToText(await file.arrayBuffer())
    expect(text).toMatch(/SimpleTools Sample/)
    expect(text).toMatch(/front-end/i)
  })
})
