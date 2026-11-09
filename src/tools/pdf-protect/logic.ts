import { loadPdfLib } from '@/lib/pdf'

export interface ProtectOptions {
  userPassword: string
  ownerPassword: string
  algorithm: 'AES-256' | 'AES-128'
  printing: boolean
  copying: boolean
  modifying: boolean
  annotating: boolean
}

export async function protectPdf(bytes: Uint8Array, o: ProtectOptions): Promise<Uint8Array> {
  if (!o.userPassword && !o.ownerPassword) throw new Error('A password is required')
  const { PDFDocument } = await loadPdfLib()
  const doc = await PDFDocument.load(bytes)
  doc.encrypt({
    userPassword: o.userPassword,
    // without an owner password anyone could lift the restrictions; derive one if not given
    ownerPassword: o.ownerPassword || `${o.userPassword}\u0001${crypto.getRandomValues(new Uint32Array(2)).join('')}`,
    algorithm: o.algorithm,
    permissions: {
      printing: o.printing ? 'highResolution' : false,
      copying: o.copying,
      modifying: o.modifying,
      annotating: o.annotating,
      fillingForms: o.annotating,
      contentAccessibility: true,
      documentAssembly: o.modifying,
    },
  } as never)
  return doc.save()
}
