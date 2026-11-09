/** mammoth (DOCX reader) loaded on demand. */
async function loadMammoth() {
  const m = await import('mammoth')
  return ((m as unknown as { default?: typeof m }).default ?? m) as typeof import('mammoth')
}

/** The browser build reads `arrayBuffer`; under Node (unit tests) mammoth needs a `buffer`. */
function input(data: ArrayBuffer) {
  const NodeBuffer = (globalThis as { Buffer?: { from(a: ArrayBuffer): unknown } }).Buffer
  return (NodeBuffer ? { buffer: NodeBuffer.from(data) } : { arrayBuffer: data }) as never
}

export interface DocxHtmlResult {
  html: string
  warnings: string[]
}

/** DOCX → semantic HTML (headings, lists, tables, bold/italic, images inlined as data URIs). Unsanitized. */
export async function docxToHtml(data: ArrayBuffer): Promise<DocxHtmlResult> {
  const mammoth = await loadMammoth()
  const r = await mammoth.convertToHtml(input(data))
  return { html: r.value, warnings: r.messages.map((m) => m.message) }
}

export async function docxToText(data: ArrayBuffer): Promise<string> {
  const mammoth = await loadMammoth()
  const r = await mammoth.extractRawText(input(data))
  return r.value
}

export const DOCX_ACCEPT = '.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document'
export const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
