import { describe, expect, it } from 'vitest'
import { PDFDocument } from '@cantoo/pdf-lib'
import { isEncrypted, unlockPdf } from './logic'

describe('pdf-unlock', () => {
  it('removes encryption with the right password', async () => {
    const d = await PDFDocument.create()
    d.addPage()
    d.addPage()
    d.encrypt({ userPassword: 'pw', ownerPassword: 'o' })
    const enc = await d.save()
    expect(isEncrypted(enc)).toBe(true)
    await expect(unlockPdf(enc, 'nope')).rejects.toThrow()
    const out = await unlockPdf(enc, 'pw')
    expect(isEncrypted(out)).toBe(false)
    expect((await PDFDocument.load(out)).getPageCount()).toBe(2)
  })
})
