import { describe, expect, it } from 'vitest'
import { PDFDocument } from '@cantoo/pdf-lib'
import { protectPdf } from './logic'

const o = { userPassword: 'open-me', ownerPassword: 'owner', algorithm: 'AES-256' as const, printing: true, copying: false, modifying: false, annotating: false }
describe('pdf-protect', () => {
  it('encrypts so it cannot be opened without the password', async () => {
    const d = await PDFDocument.create()
    d.addPage()
    const out = await protectPdf(await d.save(), o)
    expect(new TextDecoder('latin1').decode(out)).toContain('/Encrypt')
    await expect(PDFDocument.load(out)).rejects.toThrow()
    expect((await PDFDocument.load(out, { password: 'open-me' })).getPageCount()).toBe(1)
  })
  it('requires a password', async () => {
    await expect(protectPdf(new Uint8Array(), { ...o, userPassword: '', ownerPassword: '' })).rejects.toThrow(/password/)
  })
})
