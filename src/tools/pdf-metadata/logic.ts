import { loadPdfLib } from '@/lib/pdf'

export interface PdfMeta {
  title: string
  author: string
  subject: string
  keywords: string
  creator: string
  producer: string
  creationDate: string // ISO local "YYYY-MM-DDTHH:mm" or ''
  modDate: string
}

const toLocal = (d?: Date) => {
  if (!d || Number.isNaN(d.getTime())) return ''
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`
}

export async function readMeta(bytes: Uint8Array): Promise<PdfMeta> {
  const { PDFDocument } = await loadPdfLib()
  const d = await PDFDocument.load(bytes, { updateMetadata: false })
  return {
    title: d.getTitle() ?? '',
    author: d.getAuthor() ?? '',
    subject: d.getSubject() ?? '',
    keywords: d.getKeywords() ?? '',
    creator: d.getCreator() ?? '',
    producer: d.getProducer() ?? '',
    creationDate: toLocal(d.getCreationDate()),
    modDate: toLocal(d.getModificationDate()),
  }
}

/** Write metadata. `stripAll` also removes the XMP metadata stream. Empty fields are removed. */
export async function writeMeta(bytes: Uint8Array, m: PdfMeta, stripAll = false): Promise<Uint8Array> {
  const { PDFDocument, PDFName, PDFDict } = await loadPdfLib()
  const d = await PDFDocument.load(bytes, { updateMetadata: false })
  d.setTitle(d.getTitle() ?? '') // ensures an Info dictionary exists
  const info = d.context.lookup(d.context.trailerInfo.Info, PDFDict)
  const set = (key: string, v: string, setter: (v: string) => void) => (v && !stripAll ? setter(v) : info.delete(PDFName.of(key)))
  set('Title', m.title, (v) => d.setTitle(v))
  set('Author', m.author, (v) => d.setAuthor(v))
  set('Subject', m.subject, (v) => d.setSubject(v))
  set('Keywords', m.keywords, (v) => d.setKeywords(v.split(/\s*[,;]\s*/).filter(Boolean)))
  set('Creator', m.creator, (v) => d.setCreator(v))
  set('Producer', m.producer, (v) => d.setProducer(v))
  set('CreationDate', m.creationDate, (v) => d.setCreationDate(new Date(v)))
  set('ModDate', m.modDate, (v) => d.setModificationDate(new Date(v)))
  if (stripAll) d.catalog.delete(PDFName.of('Metadata'))
  return d.save()
}
