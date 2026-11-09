import { onBeforeUnmount, ref, shallowRef } from 'vue'
import type { PDFDocumentProxy } from 'pdfjs-dist'
import { closePdf, openPdf } from './pdf'

/** Load a PDF (bytes + pdf.js proxy), handling password-protected files. */
export function usePdfFile() {
  const file = shallowRef<File | null>(null)
  const bytes = shallowRef<Uint8Array | null>(null)
  const doc = shallowRef<PDFDocumentProxy | null>(null)
  const numPages = ref(0)
  const error = ref('')
  const busy = ref(false)
  const needsPassword = ref(false)

  async function release() {
    if (doc.value) await closePdf(doc.value).catch(() => undefined)
    doc.value = null
  }
  async function load(f: File, password?: string) {
    busy.value = true
    error.value = ''
    needsPassword.value = false
    try {
      await release()
      const b = new Uint8Array(await f.arrayBuffer())
      const d = await openPdf(b, password)
      file.value = f
      bytes.value = b
      doc.value = d
      numPages.value = d.numPages
    } catch (e) {
      const name = (e as { name?: string }).name
      if (name === 'PasswordException') {
        needsPassword.value = true
        file.value = f
      } else error.value = e instanceof Error ? e.message : String(e)
    } finally {
      busy.value = false
    }
  }
  onBeforeUnmount(release)
  const baseName = () => file.value?.name.replace(/\.pdf$/i, '') || 'document'
  return { file, bytes, doc, numPages, error, busy, needsPassword, load, baseName }
}
