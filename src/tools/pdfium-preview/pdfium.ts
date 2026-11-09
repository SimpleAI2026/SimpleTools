import { PDFiumWorkerClient } from '@hyzyla/pdfium/worker'
import { offlineUrl } from '@/lib/offlineAssets'
import { clampScale, rgbaToBlob, type RenderOpts } from './logic'

export interface PdfiumDoc {
  getPageCount(): Promise<number>
  getPage(pageIndex: number): Promise<{
    getText(): Promise<string>
    render(options?: Record<string, unknown>): Promise<{ data: Uint8Array; width: number; height: number }>
    close(): Promise<void>
  }>
  destroy(): Promise<void>
}

let client: PDFiumWorkerClient | null = null
let lastBytes: Uint8Array | null = null

async function ensureClient(): Promise<PDFiumWorkerClient> {
  if (client) return client
  client = await PDFiumWorkerClient.spawn({ wasmUrl: offlineUrl('pdfium', 'pdfium.wasm') })
  return client
}

export async function openPdfiumDoc(bytes: Uint8Array, password?: string): Promise<{ doc: PdfiumDoc; pageCount: number }> {
  const c = await ensureClient()
  lastBytes = bytes
  const doc = (await c.loadDocument(bytes, password)) as unknown as PdfiumDoc
  return { doc, pageCount: await doc.getPageCount() }
}

export async function renderPdfiumPage(
  doc: PdfiumDoc,
  pageIndex: number,
  opts: RenderOpts,
): Promise<{ blob: Blob; width: number; height: number; text: string }> {
  const page = await doc.getPage(pageIndex)
  try {
    const text = await page.getText()
    const rendered = await page.render({
      scale: clampScale(opts.scale),
      colorSpace: opts.colorSpace,
      transparent: opts.transparent,
      renderFormFields: opts.renderFormFields,
    })
    const data = rendered.data instanceof Uint8Array ? rendered.data : new Uint8Array(rendered.data)
    const blob = await rgbaToBlob(data, rendered.width, rendered.height, {
      format: opts.format,
      quality: opts.jpegQuality,
      gray: opts.colorSpace === 'Gray',
    })
    return { blob, width: rendered.width, height: rendered.height, text: text?.trim() ?? '' }
  } finally {
    await page.close()
  }
}

export async function renderThumb(doc: PdfiumDoc, pageIndex: number): Promise<string> {
  const page = await doc.getPage(pageIndex)
  try {
    const rendered = await page.render({ scale: 0.35 })
    const data = rendered.data instanceof Uint8Array ? rendered.data : new Uint8Array(rendered.data)
    const blob = await rgbaToBlob(data, rendered.width, rendered.height, { format: 'image/jpeg', quality: 0.7 })
    return URL.createObjectURL(blob)
  } finally {
    await page.close()
  }
}

/** Extract embedded image objects via main-thread library (worker has no object API). */
export async function extractEmbeddedImages(password?: string): Promise<{ name: string; blob: Blob }[]> {
  if (!lastBytes) throw new Error('No PDF loaded')
  const { PDFiumLibrary } = await import('@hyzyla/pdfium')
  const lib = await PDFiumLibrary.init({ wasmUrl: offlineUrl('pdfium', 'pdfium.wasm') })
  const out: { name: string; blob: Blob }[] = []
  try {
    const doc = await lib.loadDocument(lastBytes, password)
    try {
      let imgIndex = 0
      for (const page of doc.pages()) {
        try {
          for (const obj of page.objects()) {
            if (obj.type !== 'image') continue
            const imageObj = obj as {
              render: (o: { render: 'bitmap' }) => Promise<{ data: Uint8Array; width: number; height: number }>
            }
            const rendered = await imageObj.render({ render: 'bitmap' })
            const blob = await rgbaToBlob(rendered.data, rendered.width, rendered.height, {
              format: 'image/png',
              quality: 1,
            })
            out.push({ name: `embed-${String(++imgIndex).padStart(3, '0')}.png`, blob })
          }
        } finally {
          page.close()
        }
      }
    } finally {
      doc.destroy()
    }
  } finally {
    lib.destroy()
  }
  return out
}

export async function destroyPdfium() {
  lastBytes = null
  if (client) {
    await client.destroy()
    client = null
  }
}
