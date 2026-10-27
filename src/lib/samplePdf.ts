import { loadPdfLib } from './pdf'

/** Build a tiny one-page PDF titled "SimpleTools Sample" for PDF file tools. */
export async function loadSamplePdf(): Promise<File> {
  const { PDFDocument, StandardFonts, rgb } = await loadPdfLib()
  const doc = await PDFDocument.create()
  const page = doc.addPage([595.28, 841.89]) // A4
  const font = await doc.embedFont(StandardFonts.HelveticaBold)
  const body = await doc.embedFont(StandardFonts.Helvetica)
  page.drawText('SimpleTools Sample', { x: 72, y: 760, size: 24, font, color: rgb(0.39, 0.4, 0.95) })
  page.drawText('Offline-first demo PDF for local tools.', { x: 72, y: 720, size: 12, font: body, color: rgb(0.2, 0.2, 0.2) })
  page.drawText('https://github.com/linkxzhou/SimpleTools', { x: 72, y: 700, size: 10, font: body, color: rgb(0.4, 0.4, 0.4) })
  const bytes = await doc.save()
  return new File([bytes], 'simpletools-sample.pdf', { type: 'application/pdf' })
}
