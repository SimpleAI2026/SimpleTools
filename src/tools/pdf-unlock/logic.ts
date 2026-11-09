import { loadPdfLib } from '@/lib/pdf'

/** Decrypt with the given password and copy all pages into a fresh, unencrypted document. */
export async function unlockPdf(bytes: Uint8Array, password: string): Promise<Uint8Array> {
  const { PDFDocument } = await loadPdfLib()
  let src
  try {
    src = await PDFDocument.load(bytes, { password })
  } catch (e) {
    throw new Error(/password/i.test(String(e)) ? 'Incorrect password' : String((e as Error).message ?? e))
  }
  const out = await PDFDocument.create()
  for (const p of await out.copyPages(src, src.getPageIndices())) out.addPage(p)
  const title = src.getTitle()
  if (title) out.setTitle(title)
  return out.save()
}

export function isEncrypted(bytes: Uint8Array): boolean {
  const tail = new TextDecoder('latin1').decode(bytes.subarray(Math.max(0, bytes.length - 4096)))
  const head = new TextDecoder('latin1').decode(bytes.subarray(0, Math.min(bytes.length, 1 << 20)))
  return /\/Encrypt\s/.test(tail) || /\/Encrypt\s+\d+\s+\d+\s+R/.test(head)
}
