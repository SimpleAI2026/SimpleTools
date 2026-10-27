import { describe, expect, it } from 'vitest'
import { PDFDocument } from '@cantoo/pdf-lib'
import { readMeta, writeMeta } from './logic'

async function sample() {
  const d = await PDFDocument.create()
  d.addPage()
  d.setTitle('Old')
  d.setAuthor('A')
  return d.save()
}
describe('pdf-metadata', () => {
  it('reads and writes', async () => {
    const m = await readMeta(await sample())
    expect(m.title).toBe('Old')
    const out = await writeMeta(await sample(), { ...m, title: '新标题', keywords: 'a, b', author: '', creationDate: '2026-01-02T03:04' })
    const r = await readMeta(out)
    expect(r.title).toBe('新标题')
    expect(r.author).toBe('')
    expect(r.keywords).toBe('a b')
    expect(r.creationDate).toBe('2026-01-02T03:04')
  })
  it('strips all', async () => {
    const r = await readMeta(await writeMeta(await sample(), await readMeta(await sample()), true))
    expect(r.title + r.author + r.producer).toBe('')
  })
})
